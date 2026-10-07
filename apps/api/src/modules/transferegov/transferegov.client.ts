import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { parse as parseCsv } from 'csv-parse'
import { Readable } from 'stream'
import unzipper from 'unzipper'

export interface Page<T> {
  data: T[]
  total_pages: number
  total_items: number
  page_number: number
  page_size: number
}

export type OfficialRecord = Record<string, unknown>

export interface LegacyRecords {
  proposals: OfficialRecord[]
  partnerships: OfficialRecord[]
}

const LEGACY_DOWNLOADS = 'https://repositorio.dados.gov.br/seges/detru'
const LEGACY_SOURCE_TTL_MS = 24 * 60 * 60 * 1000
const LEGACY_DOWNLOAD_TIMEOUT_MS = 20 * 60 * 1000

@Injectable()
export class TransferegovClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private legacyCache?: { expiresAt: number; cnpjKey: string; records: Map<string, LegacyRecords> }
  private legacyLoad?: { cnpjKey: string; promise: Promise<Map<string, LegacyRecords>> }

  constructor(config: ConfigService) {
    this.baseUrl = config.get('TRANSFEREGOV_API_URL') ?? 'https://api-publica.transferegov.gestao.gov.br/parcerias'
    this.timeoutMs = Number(config.get('TRANSFEREGOV_TIMEOUT_MS') ?? 15000)
  }

  async proposalsByCnpj(cnpj: string): Promise<OfficialRecord[]> {
    return this.allPages('/proposta', { cnpj_ente_recebedor: cnpj })
  }

  async partnershipsByProposal(proposalId: string): Promise<OfficialRecord[]> {
    return this.allPages('/parceria', { id_proposta: proposalId })
  }

  async referenceDate(): Promise<Date | null> {
    const result = await this.request<{ data_ultima_atualizacao?: string }>('/data-atualizacao', {})
    return result.data_ultima_atualizacao ? new Date(result.data_ultima_atualizacao) : null
  }

  async legacyRecordsByCnpjs(cnpjs: string[]): Promise<Map<string, LegacyRecords>> {
    const normalizedCnpjs = [...new Set(cnpjs.map((cnpj) => cnpj.replace(/\D/g, '')).filter(Boolean))].sort()
    const cnpjKey = normalizedCnpjs.join(',')
    if (this.legacyCache && this.legacyCache.expiresAt > Date.now() && this.legacyCache.cnpjKey === cnpjKey) {
      return this.legacyCache.records
    }
    if (this.legacyLoad) {
      if (this.legacyLoad.cnpjKey === cnpjKey) return this.legacyLoad.promise
      await this.legacyLoad.promise.catch(() => undefined)
      return this.legacyRecordsByCnpjs(cnpjs)
    }
    const promise = this.loadLegacyRecords(normalizedCnpjs, cnpjKey)
    this.legacyLoad = { cnpjKey, promise }
    try {
      return await promise
    } finally {
      if (this.legacyLoad?.promise === promise) this.legacyLoad = undefined
    }
  }

  private async loadLegacyRecords(normalizedCnpjs: string[], cnpjKey: string): Promise<Map<string, LegacyRecords>> {

    const matches = new Set(normalizedCnpjs)
    const records = new Map(normalizedCnpjs.map((cnpj) => [cnpj, { proposals: [], partnerships: [] } as LegacyRecords]))
    const proponentIds = new Map<string, { cnpj: string; name: string }>()

    await this.readLegacyCsv('siconv_proponentes.csv.zip', (row) => {
      const cnpj = this.cnpjFrom(row.IDENTIF_PROPONENTE)
      const id = this.field(row, 'ID_PROPONENTE')
      if (cnpj && matches.has(cnpj) && id) proponentIds.set(id, { cnpj, name: this.field(row, 'NM_PROPONENTE') ?? '' })
    })

    if (!proponentIds.size) {
      this.legacyCache = { expiresAt: Date.now() + LEGACY_SOURCE_TTL_MS, cnpjKey, records }
      return records
    }

    const proposalsById = new Map<string, { cnpj: string; record: OfficialRecord }>()
    await this.readLegacyCsv('siconv_proposta.csv.zip', (row) => {
      const id = this.field(row, 'ID_PROPOSTA')
      if (!id) return
      const directCnpj = this.cnpjFrom(row.IDENTIF_PROPONENTE ?? row.CNPJ_PROPONENTE ?? row.cnpj_ente_recebedor)
      const proponentId = this.field(row, 'ID_PROPONENTE')
      const proponent = proponentId ? proponentIds.get(proponentId) : undefined
      const cnpj = directCnpj && matches.has(directCnpj) ? directCnpj : proponent?.cnpj
      if (!cnpj) return
      const proposal: OfficialRecord = {
        id_proposta: id,
        id_programa: this.field(row, 'ID_PROGRAMA'),
        nr_proposta: this.field(row, 'NR_PROPOSTA'),
        ano_proposta: this.field(row, 'ANO_PROP'),
        ds_objeto: this.field(row, 'OBJETO_PROPOSTA'),
        nm_ente_recebedor: this.field(row, 'NM_PROPONENTE') ?? proponent?.name,
        cnpj_ente_recebedor: cnpj,
        nm_unidade_gestora: this.field(row, 'DESC_ORGAO'),
        situacao_proposta: this.field(row, 'SIT_PROPOSTA'),
        nr_vlr_total: this.field(row, 'VL_GLOBAL_PROP'),
        nr_vlr_repasse: this.field(row, 'VL_REPASSE_PROP'),
        nr_vlr_contrapartida: this.field(row, 'VL_CONTRAPARTIDA_PROP'),
        dh_proposta: this.field(row, 'DIA_PROPOSTA'),
        dh_inicio_vigencia: this.field(row, 'DIA_INIC_VIGENCIA_PROPOSTA'),
        dh_fim_vigencia: this.field(row, 'DIA_FIM_VIGENCIA_PROPOSTA'),
      }
      proposalsById.set(id, { cnpj, record: proposal })
      records.get(cnpj)?.proposals.push(proposal)
    })

    if (!proposalsById.size) {
      this.legacyCache = { expiresAt: Date.now() + LEGACY_SOURCE_TTL_MS, cnpjKey, records }
      return records
    }

    await this.readLegacyCsv('siconv_convenio.csv.zip', (row) => {
      const proposalId = this.field(row, 'ID_PROPOSTA')
      const proposal = proposalId ? proposalsById.get(proposalId) : undefined
      const number = this.field(row, 'NR_CONVENIO')
      if (!proposal || !number) return
      const agreement: OfficialRecord = {
        id_parceria: number,
        id_proposta: proposalId,
        cd_parceria: number,
        tp_origem: 'SICONV',
        ds_objeto: proposal.record.ds_objeto,
        nm_ente_recebedor: proposal.record.nm_ente_recebedor,
        cnpj_ente_recebedor: proposal.cnpj,
        nm_unidade_gestora: proposal.record.nm_unidade_gestora,
        in_situacao_parceria: this.field(row, 'SIT_CONVENIO') ?? this.field(row, 'SUBSITUACAO_CONV'),
        dh_assinatura: this.field(row, 'DIA_ASSIN_CONV'),
        dh_inicio_vigencia: this.field(row, 'DIA_INIC_VIGENC_CONV'),
        dh_fim_vigencia: this.field(row, 'DIA_FIM_VIGENC_CONV'),
        nr_vlr_total: this.field(row, 'VL_GLOBAL_CONV'),
        nr_vlr_repasse: this.field(row, 'VL_REPASSE_CONV'),
        nr_vlr_contrapartida: this.field(row, 'VL_CONTRAPARTIDA_CONV'),
      }
      records.get(proposal.cnpj)?.partnerships.push(agreement)
    })

    this.legacyCache = { expiresAt: Date.now() + LEGACY_SOURCE_TTL_MS, cnpjKey, records }
    return records
  }

  private async readLegacyCsv(file: string, onRow: (row: Record<string, string>) => void) {
    const response = await fetch(`${LEGACY_DOWNLOADS}/${file}`, {
      headers: { accept: 'application/zip', 'user-agent': 'Semevo-Transferegov/1.0' },
      signal: AbortSignal.timeout(Math.max(this.timeoutMs, LEGACY_DOWNLOAD_TIMEOUT_MS)),
    })
    if (!response.ok || !response.body) {
      throw new ServiceUnavailableException(`NÃ£o foi possÃ­vel baixar ${file} da base oficial de DiscricionÃ¡rias e Legais (HTTP ${response.status}).`)
    }

    let foundCsv = false
    const archive = Readable.fromWeb(response.body as never).pipe(unzipper.Parse({ forceStream: true }))
    for await (const entry of archive) {
      if (entry.type !== 'File' || !entry.path.toLowerCase().endsWith('.csv')) {
        entry.autodrain()
        continue
      }
      foundCsv = true
      const parsed = entry.pipe(parseCsv({ bom: true, columns: true, delimiter: ';', relax_column_count: true, skip_empty_lines: true }))
      for await (const row of parsed) onRow(row as Record<string, string>)
    }
    if (!foundCsv) throw new ServiceUnavailableException(`O arquivo oficial ${file} nÃ£o contÃ©m CSV legÃ­vel.`)
  }

  private field(row: Record<string, string>, name: string): string | null {
    const value = row[name] ?? row[name.toLowerCase()]
    return value?.trim() || null
  }

  private cnpjFrom(value: unknown): string | null {
    if (value === undefined || value === null) return null
    const cnpj = String(value).replace(/\D/g, '')
    return /^\d{14}$/.test(cnpj) ? cnpj : null
  }

  private async allPages(path: string, filters: Record<string, string>): Promise<OfficialRecord[]> {
    const output: OfficialRecord[] = []
    let page = 1
    let totalPages = 1
    do {
      const response = await this.request<Page<OfficialRecord>>(path, {
        ...filters,
        pagina: String(page),
        tamanho_da_pagina: '200',
      })
      if (!Array.isArray(response.data) || typeof response.total_pages !== 'number') {
        throw new ServiceUnavailableException('O formato da fonte oficial mudou; a sincronização foi interrompida com segurança.')
      }
      output.push(...response.data)
      totalPages = response.total_pages
      page += 1
    } while (page <= totalPages)
    return output
  }

  private async request<T>(path: string, query: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value))
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: { accept: 'application/json', 'user-agent': 'Semevo-Transferegov/1.0' },
          signal: AbortSignal.timeout(this.timeoutMs),
        })
        if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`)
        if (!response.ok) throw new ServiceUnavailableException(`Fonte oficial respondeu HTTP ${response.status}.`)
        return await response.json() as T
      } catch (error) {
        lastError = error
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
      }
    }
    throw new ServiceUnavailableException(`Não foi possível consultar o Transferegov após tentativas limitadas: ${String((lastError as Error)?.message ?? lastError)}`)
  }
}

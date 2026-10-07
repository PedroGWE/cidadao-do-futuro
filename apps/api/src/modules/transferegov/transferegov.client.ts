import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface Page<T> {
  data: T[]
  total_pages: number
  total_items: number
  page_number: number
  page_size: number
}

export type OfficialRecord = Record<string, unknown>

@Injectable()
export class TransferegovClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number

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

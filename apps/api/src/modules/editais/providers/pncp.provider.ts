import { Injectable, Logger } from '@nestjs/common'
import type { EditalDTO, SearchEditaisQuery } from '@cidadao/shared'
import type { EditalProvider, ProviderContext } from './edital-provider'

const BASE_URL = 'https://pncp.gov.br/api/consulta'
const PAGE_SIZE = 50
const TIMEOUT_MS = 8000
const RETRY_DELAYS_MS = [500, 1500]

/** Payload (parcial) da API de consulta do PNCP. */
interface PncpItem {
  numeroControlePNCP: string
  objetoCompra?: string
  informacaoComplementar?: string
  valorTotalEstimado?: number
  dataAberturaProposta?: string
  dataEncerramentoProposta?: string
  modalidadeNome?: string
  linkSistemaOrigem?: string
  orgaoEntidade?: { razaoSocial?: string; cnpj?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
}

/**
 * Provider do PNCP — Portal Nacional de Contratações Públicas.
 * Consome a API pública de consulta (editais com recebimento de
 * propostas em aberto). Sem autenticação.
 */
@Injectable()
export class PncpProvider implements EditalProvider {
  readonly fonte = 'PNCP'
  private readonly logger = new Logger(PncpProvider.name)

  private async fetchJson(url: string): Promise<unknown> {
    let lastError: unknown
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]))
      }
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (res.status === 204) return null
        if (res.status === 429 || res.status >= 500) {
          lastError = new Error(`PNCP HTTP ${res.status}`)
          continue // retry com backoff
        }
        if (!res.ok) throw new Error(`PNCP HTTP ${res.status}`)
        return await res.json()
      } catch (err) {
        lastError = err
      } finally {
        clearTimeout(timer)
      }
    }
    throw lastError
  }

  private toDTO(item: PncpItem): EditalDTO {
    const titulo = (item.objetoCompra ?? 'Edital sem título').slice(0, 300)
    return {
      externalId: item.numeroControlePNCP,
      fonte: 'PNCP',
      titulo,
      orgao: item.orgaoEntidade?.razaoSocial ?? null,
      descricao: item.informacaoComplementar || item.objetoCompra || null,
      valorTotal: item.valorTotalEstimado ?? null,
      dataAbertura: item.dataAberturaProposta ?? null,
      dataEncerramento: item.dataEncerramentoProposta ?? null,
      abrangencia: null, // PNCP não classifica abrangência
      uf: item.unidadeOrgao?.ufSigla ?? null,
      areaTematica: item.modalidadeNome ?? null,
      linkOficial:
        item.linkSistemaOrigem ||
        `https://pncp.gov.br/app/editais?q=${encodeURIComponent(item.numeroControlePNCP)}`,
      requisitosDocumentais: [], // PNCP não estrutura requisitos; ficam nos editais manuais
    }
  }

  async search(filters: SearchEditaisQuery, _ctx: ProviderContext): Promise<EditalDTO[]> {
    // janela: propostas abertas até encerra_ate (ou +90 dias)
    const end = filters.encerra_ate ? new Date(filters.encerra_ate) : new Date()
    if (!filters.encerra_ate) end.setDate(end.getDate() + 90)
    const dataFinal = end.toISOString().slice(0, 10).replace(/-/g, '')

    const params = new URLSearchParams({
      dataFinal,
      pagina: '1',
      tamanhoPagina: String(PAGE_SIZE),
    })
    if (filters.uf) params.set('uf', filters.uf)

    const json = (await this.fetchJson(
      `${BASE_URL}/v1/contratacoes/proposta?${params.toString()}`,
    )) as { data?: PncpItem[] } | null

    const items = json?.data ?? []
    this.logger.log(`PNCP retornou ${items.length} editais`)
    return items.filter((i) => i.numeroControlePNCP).map((i) => this.toDTO(i))
  }

  async getById(externalId: string, _ctx: ProviderContext): Promise<EditalDTO | null> {
    // numeroControlePNCP: "{cnpj}-1-{sequencial}/{ano}"
    const match = externalId.match(/^(\d{14})-\d+-(\d+)\/(\d{4})$/)
    if (!match) return null
    const [, cnpj, seq, ano] = match

    try {
      const json = (await this.fetchJson(
        `${BASE_URL}/v1/orgaos/${cnpj}/compras/${ano}/${Number(seq)}`,
      )) as PncpItem | null
      return json?.numeroControlePNCP ? this.toDTO(json) : null
    } catch (err) {
      this.logger.warn(`Detalhe PNCP indisponível para ${externalId}: ${(err as Error).message}`)
      return null
    }
  }
}

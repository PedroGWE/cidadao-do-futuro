import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1'
const TRANSPARENCIA_BASE = 'https://api.portaldatransparencia.gov.br/api-de-dados'

@Injectable()
export class PublicDataService {
  private readonly transparencyTimeoutMs: number

  constructor(private readonly config: ConfigService) {
    const configuredTimeout = Number(config.get('PORTAL_TRANSPARENCIA_TIMEOUT_MS') ?? 15000)
    this.transparencyTimeoutMs = Number.isFinite(configuredTimeout)
      ? Math.min(Math.max(configuredTimeout, 1000), 30000)
      : 15000
  }

  async states() {
    return this.fetchJson(`${IBGE_BASE}/localidades/estados?orderBy=nome`)
  }

  async municipalities(uf?: string) {
    const state = uf?.trim().toUpperCase()
    if (state && !/^[A-Z]{2}$/.test(state)) throw new BadRequestException('Informe uma UF válida.')
    const url = state
      ? `${IBGE_BASE}/localidades/estados/${encodeURIComponent(state)}/municipios?orderBy=nome`
      : `${IBGE_BASE}/localidades/municipios?orderBy=nome`
    return this.fetchJson(url)
  }

  async indicators(aggregateId: string, locality: string) {
    if (!/^\d{1,6}$/.test(aggregateId) || !/^N[1-7](?:\d{7})?$/.test(locality)) {
      throw new BadRequestException('Agregado ou código de localidade inválido.')
    }
    return this.fetchJson(`https://servicodados.ibge.gov.br/api/v3/agregados/${aggregateId}/periodos/-6/variaveis?localidades=${encodeURIComponent(locality)}`)
  }

  async sanctions(cnpj: string) {
    const token = this.config.get<string>('PORTAL_TRANSPARENCIA_TOKEN')
    if (!token) throw new ServiceUnavailableException('Integração do Portal da Transparência não configurada. Cadastre o token oficial no ambiente da API.')
    const normalized = cnpj.replace(/\D/g, '')
    if (!/^\d{14}$/.test(normalized)) throw new BadRequestException('Informe um CNPJ válido com 14 dígitos.')

    const endpoints = ['ceis', 'cnep', 'cepim'] as const
    const results = await Promise.all(endpoints.map(async (source) => {
      const url = new URL(`${TRANSPARENCIA_BASE}/${source}`)
      url.searchParams.set('cnpjSancionado', normalized)
      url.searchParams.set('pagina', '1')
      try {
        const data = await this.fetchJson(url.toString(), { 'chave-api-dados': token }, this.transparencyTimeoutMs)
        if (!Array.isArray(data)) throw new ServiceUnavailableException('Resposta da fonte em formato inesperado.')
        return { source: source.toUpperCase(), status: 'OK' as const, records: data, error: null }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao consultar a fonte.'
        return { source: source.toUpperCase(), status: 'UNAVAILABLE' as const, records: [], error: message }
      }
    }))
    return { cnpj: normalized, consulted_at: new Date().toISOString(), partial: results.some((result) => result.status !== 'OK'), results }
  }

  private async fetchJson(url: string, headers: Record<string, string> = {}, timeoutMs = 12_000) {
    let lastStatus: number | null = null
    let networkFailed = false
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: Response
      try {
        response = await fetch(url, {
          headers: { Accept: 'application/json', ...headers },
          signal: AbortSignal.timeout(timeoutMs),
        })
      } catch {
        networkFailed = true
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          continue
        }
        throw new ServiceUnavailableException('Tempo limite ou falha de rede ao consultar a fonte externa.')
      }
      if (response.ok) return response.json()
      lastStatus = response.status
      if (![429, 502, 503, 504].includes(response.status) || attempt === 1) break
      const retryAfter = Number(response.headers.get('retry-after'))
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 3000) : 500
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
    if (lastStatus !== null) throw new ServiceUnavailableException(`Portal da Transparência indisponível (HTTP ${lastStatus}) após nova tentativa.`)
    throw new ServiceUnavailableException(networkFailed ? 'Não foi possível consultar a fonte externa.' : 'Fonte externa indisponível.')
  }
}

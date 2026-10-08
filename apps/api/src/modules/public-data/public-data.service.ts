import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1'
const TRANSPARENCIA_BASE = 'https://api.portaldatransparencia.gov.br/api-de-dados'

@Injectable()
export class PublicDataService {
  constructor(private readonly config: ConfigService) {}

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
      const data = await this.fetchJson(url.toString(), { 'chave-api-dados': token })
      return { source: source.toUpperCase(), records: Array.isArray(data) ? data : [] }
    }))
    return { cnpj: normalized, consulted_at: new Date().toISOString(), results }
  }

  private async fetchJson(url: string, headers: Record<string, string> = {}) {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(12_000),
    })
    if (!response.ok) throw new ServiceUnavailableException(`Fonte externa indisponível (HTTP ${response.status}).`)
    return response.json()
  }
}

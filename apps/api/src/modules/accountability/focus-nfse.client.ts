import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common'
import { isValidCNPJ, onlyDigits } from '@cidadao/shared'

export type FocusTenantConfig = {
  token: string
  cnpj: string
  municipio_ibge: string
  environment: 'HOMOLOGACAO' | 'PRODUCAO'
  webhook_secret?: string
}

export type FocusResult = {
  status?: string
  ref?: string
  cnpj_prestador?: string
  chave_nfse?: string
  numero?: string | number
  numero_nfse?: string | number
  caminho_xml_nota_fiscal?: string
  caminho_xml?: string
  caminho_danfse?: string
  caminho_danfse_pdf?: string
  mensagem?: string
  mensagem_sefaz?: string
  erros?: Array<{ mensagem?: string; descricao?: string }>
}

export class FocusRejectedError extends Error {}

/** Tokens só existem no processo servidor, indexados por tenant; nunca são enviados ao navegador. */
export class FocusNfseClient {
  config(tenantId: string): FocusTenantConfig | null {
    let all: Record<string, unknown>
    try { all = JSON.parse(process.env.NFSE_FOCUS_TENANTS_JSON || '{}') }
    catch { throw new ServiceUnavailableException('Configuração fiscal inválida no servidor') }
    if (!all || typeof all !== 'object' || Array.isArray(all)) throw new ServiceUnavailableException('Configuração fiscal inválida no servidor')
    const raw = all[tenantId]
    if (!raw || typeof raw !== 'object') return null
    const value = raw as Record<string, unknown>
    if (typeof value.token !== 'string' || !value.token ||
      typeof value.cnpj !== 'string' || !isValidCNPJ(value.cnpj) ||
      typeof value.municipio_ibge !== 'string' || !/^\d{7}$/.test(value.municipio_ibge) ||
      !['HOMOLOGACAO', 'PRODUCAO'].includes(String(value.environment))) {
      throw new ServiceUnavailableException('Configuração fiscal incompleta no servidor')
    }
    if (value.environment === 'PRODUCAO' && process.env.NFSE_PRODUCTION_ENABLED !== 'true') {
      throw new ServiceUnavailableException('Emissão em produção ainda não foi habilitada')
    }
    if (value.webhook_secret != null && (typeof value.webhook_secret !== 'string' || value.webhook_secret.length < 32)) {
      throw new ServiceUnavailableException('Segredo do webhook fiscal deve ter ao menos 32 caracteres')
    }
    return { token: value.token, cnpj: onlyDigits(value.cnpj), municipio_ibge: value.municipio_ibge,
      environment: value.environment as FocusTenantConfig['environment'], webhook_secret: value.webhook_secret as string | undefined }
  }

  private base(config: FocusTenantConfig) {
    return config.environment === 'PRODUCAO' ? 'https://api.focusnfe.com.br' : 'https://homologacao.focusnfe.com.br'
  }

  async issue(config: FocusTenantConfig, reference: string, payload: Record<string, unknown>): Promise<FocusResult> {
    return this.request(config, 'POST', `/v2/nfsen?ref=${encodeURIComponent(reference)}`, payload)
  }

  async get(config: FocusTenantConfig, reference: string): Promise<FocusResult> {
    return this.request(config, 'GET', `/v2/nfsen/${encodeURIComponent(reference)}`)
  }

  async cancel(config: FocusTenantConfig, reference: string, justification: string): Promise<FocusResult> {
    return this.request(config, 'DELETE', `/v2/nfsen/${encodeURIComponent(reference)}`, { justificativa: justification })
  }

  private async request(config: FocusTenantConfig, method: 'GET' | 'POST' | 'DELETE', path: string, body?: object): Promise<FocusResult> {
    const response = await fetch(this.base(config) + path, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.token}:`).toString('base64')}`,
        Accept: 'application/json',
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
      redirect: 'manual',
    })
    const raw = (await response.text()).slice(0, 15000)
    let data: FocusResult = {}
    try { data = JSON.parse(raw) as FocusResult } catch { /* resposta sem JSON */ }
    if (!response.ok) {
      const detail = data.erros?.map((x) => x.mensagem ?? x.descricao).filter(Boolean).join('; ') || data.mensagem || `HTTP ${response.status}`
      if ([400, 422].includes(response.status)) throw new FocusRejectedError(String(detail).slice(0, 500))
      throw new BadGatewayException('Serviço fiscal indisponível; consulte o estado da nota antes de tentar novamente')
    }
    return data
  }

  async download(config: FocusTenantConfig, path: string): Promise<Buffer> {
    const url = new URL(path, this.base(config))
    const allowed = [new URL(this.base(config)).hostname, 'focusnfe.s3.sa-east-1.amazonaws.com', 'focusnfe.s3.amazonaws.com']
    if (url.protocol !== 'https:' || !allowed.includes(url.hostname) || url.port || url.username || url.password) {
      throw new BadGatewayException('Endereço de documento fiscal inesperado')
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'manual',
      headers: url.hostname === new URL(this.base(config)).hostname ? { Authorization: `Basic ${Buffer.from(`${config.token}:`).toString('base64')}` } : {} })
    if (!response.ok || Number(response.headers.get('content-length') ?? 0) > 10_000_000) {
      throw new BadGatewayException('Não foi possível arquivar o documento fiscal')
    }
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length > 10_000_000) throw new BadGatewayException('Documento fiscal excede 10 MB')
    return bytes
  }
}

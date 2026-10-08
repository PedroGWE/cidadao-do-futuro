import { FocusNfseClient } from './focus-nfse.client'

const client = new FocusNfseClient()
const tenant = 'tenant-a'
const config = { token: 'test-secret', cnpj: '11222333000181', municipio_ibge: '5300108', environment: 'HOMOLOGACAO' }

beforeEach(() => {
  process.env.NFSE_FOCUS_TENANTS_JSON = JSON.stringify({ [tenant]: config })
  delete process.env.NFSE_PRODUCTION_ENABLED
})
afterEach(() => { delete process.env.NFSE_FOCUS_TENANTS_JSON; jest.restoreAllMocks() })

describe('NFS-e: credenciais e provedor', () => {
  it('separa credenciais por instituto e impede produção sem habilitação explícita', () => {
    expect(client.config(tenant)?.cnpj).toBe(config.cnpj)
    expect(client.config('outro-tenant')).toBeNull()
    process.env.NFSE_FOCUS_TENANTS_JSON = JSON.stringify({ [tenant]: { ...config, environment: 'PRODUCAO' } })
    expect(() => client.config(tenant)).toThrow('produção')
  })

  it('envia a referência única com autenticação só no servidor e consulta separadamente', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ status: 'processando_autorizacao' }), { status: 202 }))
    const issuer = client.config(tenant)!
    await client.issue(issuer, 'amparo-ref-123', { valor_servico: 100 })
    expect(fetchMock).toHaveBeenCalledWith('https://homologacao.focusnfe.com.br/v2/nfsen?ref=amparo-ref-123', expect.objectContaining({
      method: 'POST', headers: expect.objectContaining({ Authorization: `Basic ${Buffer.from('test-secret:').toString('base64')}` }),
    }))
    await client.get(issuer, 'amparo-ref-123')
    expect(fetchMock).toHaveBeenLastCalledWith('https://homologacao.focusnfe.com.br/v2/nfsen/amparo-ref-123', expect.objectContaining({ method: 'GET' }))
    await client.cancel(issuer, 'amparo-ref-123', 'Emissão realizada com dados incorretos')
    expect(fetchMock).toHaveBeenLastCalledWith('https://homologacao.focusnfe.com.br/v2/nfsen/amparo-ref-123', expect.objectContaining({
      method: 'DELETE', body: JSON.stringify({ justificativa: 'Emissão realizada com dados incorretos' }),
    }))
  })

  it('recusa download por domínio externo, evitando SSRF', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch')
    await expect(client.download(client.config(tenant)!, 'https://exemplo.invalid/arquivo.xml')).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

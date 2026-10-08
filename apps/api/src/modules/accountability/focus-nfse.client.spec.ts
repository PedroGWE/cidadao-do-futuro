import { FocusNfseClient } from './focus-nfse.client'

const prisma = { nfseIntegration: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn() } }
const client = new FocusNfseClient(prisma as never)
const tenant = 'tenant-a'
const config = { token: 'test-secret', cnpj: '11222333000181', municipio_ibge: '5300108', environment: 'HOMOLOGACAO' }

beforeEach(() => {
  process.env.NFSE_FOCUS_TENANTS_JSON = JSON.stringify({ [tenant]: config })
  delete process.env.NFSE_PRODUCTION_ENABLED
})
afterEach(() => { delete process.env.NFSE_FOCUS_TENANTS_JSON; jest.restoreAllMocks() })

describe('NFS-e: credenciais e provedor', () => {
  it('separa credenciais por instituto e impede produção sem habilitação explícita', async () => {
    expect((await client.config(tenant))?.cnpj).toBe(config.cnpj)
    expect(await client.config('outro-tenant')).toBeNull()
    process.env.NFSE_FOCUS_TENANTS_JSON = JSON.stringify({ [tenant]: { ...config, environment: 'PRODUCAO' } })
    await expect(client.config(tenant)).rejects.toThrow('produção')
  })

  it('envia a referência única com autenticação só no servidor e consulta separadamente', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ status: 'processando_autorizacao' }), { status: 202 }))
    const issuer = (await client.config(tenant))!
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
    await expect(client.download((await client.config(tenant))!, 'https://exemplo.invalid/arquivo.xml')).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('salva token e webhook criptografados sem persistir os segredos em texto puro', async () => {
    process.env.NFSE_CREDENTIALS_KEY = 'chave-mestra-de-testes-com-mais-de-32-caracteres'
    prisma.nfseIntegration.upsert.mockResolvedValue({ id: 'integration-1' })
    await client.saveConfig(tenant, 'user-1', { ...config, environment: 'HOMOLOGACAO', webhook_secret: 'segredo-webhook-com-mais-de-trinta-e-dois-caracteres' })
    const args = prisma.nfseIntegration.upsert.mock.calls[0][0]
    expect(args.create.token_encrypted).not.toContain(config.token)
    expect(args.create.webhook_secret_encrypted).not.toContain('segredo-webhook')
    expect(args.create.token_encrypted).toMatch(/^v1\./)
    delete process.env.NFSE_CREDENTIALS_KEY
  })
})

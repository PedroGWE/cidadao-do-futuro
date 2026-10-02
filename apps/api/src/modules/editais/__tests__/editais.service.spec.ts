import type { EditalDTO } from '@cidadao/shared'
import { EditaisService } from '../editais.service'
import { InMemoryCacheService } from '../cache/cache.service'
import type { EditalProvider } from '../providers/edital-provider'

const edital = (over: Partial<EditalDTO>): EditalDTO => ({
  externalId: 'e1',
  fonte: 'PNCP',
  titulo: 'Edital Teste',
  orgao: 'Prefeitura',
  descricao: null,
  valorTotal: 1000,
  dataAbertura: null,
  dataEncerramento: '2027-01-01T00:00:00Z',
  abrangencia: null,
  uf: 'SP',
  areaTematica: 'Educação',
  linkOficial: null,
  requisitosDocumentais: [],
  ...over,
})

function makePrisma(over: Record<string, any> = {}) {
  return {
    organizationProfile: {
      findUnique: jest.fn().mockResolvedValue({ abrangencia: 'ESTADUAL', uf: 'SP', areas_atuacao: ['educação'] }),
    },
    institutionalDocType: { findMany: jest.fn().mockResolvedValue([]) },
    savedEdital: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockImplementation(({ create }: any) => Promise.resolve(create)),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    edital: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    ...over,
  }
}

const documentsMock = { refreshExpired: jest.fn().mockResolvedValue(undefined) }

function makeService(providers: EditalProvider[], prisma = makePrisma()) {
  const cache = new InMemoryCacheService()
  const service = new EditaisService(prisma as any, documentsMock as any, cache, providers)
  return { service, cache, prisma }
}

describe('EditaisService.search — cache e resiliência', () => {
  it('segunda busca idêntica não chama o provider (cache hit)', async () => {
    const searchFn = jest.fn().mockResolvedValue([edital({})])
    const provider: EditalProvider = { fonte: 'PNCP', search: searchFn, getById: jest.fn() }
    const { service } = makeService([provider])

    await service.search('t1', { page: 1 } as any)
    await service.search('t1', { page: 1 } as any)

    expect(searchFn).toHaveBeenCalledTimes(1)
  })

  it('cache é isolado por tenant', async () => {
    const searchFn = jest.fn().mockResolvedValue([edital({})])
    const provider: EditalProvider = { fonte: 'PNCP', search: searchFn, getById: jest.fn() }
    const { service } = makeService([provider])

    await service.search('t1', { page: 1 } as any)
    await service.search('t2', { page: 1 } as any)

    expect(searchFn).toHaveBeenCalledTimes(2)
  })

  it('queda do provider não derruba a busca: usa último resultado bom e sinaliza', async () => {
    let calls = 0
    const provider: EditalProvider = {
      fonte: 'PNCP',
      search: jest.fn().mockImplementation(() => {
        calls += 1
        if (calls === 1) return Promise.resolve([edital({ titulo: 'Do cache antigo' })])
        return Promise.reject(new Error('PNCP fora do ar'))
      }),
      getById: jest.fn(),
    }
    const { service, cache } = makeService([provider])

    await service.search('t1', { page: 1 } as any)
    // expira o cache fresco, mantém o stale
    await cache.set('__force_expire__', null, 0)
    const key = (service as any).searchCacheKey('t1', { page: 1 })
    await cache.set(key, null as any, 0) // invalida fresh

    const res = await service.search('t1', { page: 1 } as any)

    expect(res.dadosDesatualizados).toBe(true)
    expect(res.data[0]?.titulo).toBe('Do cache antigo')
  })

  it('falha total sem cache retorna vazio sinalizado, sem lançar erro', async () => {
    const provider: EditalProvider = {
      fonte: 'PNCP',
      search: jest.fn().mockRejectedValue(new Error('down')),
      getById: jest.fn(),
    }
    const { service } = makeService([provider])

    const res = await service.search('t1', { page: 1 } as any)

    expect(res.data).toEqual([])
    expect(res.dadosDesatualizados).toBe(true)
  })

  it('agrega múltiplos providers, aplica score e ordena por matchScore', async () => {
    const pncp: EditalProvider = {
      fonte: 'PNCP',
      search: jest.fn().mockResolvedValue([edital({ externalId: 'ruim', uf: 'RJ', areaTematica: 'Obras' })]),
      getById: jest.fn(),
    }
    const manual: EditalProvider = {
      fonte: 'MANUAL',
      search: jest.fn().mockResolvedValue([
        edital({ externalId: 'bom', fonte: 'MANUAL', abrangencia: 'ESTADUAL', uf: 'SP', areaTematica: 'Educação' }),
      ]),
      getById: jest.fn(),
    }
    const { service } = makeService([pncp, manual])

    const res = await service.search('t1', { page: 1 } as any)

    expect(res.total).toBe(2)
    expect(res.data[0].externalId).toBe('bom')
    expect(res.data[0].matchScore).toBe(100)
    expect(res.data[0].motivos.length).toBeGreaterThan(0)
  })

  it('filtra por texto, uf e prazo', async () => {
    const provider: EditalProvider = {
      fonte: 'PNCP',
      search: jest.fn().mockResolvedValue([
        edital({ externalId: 'a', titulo: 'Oficinas de Música', uf: 'SP', dataEncerramento: '2026-08-01T00:00:00Z' }),
        edital({ externalId: 'b', titulo: 'Reforma de Praça', uf: 'RJ', dataEncerramento: '2026-08-01T00:00:00Z' }),
        edital({ externalId: 'c', titulo: 'Música na Escola', uf: 'SP', dataEncerramento: '2026-12-01T00:00:00Z' }),
      ]),
      getById: jest.fn(),
    }
    const { service } = makeService([provider])

    const res = await service.search('t1', {
      q: 'musica',
      uf: 'SP',
      encerra_ate: '2026-09-01',
      page: 1,
    } as any)

    expect(res.data.map((e) => e.externalId)).toEqual(['a'])
  })
})

describe('EditaisService.buildChecklist', () => {
  it('cruza requisitos com documentos do tenant refletindo o status real', async () => {
    const prisma = makePrisma({
      institutionalDocType: {
        findMany: jest.fn().mockResolvedValue([
          { id: 't1', name: 'Certidão negativa do Tribunal de Contas Estadual', documents: [{ status: 'VALIDO' }] },
          { id: 't2', name: 'Comprovante de residência', documents: [{ status: 'VENCIDO' }] },
          { id: 't3', name: 'Currículo', documents: [] },
        ]),
      },
    })
    const { service } = makeService([], prisma)

    const checklist = await service.buildChecklist('t1', [
      'Certidão negativa do Tribunal de Contas Estadual',
      'comprovante de residencia',
      'Currículo',
      'Alvará de funcionamento',
    ])

    expect(checklist).toEqual([
      expect.objectContaining({ status: 'VALIDO', doc_type_id: 't1' }),
      expect.objectContaining({ status: 'VENCIDO', doc_type_id: 't2' }),
      expect.objectContaining({ status: 'PENDENTE', doc_type_id: 't3' }),
      expect.objectContaining({ status: 'NAO_MAPEADO', doc_type_id: null }),
    ])
  })
})

describe('EditaisService.saved — funil', () => {
  it('salvar é idempotente por tenant+ref (upsert)', async () => {
    const { service, prisma } = makeService([])

    await service.saveEdital('t1', {
      fonte: 'PNCP',
      external_id: 'abc',
      titulo: 'Edital X',
    } as any)

    const args = prisma.savedEdital.upsert.mock.calls[0][0]
    expect(args.where).toEqual({
      tenant_id_edital_ref: { tenant_id: 't1', edital_ref: 'PNCP:abc' },
    })
  })

  it('patch nega edital salvo de outro tenant', async () => {
    const { service } = makeService([])
    await expect(service.patchSaved('t2', 'id-do-t1', { status: 'INSCRITO' } as any)).rejects.toThrow(
      'Edital salvo não encontrado',
    )
  })
})

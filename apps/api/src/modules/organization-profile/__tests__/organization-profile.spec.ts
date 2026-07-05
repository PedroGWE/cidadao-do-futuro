import { OrganizationProfileService } from '../organization-profile.service'

function makeMocks(opts: {
  profile?: Record<string, unknown> | null
  requiredTypes?: { name: string; documents: { status: string }[] }[]
}) {
  const prisma = {
    organizationProfile: {
      findUnique: jest.fn().mockResolvedValue(opts.profile ?? null),
      upsert: jest.fn().mockResolvedValue({}),
    },
    institutionalDocType: {
      findMany: jest.fn().mockResolvedValue(opts.requiredTypes ?? []),
    },
  }
  const documents = {
    ensureDefaults: jest.fn().mockResolvedValue(undefined),
    refreshExpired: jest.fn().mockResolvedValue(undefined),
  }
  return { prisma, documents }
}

const FULL_PROFILE = {
  nome_organizacao: 'Cidadão do Futuro',
  tipo_organizacao: 'OSC',
  documento: '11222333000181',
  abrangencia: 'MUNICIPAL',
  areas_atuacao: ['educação'],
  municipio: 'São Paulo',
  uf: 'SP',
  telefone: '11999990000',
  email: 'contato@ong.org',
}

describe('OrganizationProfileService.get — completude', () => {
  it('perfil inexistente = 0% com todos os campos pendentes', async () => {
    const { prisma, documents } = makeMocks({ profile: null })
    const service = new OrganizationProfileService(prisma as any, documents as any)

    const res = await service.get('t1')

    expect(res.percentualCompletude).toBe(0)
    expect(res.pendencias.campos).toHaveLength(9)
  })

  it('perfil completo sem documentos obrigatórios = 100%', async () => {
    const { prisma, documents } = makeMocks({ profile: FULL_PROFILE })
    const service = new OrganizationProfileService(prisma as any, documents as any)

    const res = await service.get('t1')

    expect(res.percentualCompletude).toBe(100)
    expect(res.pendencias.campos).toHaveLength(0)
    expect(res.pendencias.documentos).toHaveLength(0)
  })

  it('documentos obrigatórios pendentes/vencidos reduzem a completude', async () => {
    const { prisma, documents } = makeMocks({
      profile: FULL_PROFILE,
      requiredTypes: [
        { name: 'Certidão A', documents: [{ status: 'VALIDO' }] },
        { name: 'Certidão B', documents: [{ status: 'VENCIDO' }] },
        { name: 'Certidão C', documents: [] }, // nunca enviado
      ],
    })
    const service = new OrganizationProfileService(prisma as any, documents as any)

    const res = await service.get('t1')

    // 9 campos + 1 doc válido de 12 itens = 10/12
    expect(res.percentualCompletude).toBe(Math.round((10 / 12) * 100))
    expect(res.pendencias.documentos).toEqual(['Certidão B', 'Certidão C'])
  })

  it('consulta documentos obrigatórios apenas do tenant autenticado', async () => {
    const { prisma, documents } = makeMocks({ profile: null })
    const service = new OrganizationProfileService(prisma as any, documents as any)

    await service.get('tenant-x')

    expect(prisma.institutionalDocType.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { required: true, category: { tenant_id: 'tenant-x' } },
      }),
    )
  })
})

describe('OrganizationProfileService.upsert', () => {
  it('deriva tipo_documento pelo tamanho e faz upsert por tenant', async () => {
    const { prisma, documents } = makeMocks({ profile: FULL_PROFILE })
    const service = new OrganizationProfileService(prisma as any, documents as any)

    await service.upsert('t1', { ...FULL_PROFILE, documento: '52998224725' } as any)

    const args = prisma.organizationProfile.upsert.mock.calls[0][0]
    expect(args.where).toEqual({ tenant_id: 't1' })
    expect(args.create.tipo_documento).toBe('CPF')
    expect(args.create.tenant_id).toBe('t1')
  })
})

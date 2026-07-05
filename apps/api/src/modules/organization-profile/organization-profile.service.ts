import { Injectable } from '@nestjs/common'
import { OrganizationDocumentStatus } from '@prisma/client'
import { documentTypeFor, type OrganizationProfileInput } from '@cidadao/shared'
import { PrismaService } from '../prisma/prisma.service'
import { DocumentsService } from '../documents/documents.service'

/** Campos do perfil considerados no cálculo de completude. */
const PROFILE_FIELDS: { key: keyof OrganizationProfileInput; label: string }[] = [
  { key: 'nome_organizacao', label: 'Nome da organização' },
  { key: 'tipo_organizacao', label: 'Tipo de organização' },
  { key: 'documento', label: 'CPF ou CNPJ' },
  { key: 'abrangencia', label: 'Abrangência' },
  { key: 'areas_atuacao', label: 'Áreas de atuação' },
  { key: 'municipio', label: 'Município' },
  { key: 'uf', label: 'UF' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'email', label: 'E-mail' },
]

@Injectable()
export class OrganizationProfileService {
  constructor(
    private prisma: PrismaService,
    private documents: DocumentsService,
  ) {}

  async get(tenantId: string) {
    // garante defaults e status de vencimento atualizados antes de calcular pendências
    await this.documents.ensureDefaults(tenantId)
    await this.documents.refreshExpired(tenantId)

    const [profile, requiredTypes] = await Promise.all([
      this.prisma.organizationProfile.findUnique({ where: { tenant_id: tenantId } }),
      this.prisma.institutionalDocType.findMany({
        where: { required: true, category: { tenant_id: tenantId } },
        select: {
          name: true,
          documents: { where: { tenant_id: tenantId }, select: { status: true }, take: 1 },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    const camposPendentes: string[] = []
    let preenchidos = 0
    for (const field of PROFILE_FIELDS) {
      const value = profile?.[field.key as keyof typeof profile]
      const filled = Array.isArray(value) ? value.length > 0 : value != null && value !== ''
      if (filled) preenchidos += 1
      else camposPendentes.push(field.label)
    }

    const documentosPendentes = requiredTypes
      .filter((t) => t.documents[0]?.status !== OrganizationDocumentStatus.VALIDO)
      .map((t) => t.name)
    const documentosOk = requiredTypes.length - documentosPendentes.length

    const totalItens = PROFILE_FIELDS.length + requiredTypes.length
    const percentualCompletude = Math.round(((preenchidos + documentosOk) / totalItens) * 100)

    return {
      profile,
      percentualCompletude,
      pendencias: { campos: camposPendentes, documentos: documentosPendentes },
    }
  }

  async upsert(tenantId: string, input: OrganizationProfileInput) {
    const data = {
      nome_organizacao: input.nome_organizacao,
      tipo_organizacao: input.tipo_organizacao ?? null,
      documento: input.documento ?? null,
      tipo_documento: documentTypeFor(input.documento),
      abrangencia: input.abrangencia ?? null,
      areas_atuacao: input.areas_atuacao ?? [],
      municipio: input.municipio ?? null,
      uf: input.uf ?? null,
      telefone: input.telefone ?? null,
      email: input.email ?? null,
    }

    await this.prisma.organizationProfile.upsert({
      where: { tenant_id: tenantId },
      create: { tenant_id: tenantId, ...data },
      update: data,
    })

    return this.get(tenantId)
  }
}

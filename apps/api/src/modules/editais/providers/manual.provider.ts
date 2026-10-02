import { Injectable } from '@nestjs/common'
import type { Edital } from '@prisma/client'
import type { EditalDTO, SearchEditaisQuery } from '@cidadao/shared'
import { PrismaService } from '../../prisma/prisma.service'
import type { EditalProvider, ProviderContext } from './edital-provider'

export function manualToDTO(e: Edital): EditalDTO {
  return {
    externalId: e.id,
    fonte: 'MANUAL',
    titulo: e.titulo,
    orgao: e.orgao,
    descricao: e.descricao,
    valorTotal: e.valor_total ? Number(e.valor_total) : null,
    dataAbertura: e.data_abertura?.toISOString() ?? null,
    dataEncerramento: e.data_encerramento?.toISOString() ?? null,
    abrangencia: e.abrangencia,
    uf: e.uf,
    areaTematica: e.area_tematica,
    linkOficial: e.link_oficial,
    requisitosDocumentais: e.requisitos_documentais,
  }
}

/** Editais cadastrados manualmente (fontes sem API: fundações, institutos). */
@Injectable()
export class ManualProvider implements EditalProvider {
  readonly fonte = 'MANUAL'

  constructor(private prisma: PrismaService) {}

  async search(_filters: SearchEditaisQuery, ctx: ProviderContext): Promise<EditalDTO[]> {
    const editais = await this.prisma.edital.findMany({
      where: {
        fonte: 'MANUAL',
        OR: [{ tenant_id: null }, { tenant_id: ctx.tenantId }],
      },
      orderBy: { data_encerramento: 'asc' },
      take: 200,
    })
    return editais.map(manualToDTO)
  }

  async getById(externalId: string, ctx: ProviderContext): Promise<EditalDTO | null> {
    const edital = await this.prisma.edital.findFirst({
      where: {
        id: externalId,
        fonte: 'MANUAL',
        OR: [{ tenant_id: null }, { tenant_id: ctx.tenantId }],
      },
    })
    return edital ? manualToDTO(edital) : null
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { CreatePartnerDto, CreatePartnershipDto, UpdatePartnerDto, UpdatePartnershipDto } from './dto/partner.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PartnershipsService {
  constructor(private prisma: PrismaService) {}

  listPartners(tenantId: string) {
    return this.prisma.partner.findMany({
      where: { tenant_id: tenantId }, include: { contacts: true, _count: { select: { partnerships: true } } },
      orderBy: { name: 'asc' },
    })
  }

  async createPartner(tenantId: string, dto: CreatePartnerDto) {
    if (dto.cnpj_cpf) {
      const duplicate = await this.prisma.partner.findFirst({ where: { tenant_id: tenantId, cnpj_cpf: dto.cnpj_cpf } })
      if (duplicate) throw new BadRequestException('Já existe um parceiro com este CPF/CNPJ')
    }
    return this.prisma.partner.create({ data: { tenant_id: tenantId, ...dto } })
  }

  async updatePartner(tenantId: string, id: string, dto: UpdatePartnerDto) {
    const exists = await this.prisma.partner.findFirst({ where: { id, tenant_id: tenantId } })
    if (!exists) throw new NotFoundException('Parceiro não encontrado')
    if (dto.cnpj_cpf) {
      const duplicate = await this.prisma.partner.findFirst({ where: { tenant_id: tenantId, cnpj_cpf: dto.cnpj_cpf, NOT: { id } } })
      if (duplicate) throw new BadRequestException('Já existe um parceiro com este CPF/CNPJ')
    }
    return this.prisma.partner.update({ where: { id }, data: dto })
  }

  listPartnerships(tenantId: string) {
    return this.prisma.partnership.findMany({
      where: { tenant_id: tenantId }, include: { partner: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
      orderBy: { updated_at: 'desc' },
    })
  }

  private async validateLinks(tenantId: string, partnerId: string, projectId?: string) {
    const partner = await this.prisma.partner.findFirst({ where: { id: partnerId, tenant_id: tenantId } })
    if (!partner) throw new NotFoundException('Parceiro não encontrado')
    if (projectId) {
      const project = await this.prisma.project.findFirst({ where: { id: projectId, tenant_id: tenantId, deleted_at: null } })
      if (!project) throw new NotFoundException('Projeto não encontrado')
    }
  }

  async createPartnership(tenantId: string, dto: CreatePartnershipDto) {
    await this.validateLinks(tenantId, dto.partner_id, dto.project_id)
    return this.prisma.partnership.create({ data: {
      ...dto, tenant_id: tenantId,
      start_date: dto.start_date ? new Date(dto.start_date) : undefined,
      end_date: dto.end_date ? new Date(dto.end_date) : undefined,
    } })
  }

  async updatePartnership(tenantId: string, id: string, dto: UpdatePartnershipDto) {
    const exists = await this.prisma.partnership.findFirst({ where: { id, tenant_id: tenantId } })
    if (!exists) throw new NotFoundException('Parceria não encontrada')
    await this.validateLinks(tenantId, dto.partner_id ?? exists.partner_id, dto.project_id ?? exists.project_id ?? undefined)
    return this.prisma.partnership.update({ where: { id }, data: {
      ...dto,
      start_date: dto.start_date ? new Date(dto.start_date) : undefined,
      end_date: dto.end_date ? new Date(dto.end_date) : undefined,
    } })
  }
}

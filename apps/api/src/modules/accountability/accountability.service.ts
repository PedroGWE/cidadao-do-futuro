import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { AccountabilityReportStatus, Prisma, TransactionType } from '@prisma/client'
import type { CreateAccountabilityDto } from './dto/accountability.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AccountabilityService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.accountabilityReport.findMany({
      where: { tenant_id: tenantId },
      include: { project: { select: { id: true, name: true } }, _count: { select: { items: true, glosses: true } } },
      orderBy: { updated_at: 'desc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const report = await this.prisma.accountabilityReport.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        project: { select: { id: true, name: true } },
        items: { include: { transaction: { select: { id: true, date: true, type: true, status: true } } }, orderBy: { created_at: 'asc' } },
        glosses: true,
      },
    })
    if (!report) throw new NotFoundException('Prestação de contas não encontrada')
    return report
  }

  async create(tenantId: string, userId: string, dto: CreateAccountabilityDto) {
    const start = new Date(dto.period_start)
    const end = new Date(dto.period_end)
    if (end < start) throw new BadRequestException('A data final deve ser posterior à inicial')
    if (dto.project_id) {
      const project = await this.prisma.project.findFirst({ where: { id: dto.project_id, tenant_id: tenantId, deleted_at: null } })
      if (!project) throw new NotFoundException('Projeto não encontrado')
    }
    return this.prisma.accountabilityReport.create({ data: {
      tenant_id: tenantId, created_by: userId, title: dto.title, project_id: dto.project_id,
      period_start: start, period_end: end, type: dto.type, notes: dto.notes,
      total_received: new Prisma.Decimal(0), total_spent: new Prisma.Decimal(0), balance: new Prisma.Decimal(0),
    } })
  }

  async consolidate(tenantId: string, id: string) {
    const report = await this.findOne(tenantId, id)
    if (report.status !== AccountabilityReportStatus.RASCUNHO && report.status !== AccountabilityReportStatus.PENDENTE_CORRECAO) {
      throw new BadRequestException('Somente prestações em rascunho ou correção podem ser recalculadas')
    }
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenant_id: tenantId, status: { in: ['APROVADO', 'PAGO'] },
        date: { gte: report.period_start, lte: report.period_end },
        ...(report.project_id && { project_id: report.project_id }),
      },
      select: { id: true, type: true, description: true, amount: true, category: true },
    })
    const received = transactions.filter((item) => item.type === TransactionType.RECEITA).reduce((sum, item) => sum.plus(item.amount), new Prisma.Decimal(0))
    const spent = transactions.filter((item) => item.type === TransactionType.DESPESA).reduce((sum, item) => sum.plus(item.amount), new Prisma.Decimal(0))
    return this.prisma.$transaction(async (tx) => {
      await tx.accountabilityItem.deleteMany({ where: { report_id: id } })
      if (transactions.length) await tx.accountabilityItem.createMany({ data: transactions.map((item) => ({
        report_id: id, transaction_id: item.id, description: item.description, amount: item.amount,
        category: item.category, status: 'CONSOLIDADO',
      })) })
      return tx.accountabilityReport.update({ where: { id }, data: { total_received: received, total_spent: spent, balance: received.minus(spent) } })
    })
  }

  async updateStatus(tenantId: string, id: string, next: AccountabilityReportStatus) {
    const report = await this.findOne(tenantId, id)
    const allowed: Record<AccountabilityReportStatus, AccountabilityReportStatus[]> = {
      RASCUNHO: ['EM_REVISAO'], EM_REVISAO: ['RASCUNHO', 'SUBMETIDO'], SUBMETIDO: ['EM_ANALISE'],
      EM_ANALISE: ['APROVADO', 'REPROVADO', 'PENDENTE_CORRECAO'], APROVADO: [], REPROVADO: [],
      PENDENTE_CORRECAO: ['EM_REVISAO'],
    }
    if (!allowed[report.status].includes(next)) throw new BadRequestException('Transição de situação inválida')
    const changed = await this.prisma.accountabilityReport.updateMany({
      where: { id, tenant_id: tenantId, status: report.status },
      data: {
        status: next,
        ...(next === 'SUBMETIDO' && { submitted_at: new Date() }),
        ...(next === 'APROVADO' && { approved_at: new Date() }),
      },
    })
    if (changed.count !== 1) throw new BadRequestException('A prestação foi alterada por outro usuário; atualize a página')
    return this.findOne(tenantId, id)
  }

  async csv(tenantId: string, id: string) {
    const report = await this.findOne(tenantId, id)
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    return [
      ['Transação', 'Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Situação'].map(escape).join(','),
      ...report.items.map((item) => [item.transaction_id, item.transaction?.date.toISOString().slice(0, 10), item.transaction?.type,
        item.description, item.category, item.amount.toFixed(2), item.status].map(escape).join(',')),
    ].join('\r\n')
  }
}

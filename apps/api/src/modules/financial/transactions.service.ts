import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateTransactionDto } from './dto/create-transaction.dto'
import type { QueryTransactionsDto } from './dto/query-transactions.dto'
import type { CreatePaymentOrderDto } from './dto/create-payment-order.dto'
import type { CreateInvoiceDto } from './dto/create-invoice.dto'

const TX_SELECT = {
  id: true,
  type: true,
  status: true,
  description: true,
  amount: true,
  date: true,
  due_date: true,
  paid_at: true,
  payment_method: true,
  reference_number: true,
  category: true,
  tags: true,
  created_at: true,
  project: { select: { id: true, name: true, code: true } },
  cost_center: { select: { id: true, name: true, code: true } },
  creator: { select: { id: true, name: true } },
  approver: { select: { id: true, name: true } },
  _count: { select: { invoices: true, payment_orders: true } },
} satisfies Prisma.TransactionSelect

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, q: QueryTransactionsDto) {
    const page = q.page ?? 1
    const limit = q.limit ?? 20
    const where: Prisma.TransactionWhereInput = {
      tenant_id: tenantId,
      ...(q.type && { type: q.type }),
      ...(q.status && { status: q.status }),
      ...(q.project_id && { project_id: q.project_id }),
      ...(q.cost_center_id && { cost_center_id: q.cost_center_id }),
      ...((q.date_from || q.date_to) && {
        date: {
          ...(q.date_from && { gte: new Date(q.date_from) }),
          ...(q.date_to && { lte: new Date(q.date_to) }),
        },
      }),
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        select: TX_SELECT,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(tenantId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        project: { select: { id: true, name: true, code: true } },
        cost_center: { select: { id: true, name: true, code: true } },
        creator: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        invoices: true,
        payment_orders: { include: { approver: { select: { id: true, name: true } } } },
      },
    })
    if (!tx) throw new NotFoundException('Transação não encontrada')
    return tx
  }

  async create(tenantId: string, userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        tenant_id: tenantId,
        created_by: userId,
        type: dto.type,
        description: dto.description,
        amount: dto.amount,
        date: new Date(dto.date),
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
        project_id: dto.project_id,
        cost_center_id: dto.cost_center_id,
        payment_method: dto.payment_method,
        reference_number: dto.reference_number,
        category: dto.category,
        tags: dto.tags ?? [],
      },
      select: TX_SELECT,
    })
  }

  async approve(tenantId: string, id: string, userId: string) {
    await this.assertBelongsToTenant(id, tenantId)
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'APROVADO', approved_by: userId },
      select: TX_SELECT,
    })
  }

  async markPaid(tenantId: string, id: string) {
    await this.assertBelongsToTenant(id, tenantId)
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'PAGO', paid_at: new Date() },
      select: TX_SELECT,
    })
  }

  async cancel(tenantId: string, id: string) {
    await this.assertBelongsToTenant(id, tenantId)
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'CANCELADO' },
      select: TX_SELECT,
    })
  }

  async getSummary(tenantId: string, filters: { project_id?: string; date_from?: string; date_to?: string }) {
    const where: Prisma.TransactionWhereInput = {
      tenant_id: tenantId,
      status: { in: ['APROVADO', 'PAGO'] },
      ...(filters.project_id && { project_id: filters.project_id }),
      ...((filters.date_from || filters.date_to) && {
        date: {
          ...(filters.date_from && { gte: new Date(filters.date_from) }),
          ...(filters.date_to && { lte: new Date(filters.date_to) }),
        },
      }),
    }
    const [receitas, despesas] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { ...where, type: 'RECEITA' }, _sum: { amount: true }, _count: true }),
      this.prisma.transaction.aggregate({ where: { ...where, type: 'DESPESA' }, _sum: { amount: true }, _count: true }),
    ])
    const totalReceitas = Number(receitas._sum.amount ?? 0)
    const totalDespesas = Number(despesas._sum.amount ?? 0)
    return {
      receitas: { total: totalReceitas, count: receitas._count },
      despesas: { total: totalDespesas, count: despesas._count },
      saldo: totalReceitas - totalDespesas,
    }
  }

  // ── Payment Orders ────────────────────────────────────────────

  async createPaymentOrder(tenantId: string, dto: CreatePaymentOrderDto) {
    return this.prisma.paymentOrder.create({
      data: {
        tenant_id: tenantId,
        supplier_name: dto.supplier_name,
        supplier_cnpj_cpf: dto.supplier_cnpj_cpf,
        amount: dto.amount,
        due_date: new Date(dto.due_date),
        status: 'PENDENTE',
        transaction_id: dto.transaction_id,
        bank_data: dto.bank_data as object,
      },
    })
  }

  async findPaymentOrders(tenantId: string, status?: string) {
    return this.prisma.paymentOrder.findMany({
      where: { tenant_id: tenantId, ...(status && { status }) },
      include: {
        transaction: { select: { id: true, description: true, project: { select: { id: true, name: true } } } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { due_date: 'asc' },
    })
  }

  async approvePaymentOrder(tenantId: string, id: string, userId: string) {
    const po = await this.prisma.paymentOrder.findFirst({ where: { id, tenant_id: tenantId } })
    if (!po) throw new NotFoundException()
    return this.prisma.paymentOrder.update({
      where: { id },
      data: { status: 'PAGO', approved_by: userId, paid_at: new Date() },
    })
  }

  // ── Invoices ──────────────────────────────────────────────────

  async createInvoice(tenantId: string, dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        tenant_id: tenantId,
        supplier_name: dto.supplier_name,
        supplier_cnpj: dto.supplier_cnpj,
        number: dto.number,
        issue_date: new Date(dto.issue_date),
        amount: dto.amount,
        tax_amount: dto.tax_amount,
        net_amount: dto.tax_amount ? dto.amount - dto.tax_amount : dto.amount,
        file_url: dto.file_url,
        transaction_id: dto.transaction_id,
        notes: dto.notes,
      },
    })
  }

  async validateInvoice(tenantId: string, id: string, userId: string, approve: boolean) {
    const inv = await this.prisma.invoice.findFirst({ where: { id, tenant_id: tenantId } })
    if (!inv) throw new NotFoundException()
    return this.prisma.invoice.update({
      where: { id },
      data: { status: approve ? 'VALIDADA' : 'REJEITADA', validated_by: userId },
    })
  }

  private async assertBelongsToTenant(id: string, tenantId: string) {
    const tx = await this.prisma.transaction.findFirst({ where: { id, tenant_id: tenantId }, select: { id: true } })
    if (!tx) throw new NotFoundException('Transação não encontrada')
  }
}

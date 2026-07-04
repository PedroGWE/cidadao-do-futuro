import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateBudgetDto } from './dto/create-budget.dto'
import type { CreateBudgetCategoryDto } from './dto/create-budget-category.dto'
import type { CreateBudgetItemDto } from './dto/create-budget-item.dto'

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: { project_id?: string; fiscal_year?: number }) {
    return this.prisma.budget.findMany({
      where: {
        tenant_id: tenantId,
        ...(filters.project_id && { project_id: filters.project_id }),
        ...(filters.fiscal_year && { fiscal_year: filters.fiscal_year }),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        _count: { select: { categories: true } },
      },
      orderBy: [{ fiscal_year: 'desc' }, { created_at: 'desc' }],
    })
  }

  async findOne(tenantId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        project: { select: { id: true, name: true, code: true } },
        categories: {
          include: { items: true },
          orderBy: { name: 'asc' },
        },
      },
    })
    if (!budget) throw new NotFoundException('Orçamento não encontrado')
    return budget
  }

  async create(tenantId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        tenant_id: tenantId,
        project_id: dto.project_id,
        fiscal_year: dto.fiscal_year,
        total_amount: dto.total_amount,
        balance: dto.total_amount,
        funding_source_id: dto.funding_source_id,
      },
    })
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    await this.assertBelongsToTenant(id, tenantId)
    return this.prisma.budget.update({
      where: { id },
      data: { status: status as never },
    })
  }

  async addCategory(tenantId: string, budgetId: string, dto: CreateBudgetCategoryDto) {
    await this.assertBelongsToTenant(budgetId, tenantId)
    const cat = await this.prisma.budgetCategory.create({
      data: {
        budget_id: budgetId,
        name: dto.name,
        code: dto.code,
        planned_amount: dto.planned_amount,
      },
    })
    await this.recalcBudget(budgetId)
    return cat
  }

  async addItem(tenantId: string, budgetId: string, categoryId: string, dto: CreateBudgetItemDto) {
    await this.assertBelongsToTenant(budgetId, tenantId)
    const totalValue = Number(dto.quantity) * Number(dto.unit_value)
    const item = await this.prisma.budgetItem.create({
      data: {
        category_id: categoryId,
        description: dto.description,
        quantity: dto.quantity,
        unit: dto.unit,
        unit_value: dto.unit_value,
        total_value: totalValue,
      },
    })
    await this.recalcCategory(categoryId)
    return item
  }

  async getSummary(tenantId: string, fiscalYear?: number) {
    const where: Prisma.BudgetWhereInput = {
      tenant_id: tenantId,
      status: 'ATIVO',
      ...(fiscalYear && { fiscal_year: fiscalYear }),
    }
    const agg = await this.prisma.budget.aggregate({
      where,
      _sum: { total_amount: true, allocated: true, committed: true, spent: true, balance: true },
      _count: true,
    })
    return { count: agg._count, ...agg._sum }
  }

  private async recalcBudget(budgetId: string) {
    const cats = await this.prisma.budgetCategory.aggregate({
      where: { budget_id: budgetId },
      _sum: { planned_amount: true, committed_amount: true, spent_amount: true },
    })
    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        allocated: cats._sum.planned_amount ?? 0,
        committed: cats._sum.committed_amount ?? 0,
        spent: cats._sum.spent_amount ?? 0,
      },
    })
  }

  private async recalcCategory(categoryId: string) {
    const items = await this.prisma.budgetItem.aggregate({
      where: { category_id: categoryId },
      _sum: { total_value: true, spent_value: true },
    })
    await this.prisma.budgetCategory.update({
      where: { id: categoryId },
      data: {
        planned_amount: items._sum.total_value ?? 0,
        spent_amount: items._sum.spent_value ?? 0,
      },
    })
  }

  private async assertBelongsToTenant(budgetId: string, tenantId: string) {
    const b = await this.prisma.budget.findFirst({ where: { id: budgetId, tenant_id: tenantId }, select: { id: true } })
    if (!b) throw new NotFoundException('Orçamento não encontrado')
  }
}

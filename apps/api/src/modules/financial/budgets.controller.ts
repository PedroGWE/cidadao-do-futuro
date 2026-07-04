import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto'
import { CreateBudgetItemDto } from './dto/create-budget-item.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'

@Controller('financial/budgets')
export class BudgetsController {
  constructor(private budgets: BudgetsService) {}

  @Get('summary')
  summary(@CurrentUser('tenantId') tid: string, @Query('fiscalYear') year?: string) {
    return this.budgets.getSummary(tid, year ? Number(year) : undefined)
  }

  @Get()
  findAll(
    @CurrentUser('tenantId') tid: string,
    @Query('projectId') project_id?: string,
    @Query('fiscalYear') fiscalYear?: string,
  ) {
    return this.budgets.findAll(tid, { project_id, fiscal_year: fiscalYear ? Number(fiscalYear) : undefined })
  }

  @Post()
  @RequirePermissions('financial:write')
  create(@CurrentUser('tenantId') tid: string, @Body() dto: CreateBudgetDto) {
    return this.budgets.create(tid, dto)
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.budgets.findOne(tid, id)
  }

  @Patch(':id/status')
  @RequirePermissions('financial:write')
  updateStatus(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.budgets.updateStatus(tid, id, status)
  }

  @Post(':id/categories')
  @RequirePermissions('financial:write')
  addCategory(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: CreateBudgetCategoryDto,
  ) {
    return this.budgets.addCategory(tid, id, dto)
  }

  @Post(':id/categories/:catId/items')
  @RequirePermissions('financial:write')
  addItem(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('catId') catId: string,
    @Body() dto: CreateBudgetItemDto,
  ) {
    return this.budgets.addItem(tid, id, catId, dto)
  }
}

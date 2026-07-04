import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { QueryTransactionsDto } from './dto/query-transactions.dto'
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'

@Controller('financial')
export class TransactionsController {
  constructor(private txService: TransactionsService) {}

  // ── Summary ───────────────────────────────────────────────────

  @Get('summary')
  summary(
    @CurrentUser('tenantId') tid: string,
    @Query('projectId') project_id?: string,
    @Query('dateFrom') date_from?: string,
    @Query('dateTo') date_to?: string,
  ) {
    return this.txService.getSummary(tid, { project_id, date_from, date_to })
  }

  // ── Transactions ──────────────────────────────────────────────

  @Get('transactions')
  findAll(@CurrentUser('tenantId') tid: string, @Query() q: QueryTransactionsDto) {
    return this.txService.findAll(tid, q)
  }

  @Post('transactions')
  @RequirePermissions('financial:write')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTransactionDto) {
    return this.txService.create(user.tenantId, user.sub, dto)
  }

  @Get('transactions/:id')
  findOne(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.txService.findOne(tid, id)
  }

  @Patch('transactions/:id/approve')
  @RequirePermissions('financial:approve')
  approve(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.txService.approve(user.tenantId, id, user.sub)
  }

  @Patch('transactions/:id/pay')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('financial:approve')
  markPaid(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.txService.markPaid(tid, id)
  }

  @Patch('transactions/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('financial:write')
  cancel(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.txService.cancel(tid, id)
  }

  // ── Payment Orders ────────────────────────────────────────────

  @Get('payment-orders')
  findPaymentOrders(@CurrentUser('tenantId') tid: string, @Query('status') status?: string) {
    return this.txService.findPaymentOrders(tid, status)
  }

  @Post('payment-orders')
  @RequirePermissions('financial:write')
  createPaymentOrder(@CurrentUser('tenantId') tid: string, @Body() dto: CreatePaymentOrderDto) {
    return this.txService.createPaymentOrder(tid, dto)
  }

  @Patch('payment-orders/:id/approve')
  @RequirePermissions('financial:approve')
  approvePaymentOrder(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.txService.approvePaymentOrder(user.tenantId, id, user.sub)
  }

  // ── Invoices ──────────────────────────────────────────────────

  @Post('invoices')
  @RequirePermissions('financial:write')
  createInvoice(@CurrentUser('tenantId') tid: string, @Body() dto: CreateInvoiceDto) {
    return this.txService.createInvoice(tid, dto)
  }

  @Patch('invoices/:id/validate')
  @RequirePermissions('financial:approve')
  validateInvoice(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('approve') approve: boolean,
  ) {
    return this.txService.validateInvoice(user.tenantId, id, user.sub, approve)
  }
}

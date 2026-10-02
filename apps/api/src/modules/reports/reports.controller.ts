import { Controller, Get, Query, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import { QueryReportDto } from './dto/query-report.dto'
import { ReportsService } from './reports.service'

@Controller('reports')
@RequirePermissions('reports:read')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('summary')
  summary(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryReportDto) {
    return this.reports.summary(tenantId, query)
  }

  @Get('financial.csv')
  async csv(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryReportDto, @Res() reply: FastifyReply) {
    const csv = await this.reports.csv(tenantId, query)
    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="relatorio-financeiro.csv"')
      .send(`\uFEFF${csv}`)
  }
}

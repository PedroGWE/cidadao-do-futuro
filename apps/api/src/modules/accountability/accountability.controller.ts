import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import { CreateAccountabilityDto, UpdateAccountabilityStatusDto } from './dto/accountability.dto'
import { AccountabilityService } from './accountability.service'

@Controller('accountability')
export class AccountabilityController {
  constructor(private service: AccountabilityService) {}

  @Get() @RequirePermissions('accountability:read')
  list(@CurrentUser('tenantId') tenantId: string) { return this.service.list(tenantId) }

  @Get(':id') @RequirePermissions('accountability:read')
  find(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) { return this.service.findOne(tenantId, id) }

  @Post() @RequirePermissions('accountability:write')
  create(@CurrentUser('tenantId') tenantId: string, @CurrentUser('sub') userId: string, @Body() dto: CreateAccountabilityDto) {
    return this.service.create(tenantId, userId, dto)
  }

  @Post(':id/consolidate') @RequirePermissions('accountability:write')
  consolidate(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) { return this.service.consolidate(tenantId, id) }

  @Patch(':id/status') @RequirePermissions('accountability:review')
  status(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateAccountabilityStatusDto) {
    return this.service.updateStatus(tenantId, id, dto.status)
  }

  @Get(':id/export.csv') @RequirePermissions('accountability:read')
  async csv(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Res() reply: FastifyReply) {
    const csv = await this.service.csv(tenantId, id)
    return reply.header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="prestacao-${id}.csv"`).send(`\uFEFF${csv}`)
  }
}

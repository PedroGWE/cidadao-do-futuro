import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'
import { ConfigureTransferegovDto, ImportTransferegovDto, LinkTransferegovDto } from './dto/transferegov.dto'
import { TransferegovService } from './transferegov.service'

@Controller('integrations/transferegov')
export class TransferegovController {
  constructor(private readonly service: TransferegovService) {}

  @Get()
  @RequirePermissions('transferegov:read')
  get(@CurrentUser('tenantId') tenantId: string) { return this.service.getConfiguration(tenantId) }

  @Put()
  @RequirePermissions('transferegov:manage')
  configure(@CurrentUser('tenantId') tenantId: string, @Body() dto: ConfigureTransferegovDto) {
    return this.service.configure(tenantId, dto)
  }

  @Post('discover')
  @RequirePermissions('transferegov:import')
  discover(@CurrentUser() user: JwtPayload) { return this.service.discover(user.tenantId, user.sub) }

  @Post('sync')
  @RequirePermissions('transferegov:manage')
  sync(@CurrentUser() user: JwtPayload) { return this.service.enqueue(user.tenantId, 'MANUAL', user.sub) }

  @Post('import')
  @RequirePermissions('transferegov:import')
  import(@CurrentUser() user: JwtPayload, @Body() dto: ImportTransferegovDto) {
    return this.service.importRecords(user.tenantId, user.sub, dto)
  }

  @Post('records/:id/link')
  @RequirePermissions('transferegov:import')
  link(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: LinkTransferegovDto) {
    return this.service.linkRecord(tenantId, id, dto.project_id)
  }

  @Get('records')
  @RequirePermissions('transferegov:read')
  records(@CurrentUser('tenantId') tenantId: string) { return this.service.listRecords(tenantId) }

  @Get('history')
  @RequirePermissions('transferegov:read')
  history(@CurrentUser('tenantId') tenantId: string) { return this.service.history(tenantId) }
}

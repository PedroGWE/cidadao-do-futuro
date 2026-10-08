import { BadRequestException, Body, Controller, Get, Headers, HttpCode, Param, Patch, Post, Put, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import { CreateAccountabilityDto, UpdateAccountabilityStatusDto } from './dto/accountability.dto'
import { AccountabilityService } from './accountability.service'
import { FiscalNotesService } from './fiscal-notes.service'
import { CancelFiscalNoteDto, FiscalNoteDto, UpdateFiscalNoteDto } from './dto/fiscal-note.dto'
import { Public } from '../../common/decorators/public.decorator'
import { ConfigureNfseDto } from './dto/nfse-config.dto'

@Controller('accountability')
export class AccountabilityController {
  constructor(private service: AccountabilityService, private fiscal: FiscalNotesService) {}

  @Get('fiscal/config') @RequirePermissions('accountability:read')
  config(@CurrentUser('tenantId') tenantId: string) { return this.fiscal.configStatus(tenantId) }

  @Put('fiscal/config') @RequirePermissions('accountability:review')
  configureFiscal(@CurrentUser('tenantId') tenantId: string, @CurrentUser('sub') userId: string,
    @Body() dto: ConfigureNfseDto) { return this.fiscal.configure(tenantId, userId, dto) }

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

  @Get(':id/fiscal-notes') @RequirePermissions('accountability:read')
  fiscalNotes(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.fiscal.list(tenantId, id)
  }

  @Post(':id/fiscal-notes') @RequirePermissions('accountability:write')
  draft(@CurrentUser('tenantId') tenantId: string, @CurrentUser('sub') userId: string,
    @Param('id') id: string, @Body() dto: FiscalNoteDto) {
    return this.fiscal.create(tenantId, id, userId, dto)
  }

  @Patch(':id/fiscal-notes/:noteId') @RequirePermissions('accountability:write')
  editDraft(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string,
    @Param('noteId') noteId: string, @Body() dto: UpdateFiscalNoteDto) {
    return this.fiscal.update(tenantId, id, noteId, dto)
  }

  @Post(':id/fiscal-notes/:noteId/issue') @RequirePermissions('accountability:review')
  issue(@CurrentUser('tenantId') tenantId: string, @CurrentUser('sub') userId: string,
    @Param('id') id: string, @Param('noteId') noteId: string) {
    return this.fiscal.issue(tenantId, id, noteId, userId)
  }

  @Post(':id/fiscal-notes/:noteId/sync') @RequirePermissions('accountability:read')
  sync(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Param('noteId') noteId: string) {
    return this.fiscal.sync(tenantId, id, noteId)
  }

  @Post(':id/fiscal-notes/:noteId/cancel') @RequirePermissions('accountability:review')
  cancel(@CurrentUser('tenantId') tenantId: string, @CurrentUser('sub') userId: string,
    @Param('id') id: string, @Param('noteId') noteId: string, @Body() dto: CancelFiscalNoteDto) {
    return this.fiscal.cancel(tenantId, id, noteId, userId, dto.justification)
  }

  @Get(':id/fiscal-notes/:noteId/document/:kind') @RequirePermissions('accountability:read')
  async fiscalFile(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string,
    @Param('noteId') noteId: string, @Param('kind') kind: string, @Res() reply: FastifyReply) {
    if (kind !== 'xml' && kind !== 'pdf') throw new BadRequestException('Tipo de arquivo inválido')
    const { stream, filename, mime } = await this.fiscal.document(tenantId, id, noteId, kind)
    return reply.header('Content-Type', mime)
      .header('Content-Disposition', `attachment; filename="${filename}"`).send(stream)
  }
}

@Controller('fiscal-webhooks/focus')
export class FiscalWebhookController {
  constructor(private fiscal: FiscalNotesService) {}

  @Public() @Post(':tenantId') @HttpCode(200)
  receive(@Param('tenantId') tenantId: string, @Headers('x-amparo-webhook-secret') secret: string | undefined,
    @Body() payload: unknown) {
    return this.fiscal.webhook(tenantId, secret, payload)
  }
}

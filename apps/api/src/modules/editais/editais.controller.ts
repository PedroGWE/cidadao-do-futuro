import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  manualEditalSchema,
  patchSavedEditalSchema,
  saveEditalSchema,
  searchEditaisQuerySchema,
} from '@cidadao/shared'
import { EditaisService } from './editais.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'

function parseOr400<T>(schema: { safeParse: (v: unknown) => any }, value: unknown): T {
  const parsed = schema.safeParse(value)
  if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors)
  return parsed.data as T
}

@Controller('editais')
export class EditaisController {
  constructor(private editais: EditaisService) {}

  @Get('search')
  search(@CurrentUser('tenantId') tenantId: string, @Query() query: Record<string, string>) {
    return this.editais.search(tenantId, parseOr400(searchEditaisQuerySchema, query))
  }

  // -------- Meus editais (funil) --------

  @Get('saved')
  listSaved(@CurrentUser('tenantId') tenantId: string) {
    return this.editais.listSaved(tenantId)
  }

  @Post('saved')
  save(@CurrentUser('tenantId') tenantId: string, @Body() body: unknown) {
    return this.editais.saveEdital(tenantId, parseOr400(saveEditalSchema, body))
  }

  @Patch('saved/:id')
  patchSaved(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.editais.patchSaved(tenantId, id, parseOr400(patchSavedEditalSchema, body))
  }

  // -------- CRUD manual (admins) --------

  @Get('manual')
  @RequirePermissions('editais:manage')
  listManual(@CurrentUser('tenantId') tenantId: string) {
    return this.editais.listManual(tenantId)
  }

  @Post('manual')
  @RequirePermissions('editais:manage')
  createManual(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.editais.createManual(user.tenantId, user.sub, parseOr400(manualEditalSchema, body))
  }

  @Patch('manual/:id')
  @RequirePermissions('editais:manage')
  updateManual(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.editais.updateManual(tenantId, id, parseOr400(manualEditalSchema, body))
  }

  @Delete('manual/:id')
  @RequirePermissions('editais:manage')
  removeManual(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.editais.removeManual(tenantId, id)
  }

  // -------- Detalhe (por último: rota com dois params) --------

  @Get(':fonte/:externalId')
  detail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('fonte') fonte: string,
    @Param('externalId') externalId: string,
  ) {
    return this.editais.getDetail(tenantId, fonte, decodeURIComponent(externalId))
  }
}

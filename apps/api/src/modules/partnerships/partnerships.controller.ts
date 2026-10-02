import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import { CreatePartnerDto, CreatePartnershipDto, UpdatePartnerDto, UpdatePartnershipDto } from './dto/partner.dto'
import { PartnershipsService } from './partnerships.service'

@Controller()
export class PartnershipsController {
  constructor(private service: PartnershipsService) {}

  @Get('partners') @RequirePermissions('partnerships:read')
  partners(@CurrentUser('tenantId') tenantId: string) { return this.service.listPartners(tenantId) }

  @Post('partners') @RequirePermissions('partnerships:write')
  createPartner(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreatePartnerDto) { return this.service.createPartner(tenantId, dto) }

  @Patch('partners/:id') @RequirePermissions('partnerships:write')
  updatePartner(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdatePartnerDto) { return this.service.updatePartner(tenantId, id, dto) }

  @Get('partnerships') @RequirePermissions('partnerships:read')
  partnerships(@CurrentUser('tenantId') tenantId: string) { return this.service.listPartnerships(tenantId) }

  @Post('partnerships') @RequirePermissions('partnerships:write')
  createPartnership(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreatePartnershipDto) { return this.service.createPartnership(tenantId, dto) }

  @Patch('partnerships/:id') @RequirePermissions('partnerships:write')
  updatePartnership(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdatePartnershipDto) { return this.service.updatePartnership(tenantId, id, dto) }
}

import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { InviteUserDto } from './dto/invite-user.dto'
import { AcceptInviteDto } from './dto/accept-invite.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import { Public } from '../../common/decorators/public.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'

@Controller('tenants')
export class TenantsController {
  constructor(private tenants: TenantsService) {}

  @Get('me')
  findMe(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.findMe(tenantId)
  }

  @Patch('me')
  @RequirePermissions('tenant:update')
  update(@CurrentUser('tenantId') tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.tenants.update(tenantId, dto)
  }

  @Get('me/stats')
  stats(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.getStats(tenantId)
  }

  @Get('me/roles')
  listRoles(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.listRoles(tenantId)
  }

  @Get('me/invites')
  @RequirePermissions('users:invite')
  listInvites(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.listInvites(tenantId)
  }

  @Post('me/invites')
  @RequirePermissions('users:invite')
  invite(@CurrentUser() user: JwtPayload, @Body() dto: InviteUserDto) {
    return this.tenants.invite(user.tenantId, user.sub, dto)
  }

  @Delete('me/invites/:id')
  @RequirePermissions('users:invite')
  revokeInvite(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.tenants.revokeInvite(tenantId, id)
  }

  @Public()
  @Post('invites/accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.tenants.acceptInvite(dto)
  }
}

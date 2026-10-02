import { Body, Controller, Delete, Get, Param, Patch, Put } from '@nestjs/common'
import { UsersService } from './users.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'
import { ChangePasswordDto, SetUserRolesDto, UpdateProfileDto } from './dto/user.dto'

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.users.findMe(user)
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(user, dto)
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(user, dto)
  }

  @Get()
  @RequirePermissions('users:read')
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.users.findAll(tenantId)
  }

  @Put(':id/roles')
  @RequirePermissions('users:roles')
  setRoles(@CurrentUser() actor: JwtPayload, @Param('id') id: string, @Body() dto: SetUserRolesDto) {
    return this.users.setRoles(actor, id, dto.role_ids)
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  deactivate(@CurrentUser() actor: JwtPayload, @Param('id') id: string) {
    return this.users.deactivate(actor, id)
  }
}

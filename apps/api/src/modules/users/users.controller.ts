import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.users.findMe(user)
  }

  @Get()
  @RequirePermissions('users:read')
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.users.findAll(tenantId)
  }
}

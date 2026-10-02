import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'
import { ConectaService } from './conecta.service'

@Controller('conecta/teacher')
@RequirePermissions('conecta:teacher')
export class ConectaTeacherController {
  constructor(private conecta: ConectaService) {}

  @Get('home')
  home(@CurrentUser() user: JwtPayload) {
    return this.conecta.teacherHome(user.tenantId, user.sub)
  }
}

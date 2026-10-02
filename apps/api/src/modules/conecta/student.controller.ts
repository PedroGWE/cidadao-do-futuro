import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'
import { ConectaService } from './conecta.service'

@Controller('conecta/student')
@RequirePermissions('conecta:student')
export class ConectaStudentController {
  constructor(private conecta: ConectaService) {}

  @Get('home')
  home(@CurrentUser() user: JwtPayload) {
    return this.conecta.studentHome(user.tenantId, user.sub)
  }
}

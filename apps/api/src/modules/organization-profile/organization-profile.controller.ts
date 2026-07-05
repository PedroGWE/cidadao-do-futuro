import { BadRequestException, Body, Controller, Get, Put } from '@nestjs/common'
import { organizationProfileSchema } from '@cidadao/shared'
import { OrganizationProfileService } from './organization-profile.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('organization-profile')
export class OrganizationProfileController {
  constructor(private service: OrganizationProfileService) {}

  @Get()
  get(@CurrentUser('tenantId') tenantId: string) {
    return this.service.get(tenantId)
  }

  @Put()
  upsert(@CurrentUser('tenantId') tenantId: string, @Body() body: unknown) {
    const parsed = organizationProfileSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten().fieldErrors)
    return this.service.upsert(tenantId, parsed.data)
  }
}

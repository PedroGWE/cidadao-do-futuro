import { Module } from '@nestjs/common'
import { DocumentsModule } from '../documents/documents.module'
import { OrganizationProfileController } from './organization-profile.controller'
import { OrganizationProfileService } from './organization-profile.service'

@Module({
  imports: [DocumentsModule],
  controllers: [OrganizationProfileController],
  providers: [OrganizationProfileService],
})
export class OrganizationProfileModule {}

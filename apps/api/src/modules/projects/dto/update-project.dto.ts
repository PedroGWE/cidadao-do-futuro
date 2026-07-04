import { IsEnum, IsOptional } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { ProjectStatus } from '@prisma/client'
import { CreateProjectDto } from './create-project.dto'

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus
}

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { ProjectMemberRole } from '@prisma/client'

export class AddMemberDto {
  @IsString()
  user_id: string

  @IsOptional()
  @IsEnum(ProjectMemberRole)
  role?: ProjectMemberRole

  @IsOptional()
  @IsDateString()
  start_date?: string

  @IsOptional()
  @IsDateString()
  end_date?: string
}

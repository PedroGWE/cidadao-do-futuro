import { AccountabilityReportStatus, AccountabilityReportType } from '@prisma/client'
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateAccountabilityDto {
  @IsString() @MinLength(3) title: string
  @IsOptional() @IsString() project_id?: string
  @IsDateString() period_start: string
  @IsDateString() period_end: string
  @IsEnum(AccountabilityReportType) type: AccountabilityReportType
  @IsOptional() @IsString() notes?: string
}

export class UpdateAccountabilityStatusDto {
  @IsEnum(AccountabilityReportStatus) status: AccountabilityReportStatus
}

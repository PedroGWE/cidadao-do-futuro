import { IsDateString, IsOptional, IsString } from 'class-validator'

export class QueryReportDto {
  @IsOptional()
  @IsString()
  project_id?: string

  @IsOptional()
  @IsDateString()
  date_from?: string

  @IsOptional()
  @IsDateString()
  date_to?: string
}

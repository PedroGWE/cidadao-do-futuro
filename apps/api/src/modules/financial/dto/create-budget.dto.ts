import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateBudgetDto {
  @IsOptional()
  @IsString()
  project_id?: string

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  fiscal_year: number

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total_amount: number

  @IsOptional()
  @IsString()
  funding_source_id?: string
}

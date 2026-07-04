import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateBudgetCategoryDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsOptional()
  @IsString()
  code?: string

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  planned_amount: number
}

import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateBudgetItemDto {
  @IsString()
  @MinLength(2)
  description: string

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number

  @IsOptional()
  @IsString()
  unit?: string

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unit_value: number
}

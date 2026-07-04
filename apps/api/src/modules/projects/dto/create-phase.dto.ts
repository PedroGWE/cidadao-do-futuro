import { IsDateString, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePhaseDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  order: number

  @IsOptional()
  @IsDateString()
  start_date?: string

  @IsOptional()
  @IsDateString()
  end_date?: string
}

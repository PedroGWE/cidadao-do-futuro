import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { MeasurementFrequency } from '@prisma/client'

export class CreateProjectIndicatorDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  unit?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baseline?: number

  @Type(() => Number)
  @IsNumber()
  target: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current_value?: number

  @IsOptional()
  @IsEnum(MeasurementFrequency)
  frequency?: MeasurementFrequency
}

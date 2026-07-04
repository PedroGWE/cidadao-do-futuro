import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ProjectType } from '@prisma/client'

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(ProjectType)
  type: ProjectType

  @IsOptional()
  @IsString()
  code?: string

  @IsOptional()
  @IsDateString()
  start_date?: string

  @IsOptional()
  @IsDateString()
  end_date?: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total_budget?: number

  @IsOptional()
  @IsString()
  manager_id?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

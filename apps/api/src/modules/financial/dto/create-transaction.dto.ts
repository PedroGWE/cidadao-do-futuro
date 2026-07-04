import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { TransactionType } from '@prisma/client'

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType

  @IsString()
  @MinLength(2)
  description: string

  @IsNumber()
  @Type(() => Number)
  amount: number

  @IsDateString()
  date: string

  @IsOptional()
  @IsDateString()
  due_date?: string

  @IsOptional()
  @IsString()
  project_id?: string

  @IsOptional()
  @IsString()
  cost_center_id?: string

  @IsOptional()
  @IsString()
  payment_method?: string

  @IsOptional()
  @IsString()
  reference_number?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

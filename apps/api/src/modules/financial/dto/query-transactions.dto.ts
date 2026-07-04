import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { TransactionStatus, TransactionType } from '@prisma/client'

export class QueryTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus

  @IsOptional()
  @IsString()
  project_id?: string

  @IsOptional()
  @IsString()
  cost_center_id?: string

  @IsOptional()
  @IsDateString()
  date_from?: string

  @IsOptional()
  @IsDateString()
  date_to?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20
}

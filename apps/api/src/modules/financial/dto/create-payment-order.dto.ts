import { IsDateString, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePaymentOrderDto {
  @IsString()
  @MinLength(2)
  supplier_name: string

  @IsOptional()
  @IsString()
  supplier_cnpj_cpf?: string

  @IsNumber()
  @Type(() => Number)
  amount: number

  @IsDateString()
  due_date: string

  @IsOptional()
  @IsString()
  transaction_id?: string

  @IsOptional()
  bank_data?: Record<string, unknown>
}

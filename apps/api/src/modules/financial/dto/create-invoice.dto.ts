import { IsDateString, IsNumber, IsOptional, IsString, IsUrl, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateInvoiceDto {
  @IsString()
  @MinLength(2)
  supplier_name: string

  @IsOptional()
  @IsString()
  supplier_cnpj?: string

  @IsOptional()
  @IsString()
  number?: string

  @IsDateString()
  issue_date: string

  @IsNumber()
  @Type(() => Number)
  amount: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tax_amount?: number

  @IsOptional()
  @IsUrl()
  file_url?: string

  @IsOptional()
  @IsString()
  transaction_id?: string

  @IsOptional()
  @IsString()
  notes?: string
}

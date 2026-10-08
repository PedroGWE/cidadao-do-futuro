import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class FiscalNoteDto {
  @IsString() transaction_id: string
  @IsString() @Matches(/^\d{11}(\d{3})?$/) customer_document: string
  @IsString() @MinLength(2) @MaxLength(150) customer_name: string
  @IsString() @Matches(/^\d{7}$/) customer_city_code: string
  @IsString() @Matches(/^\d{8}$/) customer_zip: string
  @IsString() @MinLength(2) customer_street: string
  @IsString() @MinLength(1) customer_number: string
  @IsString() @MinLength(2) customer_district: string
  @IsOptional() @IsEmail() customer_email?: string
  @IsString() @Matches(/^\d{7}$/) service_city_code: string
  @IsString() @Matches(/^\d{6}$/) service_code: string
  @IsOptional() @IsString() @Matches(/^\d{9}$/) nbs_code?: string
  @IsString() @MinLength(10) service_description: string
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) competence_date: string
  @IsString() @Matches(/^\d+$/) simples_code: string
  @IsString() @Matches(/^\d+$/) special_regime_code: string
  @IsString() @Matches(/^\d+$/) iss_code: string
  @IsString() @Matches(/^\d+$/) iss_withholding_code: string
  @IsOptional() @IsString() municipal_service_code?: string
}

// Atualização de rascunho: não permite mudar a receita nem o valor já consolidado.
export class UpdateFiscalNoteDto extends FiscalNoteDto {}

export class CancelFiscalNoteDto {
  @IsString() @MinLength(15) @MaxLength(255) justification: string
}

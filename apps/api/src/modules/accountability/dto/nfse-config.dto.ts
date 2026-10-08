import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class ConfigureNfseDto {
  @IsString() @Matches(/^\d{14}$/) issuer_cnpj: string
  @IsString() @Matches(/^\d{7}$/) issuer_city_code: string
  @IsIn(['HOMOLOGACAO', 'PRODUCAO']) environment: 'HOMOLOGACAO' | 'PRODUCAO'
  @IsString() @MinLength(8) @MaxLength(500) token: string
  @IsOptional() @IsString() @MinLength(32) @MaxLength(255) webhook_secret?: string
}

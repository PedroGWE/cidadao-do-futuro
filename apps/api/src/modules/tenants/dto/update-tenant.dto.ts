import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator'
import { TenantType } from '@prisma/client'

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @IsOptional()
  @IsEnum(TenantType)
  type?: TenantType

  @IsOptional()
  @IsUrl()
  logo_url?: string

  @IsOptional()
  @IsString()
  cnpj?: string

  @IsOptional()
  settings?: Record<string, unknown>
}

import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { TenantType } from '@prisma/client'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsString()
  @MinLength(2)
  tenantName: string

  @IsString()
  @MinLength(2)
  tenantSlug: string

  @IsEnum(TenantType)
  tenantType: TenantType
}

import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { ParentescoType } from '@prisma/client'

export class CreateResponsavelDto {
  @IsString()
  @MinLength(2)
  nome_completo: string

  @IsEnum(ParentescoType)
  parentesco: ParentescoType

  @IsOptional()
  @IsString()
  cpf?: string

  @IsOptional()
  @IsString()
  telefone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  endereco?: Record<string, unknown>
}

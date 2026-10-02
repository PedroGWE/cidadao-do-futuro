import { PartnerStatus, PartnerType, PartnershipStatus, PartnershipType } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator'

export class CreatePartnerDto {
  @IsString() @MinLength(2) name: string
  @IsEnum(PartnerType) type: PartnerType
  @IsOptional() @IsString() cnpj_cpf?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsUrl({ require_protocol: true }) website?: string
  @IsOptional() @IsEnum(PartnerStatus) status?: PartnerStatus
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[]
  @IsOptional() @IsString() notes?: string
}

export class UpdatePartnerDto {
  @IsOptional() @IsString() @MinLength(2) name?: string
  @IsOptional() @IsEnum(PartnerType) type?: PartnerType
  @IsOptional() @IsString() cnpj_cpf?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsUrl({ require_protocol: true }) website?: string
  @IsOptional() @IsEnum(PartnerStatus) status?: PartnerStatus
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[]
  @IsOptional() @IsString() notes?: string
}

export class CreatePartnershipDto {
  @IsString() partner_id: string
  @IsOptional() @IsString() project_id?: string
  @IsEnum(PartnershipType) type: PartnershipType
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) value?: number
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) in_kind_value?: number
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsDateString() start_date?: string
  @IsOptional() @IsDateString() end_date?: string
  @IsOptional() @IsEnum(PartnershipStatus) status?: PartnershipStatus
  @IsOptional() @IsUrl({ require_protocol: true }) contract_url?: string
}

export class UpdatePartnershipDto {
  @IsOptional() @IsString() partner_id?: string
  @IsOptional() @IsString() project_id?: string
  @IsOptional() @IsEnum(PartnershipType) type?: PartnershipType
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) value?: number
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) in_kind_value?: number
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsDateString() start_date?: string
  @IsOptional() @IsDateString() end_date?: string
  @IsOptional() @IsEnum(PartnershipStatus) status?: PartnershipStatus
  @IsOptional() @IsUrl({ require_protocol: true }) contract_url?: string
}

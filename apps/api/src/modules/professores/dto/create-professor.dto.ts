import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { FormaPagamento, ProfessorStatus, TipoVinculo } from '@prisma/client'

export class CreateProfessorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nome_completo: string

  @IsString()
  cpf: string

  @IsOptional()
  @IsString()
  rg?: string

  @IsOptional()
  @IsDateString()
  data_nascimento?: string

  @IsOptional()
  @IsString()
  telefone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  foto_url?: string

  @IsOptional()
  @IsString()
  @MaxLength(8)
  cep?: string

  @IsOptional()
  @IsString()
  logradouro?: string

  @IsOptional()
  @IsString()
  numero?: string

  @IsOptional()
  @IsString()
  complemento?: string

  @IsOptional()
  @IsString()
  bairro?: string

  @IsOptional()
  @IsString()
  cidade?: string

  @IsOptional()
  @IsString()
  @MaxLength(2)
  uf?: string

  @IsOptional()
  @IsString()
  formacao_academica?: string

  @IsOptional()
  @IsString()
  especializacao?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disciplinas?: string[]

  @IsEnum(TipoVinculo)
  tipo_vinculo: TipoVinculo

  @IsOptional()
  @IsEnum(FormaPagamento)
  forma_pagamento?: FormaPagamento

  @IsOptional()
  dados_bancarios?: Record<string, unknown>

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  dia_pagamento?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valor_hora_aula?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valor_mensal?: number

  @IsOptional()
  @IsString()
  comprovante_formacao_url?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificados_urls?: string[]

  @IsOptional()
  @IsString()
  contrato_url?: string

  @IsOptional()
  @IsEnum(ProfessorStatus)
  status?: ProfessorStatus

  @IsOptional()
  @IsDateString()
  data_admissao?: string

  @IsOptional()
  @IsString()
  observacoes?: string
}

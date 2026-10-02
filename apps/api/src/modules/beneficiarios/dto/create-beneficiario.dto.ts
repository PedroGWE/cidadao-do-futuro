import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { BeneficiaryStatus, Gender, Race } from '@prisma/client'

export class CreateBeneficiarioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string

  @IsOptional()
  @IsString()
  cpf?: string

  @IsOptional()
  @IsDateString()
  birth_date?: string

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender

  @IsOptional()
  @IsEnum(Race)
  race?: Race

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
  rg_certidao?: string

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
  uf_endereco?: string

  @IsOptional()
  @IsString()
  turma?: string

  @IsOptional()
  @IsString()
  turno?: string

  @IsOptional()
  @IsString()
  escola?: string

  @IsOptional()
  @IsString()
  serie_ano?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  renda_familiar?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pessoas_residencia?: number

  @IsOptional()
  @IsString()
  necessidades_especiais?: string

  @IsOptional()
  @IsString()
  alergias?: string

  @IsOptional()
  @IsString()
  medicamentos?: string

  @IsOptional()
  @IsString()
  observacoes_gerais?: string

  @IsOptional()
  @IsBoolean()
  termo_consentimento?: boolean

  @IsOptional()
  @IsDateString()
  data_consentimento?: string

  @IsOptional()
  @IsBoolean()
  autorizacao_uso_imagem?: boolean

  @IsOptional()
  @IsString()
  documento_consentimento_url?: string

  @IsOptional()
  @IsEnum(BeneficiaryStatus)
  status?: BeneficiaryStatus

  @IsOptional()
  @IsString()
  project_id?: string
}

import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ProfessorStatus, TipoVinculo } from '@prisma/client'

export class QueryProfessoresDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(ProfessorStatus)
  status?: ProfessorStatus

  @IsOptional()
  @IsString()
  project_id?: string

  @IsOptional()
  @IsEnum(TipoVinculo)
  tipo_vinculo?: TipoVinculo

  @IsOptional()
  @IsString()
  disciplina?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20
}

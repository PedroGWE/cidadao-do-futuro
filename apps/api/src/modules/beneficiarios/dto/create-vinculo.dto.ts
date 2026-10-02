import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { VinculoStatus } from '@prisma/client'

export class CreateVinculoDto {
  @IsString()
  project_id: string

  @IsDateString()
  data_ingresso: string

  @IsOptional()
  @IsDateString()
  data_desligamento?: string

  @IsOptional()
  @IsEnum(VinculoStatus)
  status?: VinculoStatus

  @IsOptional()
  @IsString()
  turma?: string

  @IsOptional()
  @IsString()
  turno?: string
}

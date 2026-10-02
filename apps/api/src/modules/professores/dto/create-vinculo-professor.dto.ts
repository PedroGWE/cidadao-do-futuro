import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ProfessorStatus } from '@prisma/client'

export class CreateVinculoProfessorDto {
  @IsString()
  project_id: string

  @IsDateString()
  data_inicio: string

  @IsOptional()
  @IsDateString()
  data_fim?: string

  @IsOptional()
  @IsEnum(ProfessorStatus)
  status?: ProfessorStatus

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  carga_horaria_semanal?: number

  @IsOptional()
  dias_horarios?: Record<string, unknown>
}

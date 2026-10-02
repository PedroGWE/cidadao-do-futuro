import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateRemuneracaoDto {
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

  @IsDateString()
  data_vigencia: string

  @IsOptional()
  @IsString()
  motivo?: string
}

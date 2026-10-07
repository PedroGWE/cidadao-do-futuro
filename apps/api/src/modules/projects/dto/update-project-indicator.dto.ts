import { IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateProjectIndicatorDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current_value?: number
}

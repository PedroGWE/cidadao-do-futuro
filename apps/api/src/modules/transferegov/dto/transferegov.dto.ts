import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class ConfigureTransferegovDto {
  @IsString()
  cnpj: string

  @IsBoolean()
  automatic_sync: boolean

  @IsOptional()
  @IsInt()
  @Min(24)
  @Max(168)
  sync_interval_hours?: number
}

export class ImportTransferegovDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  record_ids: string[]

  @IsOptional()
  @IsString()
  project_id?: string
}

export class LinkTransferegovDto {
  @IsString()
  project_id: string
}

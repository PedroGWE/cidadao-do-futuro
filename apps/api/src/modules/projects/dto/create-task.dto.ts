import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { TaskPriority } from '@prisma/client'

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  phase_id?: string

  @IsOptional()
  @IsString()
  assigned_to?: string

  @IsOptional()
  @IsDateString()
  due_date?: string

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority
}

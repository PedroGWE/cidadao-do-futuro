import { IsEnum, IsOptional } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { TaskStatus } from '@prisma/client'
import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus
}

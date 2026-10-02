import { Module } from '@nestjs/common'
import { ConectaService } from './conecta.service'
import { ConectaStudentController } from './student.controller'
import { ConectaTeacherController } from './teacher.controller'

@Module({
  controllers: [ConectaStudentController, ConectaTeacherController],
  providers: [ConectaService],
  exports: [ConectaService],
})
export class ConectaModule {}

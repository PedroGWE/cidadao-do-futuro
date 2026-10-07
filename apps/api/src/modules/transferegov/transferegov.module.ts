import { Module } from '@nestjs/common'
import { TransferegovClient } from './transferegov.client'
import { TransferegovController } from './transferegov.controller'
import { TransferegovService } from './transferegov.service'

@Module({
  controllers: [TransferegovController],
  providers: [TransferegovClient, TransferegovService],
  exports: [TransferegovService],
})
export class TransferegovModule {}

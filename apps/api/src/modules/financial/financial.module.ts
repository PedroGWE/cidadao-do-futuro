import { Module } from '@nestjs/common'
import { BudgetsController } from './budgets.controller'
import { BudgetsService } from './budgets.service'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'

@Module({
  controllers: [BudgetsController, TransactionsController],
  providers: [BudgetsService, TransactionsService],
  exports: [BudgetsService, TransactionsService],
})
export class FinancialModule {}

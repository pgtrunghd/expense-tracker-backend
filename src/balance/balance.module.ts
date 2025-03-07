import { Module } from '@nestjs/common';
import { ExpenseService } from 'src/expense/expense.service';
import { IncomeService } from 'src/income/income.service';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/expense/entities/expense.entity';
import { Income } from 'src/income/entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income])],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}

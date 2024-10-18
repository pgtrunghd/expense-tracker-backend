import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Category } from 'src/category/entities/category.entity';
import { Income } from 'src/income/entity/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Category, Income])],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}

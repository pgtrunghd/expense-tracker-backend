import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { Budget } from './entities/budget.entity';
import { Expense } from 'src/expense/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Budget, Expense])],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}

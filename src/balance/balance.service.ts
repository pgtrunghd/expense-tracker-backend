import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from 'src/expense/entities/expense.entity';
import { Income } from 'src/income/entity/income.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  async getBalance() {
    const oneMonthAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    );
    const now = new Date();

    const expensesQuery = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('sum(expense.amount) as total_expense')
      .getRawOne()
      .then((result) => result?.total_expense ?? 0);

    const incomeQuery = await this.incomeRepository
      .createQueryBuilder('income')
      .select('sum(income.amount) as total_income')
      .getRawOne()
      .then((result) => result?.total_income ?? 0);

    const totalExpenseMonthQuery = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('sum(expense.amount) as total_expense')
      .where('expense.createDate between :oneMonthAgo and :now', {
        oneMonthAgo,
        now,
      })
      .getRawOne()
      .then((result) => result?.total_expense ?? 0);

    const totalIncomeMonthQuery = await this.incomeRepository
      .createQueryBuilder('income')
      .select('sum(income.amount) as total_income')
      .where('income.createDate between :oneMonthAgo and :now', {
        oneMonthAgo,
        now,
      })
      .getRawOne()
      .then((result) => result?.total_income ?? 0);

    return {
      balance: Number(incomeQuery) - Number(expensesQuery),
      totalExpense: Number(totalExpenseMonthQuery),
      totalIncome: Number(totalIncomeMonthQuery),
      totalSaving:
        Number(totalIncomeMonthQuery) - Number(totalExpenseMonthQuery),
    };
  }
}

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

  async incomeQuery(firstDay: Date, lastDay: Date) {
    const res = await this.incomeRepository
      .createQueryBuilder('income')
      .select('sum(income.amount) as total_income')
      .where('income.createDate between :firstDay and :lastDay', {
        firstDay,
        lastDay,
      })
      .getRawOne()
      .then((result) => result?.total_income ?? 0);

    return res;
  }

  async expenseQuery(firstDay: Date, lastDay: Date) {
    const res = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('sum(expense.amount) as total_expense')
      .where('expense.createDate between :firstDay and :lastDay', {
        firstDay,
        lastDay,
      })
      .getRawOne()
      .then((result) => result?.total_expense ?? 0);

    return res;
  }

  async getBalance(userId: string) {
    const expensesQuery = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('sum(expense.amount) as total_expense')
      .where('expense.userId = :userId', { userId })
      .getRawOne()
      .then((result) => result?.total_expense ?? 0);

    const incomeQuery = await this.incomeRepository
      .createQueryBuilder('income')
      .select('sum(income.amount) as total_income')
      .where('income.userId = :userId', { userId })
      .getRawOne()
      .then((result) => result?.total_income ?? 0);

    return {
      balance: Number(incomeQuery) - Number(expensesQuery),
    };
  }

  async getOverview(date: string) {
    const firstDay = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      1,
    );

    const lastDay = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const firstDayPrevMonth = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth() - 1,
      1,
    );

    const lastDayPrevMonth = new Date(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const totalExpenseMonthQuery = await this.expenseQuery(firstDay, lastDay);
    const totalIncomeMonthQuery = await this.incomeQuery(firstDay, lastDay);

    const totalExpensePrevMonthQuery = await this.expenseQuery(
      firstDayPrevMonth,
      lastDayPrevMonth,
    );
    const totalIncomePrevMonthQuery = await this.incomeQuery(
      firstDayPrevMonth,
      lastDayPrevMonth,
    );

    return {
      totalExpense: Number(totalExpenseMonthQuery),
      totalIncome: Number(totalIncomeMonthQuery),
      totalSaving:
        Number(totalIncomeMonthQuery) - Number(totalExpenseMonthQuery),
      totalExpensePrevMonth: Number(totalExpensePrevMonthQuery),
      totalIncomePrevMonth: Number(totalIncomePrevMonthQuery),
      totalSavingPrevMonth:
        Number(totalIncomePrevMonthQuery) - Number(totalExpensePrevMonthQuery),
    };
  }
}

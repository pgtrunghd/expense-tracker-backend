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

  async getBalance() {
    const firstDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const lastDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const firstDayPrevMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    );

    const lastDayPrevMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

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

    const totalExpenseMonthQuery = await this.expenseQuery(firstDay, lastDay);
    const totalIncomeMonthQuery = await this.incomeQuery(firstDay, lastDay);

    const totalExpensePrevMonthQuery = await this.incomeQuery(
      firstDayPrevMonth,
      lastDayPrevMonth,
    );
    const totalIncomePrevMonthQuery = await this.expenseQuery(
      firstDayPrevMonth,
      lastDayPrevMonth,
    );

    return {
      balance: Number(incomeQuery) - Number(expensesQuery),
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { Income } from 'src/income/entities/income.entity';
import { User } from 'src/user/entities/user.entity';
import { createPaginationResult } from 'src/common/pagination/pagination.util';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    const { categoryId, ...expenseData } = createExpenseDto;
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expense = this.expenseRepository.create({
      ...expenseData,
      category,
      user,
    });
    return this.expenseRepository.save(expense);
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const { categoryId, ...updateData } = updateExpenseDto;

    const expense = await this.expenseRepository.findOne({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    expense.category = category;
    Object.assign(expense, updateData);

    return this.expenseRepository.save(expense);
  }

  async findAll(pagination: PaginationDto, userId: string): Promise<any> {
    const { page, take, skip } = pagination;
    const [data, total] = await this.expenseRepository.findAndCount({
      where: { user: { id: userId } },
      skip,
      take,
      relations: ['category', 'user'],
      order: { createDate: 'desc' },
    });

    return createPaginationResult(data, page, total, take);
  }

  delete(id: string) {
    return this.expenseRepository.delete(id);
  }

  async getExpensesByDay(date: Date): Promise<Expense[]> {
    const startDay = new Date(date.setHours(0, 0, 0, 0));
    const endDay = new Date(date.setHours(23, 59, 59, 999));
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.createDate BETWEEN :startDay AND :endDay', {
        startDay,
        endDay,
      })
      .orderBy('expense.createDate', 'ASC');

    return await query.getMany();
  }

  async getExpensesByMonth(date: string, userId: string): Promise<Expense[]> {
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

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.createDate between :firstDay and :lastDay', {
        firstDay,
        lastDay,
      })
      .orderBy('expense.createDate', 'ASC');

    return await query.getMany();
  }

  async getTopExpenses(): Promise<any> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.amount')
      .leftJoinAndSelect('expense.category', 'category');
    return await query.getMany();
  }

  async getRecent(date: string, userId: string): Promise<any> {
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

    const expenseRecent = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .leftJoinAndSelect('expense.user', 'user')
      .where('expense.user.id = :userId', { userId })
      .andWhere('expense.createDate BETWEEN :firstDay AND :lastDay', {
        firstDay,
        lastDay,
      })
      .orderBy('expense.createDate', 'DESC')
      .getMany();

    const incomeRecent = await this.incomeRepository
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.category', 'category')
      .leftJoinAndSelect('income.user', 'user')
      .where('income.user.id = :userId', { userId })
      .andWhere('income.createDate BETWEEN :firstDay AND :lastDay', {
        firstDay,
        lastDay,
      })
      .orderBy('income.createDate', 'DESC')
      .getMany();

    const recent = [
      ...expenseRecent.map((item) => ({
        ...item,
        type: 'expense',
      })),
      ...incomeRecent.map((item) => ({
        ...item,
        type: 'income',
      })),
    ].sort((a, b) => {
      return (
        new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
      );
    });

    return recent;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { Income } from 'src/income/entity/income.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    return new Date(startOfWeek.setDate(startOfWeek.getDate() + 6));
  }

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { categoryId, ...expenseData } = createExpenseDto;
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const expense = this.expenseRepository.create({
      ...expenseData,
      category,
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

  async findAll(pagination: PaginationDto): Promise<any> {
    const { page, take } = pagination;
    const [data, total] = await this.expenseRepository.findAndCount({
      skip: (page - 1) * take,
      take,
      relations: ['category'],
      order: { createDate: 'desc' },
    });

    const pageCount = Math.ceil(total / take);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < pageCount;

    return {
      data,
      meta: {
        page,
        take,
        itemCount: total,
        pageCount,
        hasPreviousPage,
        hasNextPage,
      },
    };
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

  async getExpensesByWeek(date: Date): Promise<Expense[]> {
    const startOfWeekDate = this.getStartOfWeek(date);
    const endOfWeekDate = this.getEndOfWeek(date);

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.amount')
      .addSelect('expense.createDate')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.createDate BETWEEN :startOfWeekDate AND :endOfWeekDate', {
        startOfWeekDate,
        endOfWeekDate,
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

  async getRecent(): Promise<any> {
    const expenseRecent = await this.expenseRepository
      .createQueryBuilder('expense')
      .orderBy('expense.createDate', 'DESC')
      .limit(5)
      .getMany();

    const incomeRecent = await this.incomeRepository
      .createQueryBuilder('income')
      .orderBy('income.createDate', 'DESC')
      .limit(5)
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
        new Date(b .createDate).getTime() - new Date(a.createDate).getTime()
      );
    });

    return recent;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { DataSource, Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { Income } from 'src/income/entities/income.entity';
import { User } from 'src/user/entities/user.entity';
import { createPaginationResult } from 'src/common/pagination/pagination.util';
import { getVietnamDate } from 'src/common/utils/timezone';

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
    private dataSource: DataSource,
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

  async getRecent(
    date: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<any> {
    const { page, take, skip } = pagination;

    const firstDay = getVietnamDate(
      new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1),
    );

    const lastDay = getVietnamDate(
      new Date(
        new Date(date).getFullYear(),
        new Date(date).getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );

    console.log(
      'Server timezone:',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    console.log('Current time:', getVietnamDate(new Date()).toString());

    const rawQuery = `
    (
      SELECT 
        e.id,
        e.amount,
        e."createDate",
        'expense' as type,
        row_to_json(c) as category
      FROM expense e
      JOIN category c ON c.id = e."categoryId"
      WHERE e."userId" = $1
        AND e."createDate" BETWEEN $2 AND $3
    )
    UNION ALL
    (
      SELECT 
        i.id,
        i.amount,
        i."createDate",
        'income' as type,
        row_to_json(c) as category
      FROM income i
      JOIN category c ON c.id = i."categoryId"
      WHERE i."userId" = $1
        AND i."createDate" BETWEEN $2 AND $3
    )
    ORDER BY "createDate" DESC
    LIMIT $4 OFFSET $5
  `;

    const rawTotalQuery = `
    SELECT COUNT(*) FROM (
      SELECT e.id FROM expense e 
        WHERE e."userId" = $1 AND e."createDate" BETWEEN $2 AND $3
      UNION ALL
      SELECT i.id FROM income i 
        WHERE i."userId" = $1 AND i."createDate" BETWEEN $2 AND $3
    ) as combined;
  `;

    const data = await this.dataSource.query(rawQuery, [
      userId,
      firstDay,
      lastDay,
      take,
      skip,
    ]);
    const totalResult = await this.dataSource.query(rawTotalQuery, [
      userId,
      firstDay,
      lastDay,
    ]);
    const total = parseInt(totalResult[0].count, 10);

    return createPaginationResult(data, page, total, take);
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { createPaginationResult } from 'src/common/pagination/pagination.util';
import { getTime, timeZone } from 'src/common/utils/timezone';
import { Expense } from 'src/expense/entities/expense.entity';
import { User } from 'src/user/entities/user.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    @InjectRepository(Budget) private budgetRepository: Repository<Budget>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Expense) private expenseRepository: Repository<Expense>,
  ) {}

  async create(
    createBudgetDto: CreateBudgetDto,
    userId: string,
  ): Promise<void> {
    const { categoryId, ...budgetDto } = createBudgetDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const calculateSpending: { sum: number } = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('sum(expense.amount)', 'sum')
      .where('expense.userId = :userId', {
        userId,
      })
      .andWhere('expense.categoryId = :categoryId', {
        categoryId: categoryId,
      })
      .andWhere('expense.createDate between :start and :end', {
        start: budgetDto.startDate,
        end: budgetDto.endDate,
      })
      .getRawOne();

    const budget = this.budgetRepository.create({
      ...budgetDto,
      currentSpending: +calculateSpending.sum,
      category,
      user,
    });

    this.budgetRepository.save(budget);
  }

  async findAll(
    pagination: PaginationDto,
    userId: string,
    date: string,
  ): Promise<any> {
    const parsedDate = getTime(date);

    const { page, take, skip } = pagination;
    const [data, total] = await this.budgetRepository.findAndCount({
      where: {
        user: { id: userId },
        startDate: LessThanOrEqual(parsedDate),
        endDate: MoreThanOrEqual(parsedDate),
      },
      skip,
      take,
      relations: ['category'],
      order: { createAt: 'DESC' },
    });

    return createPaginationResult(data, page, total, take);
  }

  async update(
    budgetId: string,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<void> {
    const budget: Budget = await this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.id = :id', { budgetId })
      .getRawOne();

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    Object.assign(budget, updateBudgetDto);

    this.budgetRepository.save(budget);
  }

  async remove(budgetId: string): Promise<void> {
    await this.budgetRepository.delete(budgetId);
  }

  @Cron('0 0 * * *', { timeZone: timeZone })
  async handleRecurringBudget() {
    const now = DateTime.now().setZone(timeZone);

    const budgets = await this.budgetRepository.find({
      where: {
        isRecurring: true,
      },
      relations: ['category', 'user'],
    });

    for (const budget of budgets) {
      const end = DateTime.fromJSDate(budget.endDate).setZone(timeZone);

      if (budget.isRecurring && now > end.endOf('day')) {
        await this.createNextRecurringBudget(budget);
        this.logger.log(`Recurring budget created: ${budget.id}`);
      }
    }
  }

  private async createNextRecurringBudget(prevBudget: Budget) {
    const prevStart = DateTime.fromJSDate(prevBudget.startDate).setZone(
      timeZone,
    );
    const prevEnd = DateTime.fromJSDate(prevBudget.endDate).setZone(timeZone);
    const duration = prevEnd.diff(prevStart);
    const newStart = prevEnd.plus({ days: 1 }).startOf('day');
    const newEnd = newStart.plus(duration);

    const newBudget = this.budgetRepository.create({
      ...prevBudget,
      startDate: newStart.toJSDate(),
      endDate: newEnd.toJSDate(),
      isRecurring: true,
      isActive: true,
      currentSpending: 0,
    });

    await this.budgetRepository.save(newBudget);

    await this.budgetRepository.update(prevBudget.id, {
      isActive: false,
    });
  }
}

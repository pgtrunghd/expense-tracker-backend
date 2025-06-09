import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { Expense } from 'src/expense/entities/expense.entity';
import { createPaginationResult } from 'src/common/pagination/pagination.util';

@Injectable()
export class BudgetService {
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

  async findAll(pagination: PaginationDto, userId: string): Promise<any> {
    const { page, take, skip } = pagination;
    const [data, total] = await this.budgetRepository.findAndCount({
      where: { user: { id: userId } },
      skip,
      take,
      relations: ['category'],
      order: { createAt: 'DESC' },
    });

    return createPaginationResult(data, page, total, take);
  }

  // findOne(id: number, userId: string) {
  //   return `This action returns a #${id} budget`;
  // }

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
}

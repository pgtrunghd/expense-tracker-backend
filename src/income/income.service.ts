import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { Repository } from 'typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createIncomeDto: CreateIncomeDto,
    userId: string,
  ): Promise<Income> {
    const { categoryId, ...incomeData } = createIncomeDto;
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

    const income = this.incomeRepository.create({
      ...incomeData,
      category,
      user,
    });
    return this.incomeRepository.save(income);
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto): Promise<Income> {
    const income = await this.incomeRepository.findOne({ where: { id } });

    if (!income) {
      throw new NotFoundException('Income not found');
    }
    Object.assign(income, updateIncomeDto);

    return this.incomeRepository.save(income);
  }

  delete(id: string) {
    return this.incomeRepository.delete(id);
  }

  async findAll(pagination: PaginationDto, userId: string): Promise<any> {
    const { page, take } = pagination;
    const [data, total] = await this.incomeRepository.findAndCount({
      where: { user: { id: userId } },
      skip: (page - 1) * take,
      take,
      order: { createDate: 'DESC' },
    });

    const pageCount = Math.ceil(total / take);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < pageCount;

    return {
      data,
      meta: {
        page,
        take,
        pageCount,
        hasPreviousPage,
        hasNextPage,
        itemCount: total,
      },
    };
  }
}

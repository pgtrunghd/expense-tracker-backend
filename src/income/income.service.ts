import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { Repository } from 'typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { createPaginationResult } from 'src/common/pagination/pagination.util';

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
    const { page, take, skip } = pagination;
    const [data, total] = await this.incomeRepository.findAndCount({
      where: { user: { id: userId } },
      skip,
      take,
      order: { createDate: 'DESC' },
    });

    return createPaginationResult(data, page, total, take);
  }
}

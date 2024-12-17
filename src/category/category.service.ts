import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .getOne();

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user,
    });
    return this.categoryRepository.save(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
      // relations: ['expenses', 'incomes', 'user'],
    });
  }

  delete(id: string) {
    return this.categoryRepository.delete(id);
  }

  async getCategoriesByDay(date: Date): Promise<Category[]> {
    const startDay = new Date(date.setHours(0, 0, 0, 0));
    const endDay = new Date(date.setHours(23, 59, 59, 999));
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.expenses', 'expense')
      .where('expense.createDate BETWEEN :startDay AND :endDay', {
        startDay,
        endDay,
      })
      .orderBy('category.name', 'ASC');

    return await query.getMany();
  }
}

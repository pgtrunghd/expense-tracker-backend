import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/user/user.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @User('userId') userId: string,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') categoryId: string,
    @Body() updateCategory: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(categoryId, updateCategory);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto, @User('userId') userId: string) {
    return this.categoryService.findAll(pagination, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('top-expenses')
  async getTopExpenses(
    @Query('date') date: string,
    @User('userId') userId: string,
  ) {
    return this.categoryService.getTopExpenses(date, userId);
  }
}

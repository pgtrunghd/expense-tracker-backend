import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createBudgetDto: CreateBudgetDto,
    @User('userId') userId: string,
  ) {
    return this.budgetService.create(createBudgetDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @User('userId') userId: string,
    @Query('date') date: string,
  ) {
    return this.budgetService.findAll(pagination, userId, date);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get(':id')
  // findOne(@Param('id') id: string, @User('userId') userId: string) {
  //   return this.budgetService.findOne(+id, userId);
  // }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') budgetId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetService.update(budgetId, updateBudgetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') budgetId: string) {
    return this.budgetService.remove(budgetId);
  }
}

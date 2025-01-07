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
  Session,
  Request,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { Expense } from './entities/expense.entity';
import { User } from 'src/user/user.decorator';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @User('userId') userId: string,
  ) {
    return this.expenseService.create(createExpenseDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') expenseId: string,
    @Body() updateExpense: UpdateExpenseDto,
  ) {
    return this.expenseService.update(expenseId, updateExpense);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto, @User('userId') userId: string) {
    return this.expenseService.findAll(pagination, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-day')
  async getExpensesByDay(@Query('date') date: string) {
    const parseDate = new Date(date);

    return this.expenseService.getExpensesByDay(parseDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-month')
  async getExpensesByMonth(
    @Query('date') date: string,
    @User('userId') userId: string,
  ) {
    return this.expenseService.getExpensesByMonth(date, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('top-expenses')
  async getTopExpenses() {
    return this.expenseService.getTopExpenses();
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent-activity')
  async getRecent(@User('userId') userId: string) {
    return this.expenseService.getRecent(userId);
  }
}

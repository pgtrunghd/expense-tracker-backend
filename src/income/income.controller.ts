import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateIncomeDto } from './dto/create-income.dto';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { User } from 'src/user/user.decorator';

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createIncomeDto: CreateIncomeDto,
    @User('userId') userId: string,
  ) {
    return this.incomeService.create(createIncomeDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto, @User('userId') userId: string) {
    return this.incomeService.findAll(pagination, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Body() updateIncomeDto: UpdateIncomeDto,
    @Param('id') incomeId: string,
  ) {
    return this.incomeService.update(incomeId, updateIncomeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') incomeId: string) {
    return this.incomeService.delete(incomeId);
  }
}

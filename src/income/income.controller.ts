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

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.incomeService.findAll(pagination);
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

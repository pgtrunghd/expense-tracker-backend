import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { User } from 'src/user/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getBalance(@User('userId') userId: string) {
    return this.balanceService.getBalance(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  getOverview(@Query('date') date: string) {
    return this.balanceService.getOverview(date ?? new Date().toISOString());
  }
}

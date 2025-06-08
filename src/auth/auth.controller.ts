import {
  Body,
  Controller,
  Post,
  Request,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Session() session: Record<string, any>) {
    return this.authService.login(req.user, session);
  }

  @Post('refresh')
  async refresh(
    @Body() { refreshToken, userId }: { refreshToken: string; userId: string },
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}

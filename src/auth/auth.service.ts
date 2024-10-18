import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { username: string; id: string; refreshToken: string }) {
    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        process.env.JWT_REFRESH_SECRET_KEY,
      ),
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRE_IN') || '15m',
    });

    const encryptRefreshToken = await bcrypt.hash(refresh_token, 10);

    await this.userService.updateRefreshToken(user.id, encryptRefreshToken);

    return {
      access_token,
      refresh_token,
      id: user.id,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOneById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const compareRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!compareRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const payload = { username: user.username, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload);
    return {
      access_token: newAccessToken,
    };
  }
}

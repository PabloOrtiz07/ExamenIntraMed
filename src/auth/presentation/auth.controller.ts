import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginUseCase } from '../application/login.use-case';
import { SignUpUseCase } from '../application/sign-up.use-case';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUp: SignUpUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Post('sign-up')
  async register(@Body() dto: SignUpDto) {
    const user = await this.signUp.execute(dto);
    return { id: user.id, email: user.email, role: user.role };
  }

  @Post('login')
  @HttpCode(200)
  authenticate(@Body() dto: LoginDto) {
    return this.login.execute(dto);
  }
}
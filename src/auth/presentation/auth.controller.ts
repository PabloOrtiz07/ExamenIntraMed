import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUseCase } from '../application/login.use-case';
import { SignUpUseCase } from '../application/sign-up.use-case';
import { LoginResponseDto, SignUpResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUp: SignUpUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user (always with the regular role)' })
  @ApiCreatedResponse({ type: SignUpResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  async register(@Body() dto: SignUpDto): Promise<SignUpResponseDto> {
    const user = await this.signUp.execute(dto);
    return { id: user.id as string, email: user.email, role: user.role };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in and get an access token' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  authenticate(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.login.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Show the identity stored in the current token' })
  @ApiOkResponse({ description: 'Token payload: sub, email, role, iat, exp' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
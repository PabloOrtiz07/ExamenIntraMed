import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../users/domain/user.repository';
import { PasswordHasher } from './password-hasher';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<{ accessToken: string }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    const valid = user ? await this.hasher.compare(input.password, user.passwordHash) : false;
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken };
  }
}
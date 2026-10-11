import { ConflictException, Injectable } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../users/domain/user.entity';
import { UserRepository } from '../../users/domain/user.repository';
import { PasswordHasher } from './password-hasher';

export interface SignUpInput {
  email: string;
  password: string;
}

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: SignUpInput): Promise<User> {
    const email = input.email.trim().toLowerCase();

    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hasher.hash(input.password);
    return this.users.save(new User(null, email, passwordHash, Role.REGULAR));
  }
}
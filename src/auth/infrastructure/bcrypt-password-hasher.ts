import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../application/password-hasher';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private static readonly SALT_ROUNDS = 10;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BcryptPasswordHasher.SALT_ROUNDS);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
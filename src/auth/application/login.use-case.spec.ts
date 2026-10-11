import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../users/domain/user.entity';
import { UserRepository } from '../../users/domain/user.repository';
import { LoginUseCase } from './login.use-case';
import { PasswordHasher } from './password-hasher';

describe('LoginUseCase', () => {
  let users: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<PasswordHasher>;
  let jwt: jest.Mocked<JwtService>;
  let useCase: LoginUseCase;

  const admin = new User('id-1', 'admin@example.com', 'stored-hash', Role.ADMIN);

  beforeEach(() => {
    users = { findByEmail: jest.fn(), findById: jest.fn(), save: jest.fn() };
    hasher = { hash: jest.fn(), compare: jest.fn() };
    jwt = { signAsync: jest.fn() } as unknown as jest.Mocked<JwtService>;
    useCase = new LoginUseCase(users, hasher, jwt);
  });

  it('returns a token carrying sub, email and role when the credentials are valid', async () => {
    users.findByEmail.mockResolvedValue(admin);
    hasher.compare.mockResolvedValue(true);
    jwt.signAsync.mockResolvedValue('signed-token');

    const result = await useCase.execute({ email: 'Admin@Example.com', password: 'secret' });

    expect(users.findByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(hasher.compare).toHaveBeenCalledWith('secret', 'stored-hash');
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 'id-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });
    expect(result).toEqual({ accessToken: 'signed-token' });
  });

  it('rejects an unknown email with the same error as a wrong password', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'nobody@test.com', password: 'x' })).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('rejects a wrong password and never signs a token', async () => {
    users.findByEmail.mockResolvedValue(admin);
    hasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'admin@example.com', password: 'wrong' })).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
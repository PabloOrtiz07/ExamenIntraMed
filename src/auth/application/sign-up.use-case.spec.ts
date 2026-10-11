import { ConflictException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../users/domain/user.entity';
import { UserRepository } from '../../users/domain/user.repository';
import { PasswordHasher } from './password-hasher';
import { SignUpUseCase } from './sign-up.use-case';

describe('SignUpUseCase', () => {
  let users: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<PasswordHasher>;
  let useCase: SignUpUseCase;

  beforeEach(() => {
    users = { findByEmail: jest.fn(), findById: jest.fn(), save: jest.fn() };
    hasher = { hash: jest.fn(), compare: jest.fn() };
    useCase = new SignUpUseCase(users, hasher);
  });

  it('creates a regular user with a hashed password and a normalized email', async () => {
    users.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed');
    users.save.mockImplementation(
      async (user) => new User('id-1', user.email, user.passwordHash, user.role),
    );

    const result = await useCase.execute({ email: '  Pablo@Test.com ', password: 'Password123' });

    expect(users.findByEmail).toHaveBeenCalledWith('pablo@test.com');
    expect(hasher.hash).toHaveBeenCalledWith('Password123');
    const saved = users.save.mock.calls[0][0];
    expect(saved.email).toBe('pablo@test.com');
    expect(saved.passwordHash).toBe('hashed');
    expect(saved.role).toBe(Role.REGULAR);
    expect(result.id).toBe('id-1');
  });

  it('rejects an email that is already registered', async () => {
    users.findByEmail.mockResolvedValue(new User('id-1', 'pablo@test.com', 'h', Role.REGULAR));

    await expect(
      useCase.execute({ email: 'pablo@test.com', password: 'Password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(users.save).not.toHaveBeenCalled();
  });
});
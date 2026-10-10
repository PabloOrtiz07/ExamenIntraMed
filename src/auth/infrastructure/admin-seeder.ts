import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../users/domain/user.entity';
import { UserRepository } from '../../users/domain/user.repository';
import { PasswordHasher } from '../application/password-hasher';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set: skipping admin seed');
      return;
    }

    if (await this.users.findByEmail(email)) {
      this.logger.log('Admin already exists: skipping seed');
      return;
    }

    const passwordHash = await this.hasher.hash(password);
    await this.users.save(new User(null, email, passwordHash, Role.ADMIN));
    this.logger.log(`Admin user created: ${email}`);
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './domain/user.repository';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [{ provide: UserRepository, useClass: TypeOrmUserRepository }],
  exports: [UserRepository],
})
export class UsersModule {}
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/login.use-case';
import { PasswordHasher } from './application/password-hasher';
import { SignUpUseCase } from './application/sign-up.use-case';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: Number(config.get('JWT_EXPIRES_IN_SECONDS', 3600)) },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignUpUseCase,
    LoginUseCase,
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
})
export class AuthModule {}
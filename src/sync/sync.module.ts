import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MoviesModule } from '../movies/movies.module';
import { FilmsProvider } from './application/films-provider';
import { SyncMoviesUseCase } from './application/sync-movies.use-case';
import { SwapiFilmsClient } from './infrastructure/swapi-films.client';
import { SyncCron } from './infrastructure/sync.cron';
import { SyncController } from './presentation/sync.controller';

@Module({
  imports: [MoviesModule, AuthModule],
  controllers: [SyncController],
  providers: [
    SyncMoviesUseCase,
    SyncCron,
    { provide: FilmsProvider, useClass: SwapiFilmsClient },
  ],
})
export class SyncModule {}
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncMoviesUseCase } from '../application/sync-movies.use-case';

@Injectable()
export class SyncCron {
  private readonly logger = new Logger(SyncCron.name);

  constructor(private readonly syncMovies: SyncMoviesUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'sync-movies' })
  async run(): Promise<void> {
    try {
      const result = await this.syncMovies.execute();
      this.logger.log(`Scheduled sync finished: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        'Scheduled sync failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
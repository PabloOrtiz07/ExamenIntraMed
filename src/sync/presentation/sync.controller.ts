import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { SyncMoviesUseCase } from '../application/sync-movies.use-case';
import { SyncResultDto } from './dto/sync-result.dto';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncMovies: SyncMoviesUseCase) {}

  @Post('movies')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Import films from the Star Wars API (admin only)',
    description: 'Idempotent: movies that already exist are skipped. A cron also runs it daily at 3 AM.',
  })
  @ApiOkResponse({ type: SyncResultDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Only admins can run the sync' })
  @ApiBadGatewayResponse({ description: 'The Star Wars API is unreachable or failed' })
  run(): Promise<SyncResultDto> {
    return this.syncMovies.execute();
  }
}
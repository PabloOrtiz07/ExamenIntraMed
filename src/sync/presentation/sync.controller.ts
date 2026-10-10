import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { SyncMoviesUseCase } from '../application/sync-movies.use-case';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncMovies: SyncMoviesUseCase) {}

  @Post('movies')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  run() {
    return this.syncMovies.execute();
  }
}
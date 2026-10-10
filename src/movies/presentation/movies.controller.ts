import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { CreateMovieUseCase } from '../application/create-movie.use-case';
import { DeleteMovieUseCase } from '../application/delete-movie.use-case';
import { GetMovieUseCase } from '../application/get-movie.use-case';
import { ListMoviesUseCase } from '../application/list-movies.use-case';
import { UpdateMovieUseCase } from '../application/update-movie.use-case';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly listMovies: ListMoviesUseCase,
    private readonly getMovie: GetMovieUseCase,
    private readonly createMovie: CreateMovieUseCase,
    private readonly updateMovie: UpdateMovieUseCase,
    private readonly deleteMovie: DeleteMovieUseCase,
  ) {}

  @Get()
  list() {
    return this.listMovies.execute();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REGULAR, Role.ADMIN)
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.getMovie.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateMovieDto) {
    return this.createMovie.execute(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMovieDto) {
    return this.updateMovie.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteMovie.execute(id);
  }
}
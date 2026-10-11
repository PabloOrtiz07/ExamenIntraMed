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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { CreateMovieUseCase } from '../application/create-movie.use-case';
import { DeleteMovieUseCase } from '../application/delete-movie.use-case';
import { GetMovieUseCase } from '../application/get-movie.use-case';
import { ListMoviesUseCase } from '../application/list-movies.use-case';
import { UpdateMovieUseCase } from '../application/update-movie.use-case';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@ApiTags('Movies')
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
  @ApiOperation({ summary: 'List all movies (public)' })
  @ApiOkResponse({ type: MovieResponseDto, isArray: true })
  async list(): Promise<MovieResponseDto[]> {
    const movies = await this.listMovies.execute();
    return movies.map((movie) => MovieResponseDto.fromDomain(movie));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REGULAR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get movie details (regular users and admins)' })
  @ApiOkResponse({ type: MovieResponseDto })
  @ApiBadRequestResponse({ description: 'The id is not a valid UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiNotFoundResponse({ description: 'Movie not found' })
  async detail(@Param('id', ParseUUIDPipe) id: string): Promise<MovieResponseDto> {
    return MovieResponseDto.fromDomain(await this.getMovie.execute(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a movie (admin only)' })
  @ApiCreatedResponse({ type: MovieResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Only admins can create movies' })
  async create(@Body() dto: CreateMovieDto): Promise<MovieResponseDto> {
    return MovieResponseDto.fromDomain(await this.createMovie.execute(dto));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a movie, partial update (admin only)' })
  @ApiOkResponse({ type: MovieResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Only admins can update movies' })
  @ApiNotFoundResponse({ description: 'Movie not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    return MovieResponseDto.fromDomain(await this.updateMovie.execute(id, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie (admin only)' })
  @ApiNoContentResponse({ description: 'Movie deleted' })
  @ApiBadRequestResponse({ description: 'The id is not a valid UUID' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Only admins can delete movies' })
  @ApiNotFoundResponse({ description: 'Movie not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteMovie.execute(id);
  }
}
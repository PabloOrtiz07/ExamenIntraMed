import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CreateMovieUseCase } from './application/create-movie.use-case';
import { DeleteMovieUseCase } from './application/delete-movie.use-case';
import { GetMovieUseCase } from './application/get-movie.use-case';
import { ListMoviesUseCase } from './application/list-movies.use-case';
import { UpdateMovieUseCase } from './application/update-movie.use-case';
import { MovieRepository } from './domain/movie.repository';
import { MovieOrmEntity } from './infrastructure/movie.orm-entity';
import { TypeOrmMovieRepository } from './infrastructure/typeorm-movie.repository';
import { MoviesController } from './presentation/movies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MovieOrmEntity]), AuthModule],
  controllers: [MoviesController],
  providers: [
    { provide: MovieRepository, useClass: TypeOrmMovieRepository },
    ListMoviesUseCase,
    GetMovieUseCase,
    CreateMovieUseCase,
    UpdateMovieUseCase,
    DeleteMovieUseCase,
  ],
  exports: [MovieRepository],
})
export class MoviesModule {}
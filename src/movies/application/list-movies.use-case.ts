import { Injectable } from '@nestjs/common';
import { Movie } from '../domain/movie.entity';
import { MovieRepository } from '../domain/movie.repository';

@Injectable()
export class ListMoviesUseCase {
  constructor(private readonly movies: MovieRepository) {}

  execute(): Promise<Movie[]> {
    return this.movies.findAll();
  }
}
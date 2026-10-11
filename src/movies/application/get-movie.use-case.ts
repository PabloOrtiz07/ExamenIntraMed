import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from '../domain/movie.entity';
import { MovieRepository } from '../domain/movie.repository';

@Injectable()
export class GetMovieUseCase {
  constructor(private readonly movies: MovieRepository) {}

  async execute(id: string): Promise<Movie> {
    const movie = await this.movies.findById(id);
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
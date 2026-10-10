import { Injectable, NotFoundException } from '@nestjs/common';
import { MovieRepository } from '../domain/movie.repository';

@Injectable()
export class DeleteMovieUseCase {
  constructor(private readonly movies: MovieRepository) {}

  async execute(id: string): Promise<void> {
    const movie = await this.movies.findById(id);
    if (!movie) throw new NotFoundException('Movie not found');
    await this.movies.delete(id);
  }
}
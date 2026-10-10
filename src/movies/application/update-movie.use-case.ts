import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from '../domain/movie.entity';
import { MovieRepository } from '../domain/movie.repository';
import { CreateMovieInput } from './create-movie.use-case';

export type UpdateMovieInput = Partial<CreateMovieInput>;

@Injectable()
export class UpdateMovieUseCase {
  constructor(private readonly movies: MovieRepository) {}

  async execute(id: string, input: UpdateMovieInput): Promise<Movie> {
    const current = await this.movies.findById(id);
    if (!current) throw new NotFoundException('Movie not found');

    return this.movies.save(
      new Movie(
        current.id,
        input.title ?? current.title,
        input.episodeId ?? current.episodeId,
        input.openingCrawl ?? current.openingCrawl,
        input.director ?? current.director,
        input.producer ?? current.producer,
        input.releaseDate ?? current.releaseDate,
        current.externalUrl,
      ),
    );
  }
}
import { Injectable } from '@nestjs/common';
import { Movie } from '../domain/movie.entity';
import { MovieRepository } from '../domain/movie.repository';

export interface CreateMovieInput {
  title: string;
  episodeId: number;
  openingCrawl: string;
  director: string;
  producer: string;
  releaseDate: Date;
}

@Injectable()
export class CreateMovieUseCase {
  constructor(private readonly movies: MovieRepository) {}

  execute(input: CreateMovieInput): Promise<Movie> {
    return this.movies.save(
      new Movie(
        null,
        input.title,
        input.episodeId,
        input.openingCrawl,
        input.director,
        input.producer,
        input.releaseDate,
      ),
    );
  }
}
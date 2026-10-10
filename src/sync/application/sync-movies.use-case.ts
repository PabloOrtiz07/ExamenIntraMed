import { Injectable } from '@nestjs/common';
import { Movie } from '../../movies/domain/movie.entity';
import { MovieRepository } from '../../movies/domain/movie.repository';
import { ExternalFilm, FilmsProvider } from './films-provider';

export interface SyncResult {
  fetched: number;
  created: number;
  skipped: number;
}

@Injectable()
export class SyncMoviesUseCase {
  constructor(
    private readonly films: FilmsProvider,
    private readonly movies: MovieRepository,
  ) {}

  async execute(): Promise<SyncResult> {
    const films = this.uniqueByUrl(await this.films.fetchFilms());
    const existing = new Set(
      await this.movies.findExistingExternalUrls(films.map((film) => film.url)),
    );

    const toCreate = films
      .filter((film) => !existing.has(film.url))
      .map(
        (film) =>
          new Movie(
            null,
            film.title,
            film.episodeId,
            film.openingCrawl,
            film.director,
            film.producer,
            film.releaseDate,
            film.url,
          ),
      );

    await this.movies.saveMany(toCreate);

    return {
      fetched: films.length,
      created: toCreate.length,
      skipped: films.length - toCreate.length,
    };
  }

  private uniqueByUrl(films: ExternalFilm[]): ExternalFilm[] {
    return [...new Map(films.map((film) => [film.url, film])).values()];
  }
}
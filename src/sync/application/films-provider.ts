export interface ExternalFilm {
  title: string;
  episodeId: number;
  openingCrawl: string;
  director: string;
  producer: string;
  releaseDate: Date;
  url: string;
}

export abstract class FilmsProvider {
  abstract fetchFilms(): Promise<ExternalFilm[]>;
}
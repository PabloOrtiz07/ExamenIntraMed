import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalFilm, FilmsProvider } from '../application/films-provider';

interface SwapiFilm {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  url: string;
}

interface SwapiPage {
  results: SwapiFilm[];
  next: string | null;
}

const MAX_PAGES = 10;
const TIMEOUT_MS = 10_000;

@Injectable()
export class SwapiFilmsClient implements FilmsProvider {
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('SWAPI_URL') ?? 'https://swapi.dev/api/films/';
  }

  async fetchFilms(): Promise<ExternalFilm[]> {
    const films: ExternalFilm[] = [];
    let next: string | null = this.baseUrl;

    for (let page = 0; next && page < MAX_PAGES; page++) {
      const body: SwapiPage = await this.fetchPage(next);
      for (const raw of body.results ?? []) {
        const film = this.toExternalFilm(raw);
        if (film) films.push(film);
      }
      next = body.next;
    }
    return films;
  }

  private async fetchPage(url: string): Promise<SwapiPage> {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!response.ok) {
        throw new BadGatewayException(`Star Wars API responded with ${response.status}`);
      }
      return (await response.json()) as SwapiPage;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException('Star Wars API is unreachable');
    }
  }

  private toExternalFilm(raw: SwapiFilm): ExternalFilm | null {
    const releaseDate = new Date(raw.release_date);
    if (!raw.title || !raw.url || Number.isNaN(releaseDate.getTime())) {
      return null;
    }
    return {
      title: raw.title,
      episodeId: Number(raw.episode_id),
      openingCrawl: raw.opening_crawl ?? '',
      director: raw.director ?? '',
      producer: raw.producer ?? '',
      releaseDate,
      url: raw.url,
    };
  }
}
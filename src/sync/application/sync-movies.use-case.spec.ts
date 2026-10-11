import { MovieRepository } from '../../movies/domain/movie.repository';
import { ExternalFilm, FilmsProvider } from './films-provider';
import { SyncMoviesUseCase } from './sync-movies.use-case';

const film = (n: number): ExternalFilm => ({
  title: `Film ${n}`,
  episodeId: n,
  openingCrawl: 'crawl',
  director: 'director',
  producer: 'producer',
  releaseDate: new Date('1977-05-25'),
  url: `https://swapi.dev/api/films/${n}/`,
});

describe('SyncMoviesUseCase', () => {
  let films: jest.Mocked<FilmsProvider>;
  let movies: jest.Mocked<MovieRepository>;
  let useCase: SyncMoviesUseCase;

  beforeEach(() => {
    films = { fetchFilms: jest.fn() };
    movies = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findExistingExternalUrls: jest.fn(),
      saveMany: jest.fn(),
    };
    useCase = new SyncMoviesUseCase(films, movies);
  });

  it('inserts only the films that do not exist yet', async () => {
    films.fetchFilms.mockResolvedValue([film(1), film(2), film(3)]);
    movies.findExistingExternalUrls.mockResolvedValue([film(2).url]);

    const result = await useCase.execute();

    const saved = movies.saveMany.mock.calls[0][0];
    expect(saved.map((movie) => movie.externalUrl)).toEqual([film(1).url, film(3).url]);
    expect(saved.every((movie) => movie.id === null)).toBe(true);
    expect(result).toEqual({ fetched: 3, created: 2, skipped: 1 });
  });

  it('is idempotent: when everything already exists, nothing is created', async () => {
    films.fetchFilms.mockResolvedValue([film(1), film(2)]);
    movies.findExistingExternalUrls.mockResolvedValue([film(1).url, film(2).url]);

    const result = await useCase.execute();

    expect(movies.saveMany).toHaveBeenCalledWith([]);
    expect(result).toEqual({ fetched: 2, created: 0, skipped: 2 });
  });

  it('ignores duplicated films inside the same response', async () => {
    films.fetchFilms.mockResolvedValue([film(1), film(1)]);
    movies.findExistingExternalUrls.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(movies.saveMany.mock.calls[0][0]).toHaveLength(1);
    expect(result).toEqual({ fetched: 1, created: 1, skipped: 0 });
  });

  it('propagates the error when the external API fails and saves nothing', async () => {
    films.fetchFilms.mockRejectedValue(new Error('Star Wars API is unreachable'));

    await expect(useCase.execute()).rejects.toThrow('Star Wars API is unreachable');
    expect(movies.saveMany).not.toHaveBeenCalled();
  });
});
import { NotFoundException } from '@nestjs/common';
import { Movie } from '../domain/movie.entity';
import { MovieRepository } from '../domain/movie.repository';
import { DeleteMovieUseCase } from './delete-movie.use-case';
import { GetMovieUseCase } from './get-movie.use-case';
import { UpdateMovieUseCase } from './update-movie.use-case';

function movieRepositoryMock(): jest.Mocked<MovieRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findExistingExternalUrls: jest.fn(),
    saveMany: jest.fn(),
  };
}

const existing = new Movie(
  'id-1',
  'A New Hope',
  4,
  'crawl',
  'George Lucas',
  'Gary Kurtz',
  new Date('1977-05-25'),
  'https://swapi.dev/api/films/1/',
);

describe('GetMovieUseCase', () => {
  it('returns the movie when it exists', async () => {
    const movies = movieRepositoryMock();
    movies.findById.mockResolvedValue(existing);
    await expect(new GetMovieUseCase(movies).execute('id-1')).resolves.toBe(existing);
  });

  it('throws NotFoundException when it does not exist', async () => {
    const movies = movieRepositoryMock();
    movies.findById.mockResolvedValue(null);
    await expect(new GetMovieUseCase(movies).execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('UpdateMovieUseCase', () => {
  it('changes only the given fields and keeps id and externalUrl', async () => {
    const movies = movieRepositoryMock();
    movies.findById.mockResolvedValue(existing);
    movies.save.mockImplementation(async (movie) => movie);

    const result = await new UpdateMovieUseCase(movies).execute('id-1', { title: 'Episode IV' });

    expect(result.title).toBe('Episode IV');
    expect(result.director).toBe('George Lucas');
    expect(result.id).toBe('id-1');
    expect(result.externalUrl).toBe('https://swapi.dev/api/films/1/');
  });

  it('throws NotFoundException and saves nothing when the movie does not exist', async () => {
    const movies = movieRepositoryMock();
    movies.findById.mockResolvedValue(null);

    await expect(
      new UpdateMovieUseCase(movies).execute('missing', { title: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(movies.save).not.toHaveBeenCalled();
  });
});

describe('DeleteMovieUseCase', () => {
  it('deletes an existing movie', async () => {
    const movies = movieRepositoryMock();
    movies.findById.mockResolvedValue(existing);

    await new DeleteMovieUseCase(movies).execute('id-1');

    expect(movies.delete).toHaveBeenCalledWith('id-1');
  });

  it('throws NotFoundException and deletes nothing when it does not exist', async () => {
    const movies = movieRepositoryMock();
    movies.findById.mockResolvedValue(null);

    await expect(new DeleteMovieUseCase(movies).execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(movies.delete).not.toHaveBeenCalled();
  });
});
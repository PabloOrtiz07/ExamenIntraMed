import { Movie } from './movie.entity';

export abstract class MovieRepository {
  abstract findAll(): Promise<Movie[]>;
  abstract findById(id: string): Promise<Movie | null>;
  abstract save(movie: Movie): Promise<Movie>;
  abstract delete(id: string): Promise<void>;
  abstract findExistingExternalUrls(urls: string[]): Promise<string[]>;
  abstract saveMany(movies: Movie[]): Promise<void>;
}
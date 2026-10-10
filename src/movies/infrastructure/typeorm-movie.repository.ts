import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';import { Movie } from '../domain/movie.entity';
import { MovieRepository } from '../domain/movie.repository';
import { MovieMapper } from './movie.mapper';
import { MovieOrmEntity } from './movie.orm-entity';


@Injectable()
export class TypeOrmMovieRepository implements MovieRepository {
  constructor(
    @InjectRepository(MovieOrmEntity)
    private readonly repo: Repository<MovieOrmEntity>,
  ) {}

  async findAll(): Promise<Movie[]> {
    const rows = await this.repo.find({ order: { episodeId: 'ASC' } });
    return rows.map((row) => MovieMapper.toDomain(row));
  }

  async findById(id: string): Promise<Movie | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? MovieMapper.toDomain(row) : null;
  }

  async save(movie: Movie): Promise<Movie> {
    const saved = await this.repo.save(MovieMapper.toOrm(movie));
    return MovieMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
    async findExistingExternalUrls(urls: string[]): Promise<string[]> {
    if (urls.length === 0) return [];
    const rows = await this.repo.find({
      select: { externalUrl: true },
      where: { externalUrl: In(urls) },
    });
    return rows
      .map((row) => row.externalUrl)
      .filter((url): url is string => url !== null);
  }

  async saveMany(movies: Movie[]): Promise<void> {
    if (movies.length === 0) return;
    await this.repo.save(movies.map((movie) => MovieMapper.toOrm(movie)));
  }
}
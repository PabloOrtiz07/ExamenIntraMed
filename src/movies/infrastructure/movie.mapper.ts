import { Movie } from '../domain/movie.entity';
import { MovieOrmEntity } from './movie.orm-entity';

export class MovieMapper {
  static toDomain(orm: MovieOrmEntity): Movie {
    return new Movie(
      orm.id,
      orm.title,
      orm.episodeId,
      orm.openingCrawl,
      orm.director,
      orm.producer,
      new Date(orm.releaseDate),
      orm.externalUrl,
    );
  }

  static toOrm(movie: Movie): MovieOrmEntity {
    const orm = new MovieOrmEntity();
    if (movie.id) orm.id = movie.id;
    orm.title = movie.title;
    orm.episodeId = movie.episodeId;
    orm.openingCrawl = movie.openingCrawl;
    orm.director = movie.director;
    orm.producer = movie.producer;
    orm.releaseDate = movie.releaseDate.toISOString().slice(0, 10);
    orm.externalUrl = movie.externalUrl;
    return orm;
  }
}
import { Movie } from '../domain/movie.entity';
import { MovieMapper } from './movie.mapper';
import { MovieOrmEntity } from './movie.orm-entity';

describe('MovieMapper', () => {
  it('converts the Date to a YYYY-MM-DD string for the database', () => {
    const movie = new Movie(null, 'A New Hope', 4, 'crawl', 'Lucas', 'Kurtz', new Date('1977-05-25'), null);

    const orm = MovieMapper.toOrm(movie);

    expect(orm.releaseDate).toBe('1977-05-25');
    expect(orm.id).toBeUndefined();
  });

  it('converts the database string back to a Date', () => {
    const orm = new MovieOrmEntity();
    orm.id = 'id-1';
    orm.title = 'A New Hope';
    orm.episodeId = 4;
    orm.openingCrawl = 'crawl';
    orm.director = 'Lucas';
    orm.producer = 'Kurtz';
    orm.releaseDate = '1977-05-25';
    orm.externalUrl = null;

    const movie = MovieMapper.toDomain(orm);

    expect(movie.releaseDate).toBeInstanceOf(Date);
    expect(movie.releaseDate.toISOString().slice(0, 10)).toBe('1977-05-25');
  });
});
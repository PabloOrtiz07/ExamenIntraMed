import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../../domain/movie.entity';

export class MovieResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'A New Hope' })
  title!: string;

  @ApiProperty({ example: 4 })
  episodeId!: number;

  @ApiProperty()
  openingCrawl!: string;

  @ApiProperty({ example: 'George Lucas' })
  director!: string;

  @ApiProperty({ example: 'Gary Kurtz, Rick McCallum' })
  producer!: string;

  @ApiProperty({ type: String, format: 'date', example: '1977-05-25' })
  releaseDate!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'https://swapi.dev/api/films/1/',
    description: 'URL in the Star Wars API. Null for movies created manually.',
  })
  externalUrl!: string | null;

  static fromDomain(movie: Movie): MovieResponseDto {
    const dto = new MovieResponseDto();
    dto.id = movie.id as string;
    dto.title = movie.title;
    dto.episodeId = movie.episodeId;
    dto.openingCrawl = movie.openingCrawl;
    dto.director = movie.director;
    dto.producer = movie.producer;
    dto.releaseDate = movie.releaseDate.toISOString().slice(0, 10);
    dto.externalUrl = movie.externalUrl;
    return dto;
  }
}
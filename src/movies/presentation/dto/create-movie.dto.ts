import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(1)
  episodeId!: number;

  @IsString()
  @IsNotEmpty()
  openingCrawl!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  director!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  producer!: string;

  @Type(() => Date)
  @IsDate()
  releaseDate!: Date;
}
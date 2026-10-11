import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'A New Hope', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt()
  @Min(1)
  episodeId!: number;

  @ApiProperty({ example: 'It is a period of civil war...' })
  @IsString()
  @IsNotEmpty()
  openingCrawl!: string;

  @ApiProperty({ example: 'George Lucas', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  director!: string;

  @ApiProperty({ example: 'Gary Kurtz, Rick McCallum', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  producer!: string;

  @ApiProperty({ type: String, format: 'date', example: '1977-05-25' })
  @Type(() => Date)
  @IsDate()
  releaseDate!: Date;
}
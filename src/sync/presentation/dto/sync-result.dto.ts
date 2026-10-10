import { ApiProperty } from '@nestjs/swagger';

export class SyncResultDto {
  @ApiProperty({ example: 6, description: 'Films returned by the Star Wars API' })
  fetched!: number;

  @ApiProperty({ example: 6, description: 'New movies inserted' })
  created!: number;

  @ApiProperty({ example: 0, description: 'Movies that already existed and were left untouched' })
  skipped!: number;
}
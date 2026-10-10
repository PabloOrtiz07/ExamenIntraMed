import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movies')
export class MovieOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ name: 'episode_id', type: 'int' })
  episodeId!: number;

  @Column({ name: 'opening_crawl', type: 'text' })
  openingCrawl!: string;

  @Column()
  director!: string;

  @Column()
  producer!: string;

  // Postgres "date" columns come back from TypeORM as 'YYYY-MM-DD' strings
  @Column({ name: 'release_date', type: 'date' })
  releaseDate!: string;

  @Column({ name: 'external_url', type: 'varchar', nullable: true, unique: true })
  externalUrl!: string | null;
}
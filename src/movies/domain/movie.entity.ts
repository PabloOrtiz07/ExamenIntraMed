export class Movie {
  constructor(
    public readonly id: string | null,
    public readonly title: string,
    public readonly episodeId: number,
    public readonly openingCrawl: string,
    public readonly director: string,
    public readonly producer: string,
    public readonly releaseDate: Date,
    public readonly externalUrl: string | null = null,
  ) {}
}
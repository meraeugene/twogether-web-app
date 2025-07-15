export type TMDBRawResult = {
  media_type: "movie" | "tv";
  id: number;
  name?: string; // for TV shows
  title?: string; // for movies
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  genre_ids?: number[];
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
};

export type EpisodeTitle = {
  episode_number: number;
  title: string;
};

export type TMDBSeasonResponse = {
  episodes: {
    episode_number: number;
    name: string;
  }[];
};

export type TMDBEnrichedResult = TMDBRawResult & {
  tmdb_id?: number;
  type?: string;
  genres: string[]; // e.g. ['Action', 'Comedy']
  poster_url: string | null; // full image URL or null if not available
  year?: string;
  duration?: number | null;
  synopsis?: string;
  seasons?: number; // for TV shows
  episodes?: number; // for TV shows
  episodeTitlesPerSeason?: Record<number, EpisodeTitle[]>;
};

export type TMDBResponse = {
  data: TMDBEnrichedResult[];
};

export type TMDBRawResult = {
  id: number;
  media_type: "movie" | "tv";
  name?: string; // for TV shows
  title?: string; // for movies
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  genre_ids?: number[];
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
};

export type TMDBEnrichedResult = TMDBRawResult & {
  imdb_id: string;
  genres: string[]; // e.g. ['Action', 'Comedy']
  poster_url: string | null; // full image URL or null if not available
  year?: string;
  duration?: number | null;
  synopsis?: string;
};

export type TMDBResponse = {
  data: TMDBEnrichedResult[];
};

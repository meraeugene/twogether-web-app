export type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
};

export type TMDBGenre = {
  id: number;
  name: string;
};

export type TMDBMovieDetails = {
  id: number;
  genres: TMDBGenre[];
  runtime: number;
  release_date?: string;
  overview: string;
  belongs_to_collection: {
    id: number;
    name: string;
  } | null;
};

export type TMDBCollection = {
  id: number;
  name: string;
  parts: TMDBMovie[];
};

export type EnrichedMovie = {
  id: number;
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  year: string | undefined;
  type: "movie";
  genres: string[];
  duration: number;
  release_date?: string;
  synopsis: string;
};

export type EnrichedCollection = {
  collection_id: number;
  collection_name: string;
  movies: EnrichedMovie[];
};

export type BingeCollection = {
  collection_id: number;
  collection_name: string;
  movies: {
    id: number;
    tmdb_id: number;
    title: string;
    poster_url: string | null;
    year?: string;
    type: "movie" | "tv";
    genres: string[];
    duration?: number;
    synopsis: string;
  }[];
};

export type PartialRecommendation = {
  tmdb_id: number;
  title: string;
  poster_url: string;
  type: "movie" | "tv";
  stream_url: string[];
  genres: string[];
  year: string;
  duration: number | null;
  synopsis?: string;
  trailer_key?: string | null;
  seasons?: number | null;
  episodes?: number | null;
  episode_titles_per_season?: Record<
    number,
    { episode_number: number; title: string }[]
  >;
};

export type CastMember = {
  id: number;
  name: string;
  character?: string;
  profile_url?: string;
};

export type Recommendation = {
  id: string;
  tmdb_id: number;
  recommendation_id: string;
  title: string;
  poster_url?: string;
  type: "movie" | "tv";
  stream_url: string[];
  comment: string;
  year?: string;
  duration?: number;
  synopsis?: string;
  genres: string[];
  trailer_key?: string | null;
  recommended_by: {
    id: string;
    username: string;
    avatar_url: string;
  } | null;
  visibility: "public" | "private";
  created_at: string;
  generated_by_ai?: boolean;
  recommendation_created_at?: string;
  is_tmdb_recommendation?: boolean;
  seasons?: number | null | undefined;
  episodes?: number | null | undefined;
  episode_titles_per_season?: Record<
    number,
    { episode_number: number; title: string }[]
  >;
  rating?: number;
  backdrop_url?: string;
  tagline?: string;
  tmdb_rating?: number;
  vote_count?: number;
  status?: string;
  original_language?: string;
  director?: string;
  creators?: string[];
  production_countries?: string[];
  cast?: CastMember[];
};

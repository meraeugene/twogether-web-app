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
  seasons?: number | null;
  episodes?: number | null;
  episode_titles_per_season?: Record<
    number,
    { episode_number: number; title: string }[]
  >;
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
  recommended_by: {
    id: string;
    username: string;
    avatar_url: string;
  };
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
};

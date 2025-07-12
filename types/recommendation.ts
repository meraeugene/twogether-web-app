export type PartialRecommendation = {
  tmdb_id: number;
  title: string;
  poster_url: string;
  type: "movie" | "show";
  stream_url: string[];
  genres: string[];
  year: string;
  duration: number | null;
  synopsis?: string;
};

export type Recommendation = {
  id: string;
  tmdb_id: number;
  recommendation_id: string;
  title: string;
  poster_url?: string;
  type: "movie" | "show";
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
};

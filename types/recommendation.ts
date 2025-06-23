export type PartialRecommendation = {
  title: string;
  imdb_id: string;
  poster_url: string;
  type: "movie" | "show";
  stream_url: string;
  genres: string[];
  year: string;
  duration: number | null;
  synopsis?: string;
};

export type Recommendation = {
  recommendation_id: string;
  title: string;
  imdb_id: string;
  poster_url?: string;
  type: "movie" | "show";
  stream_url: string;
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
  visibility: "public" | "friends" | "private";
  created_at: string;
};

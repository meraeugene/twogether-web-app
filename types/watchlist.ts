export type WatchlistMetadata = {
  title: string;
  poster_url?: string;
  type: "movie" | "tv";
  stream_url: string[];
  year?: string;
  duration?: number;
  synopsis?: string;
  genres: string[];
  seasons?: number | null | undefined;
  episodes?: number | null | undefined;
  episode_titles_per_season?: Record<
    number,
    { episode_number: number; title: string }[]
  >;
  comment: string;
  recommended_by: {
    id: string;
    username: string;
    avatar_url: string;
  };
};

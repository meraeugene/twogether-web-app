import { EpisodeTitle } from "./tmdb";

export type Genre =
  | "Action"
  | "Adventure"
  | "Animation"
  | "Comedy"
  | "Crime"
  | "Documentary"
  | "Drama"
  | "Family"
  | "Fantasy"
  | "History"
  | "Horror"
  | "Music"
  | "Mystery"
  | "Romance"
  | "Science Fiction"
  | "TV Movie"
  | "Thriller"
  | "War"
  | "Western";

export type OnboardingForm = {
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  relationship_status: string;
  social_intent: string[];
  favorite_genres: Genre[];
  favorite_moods: string[];
  prefers: "movies" | "shows" | "both";
};

export type RecommendationForm = {
  tmdb_id: number;
  title: string;
  poster_url: string;
  type: "movie" | "tv";
  stream_url: string[];
  comment: string;
  visibility: "public" | "private";
  episodeTitlesPerSeason?: Record<number, EpisodeTitle[]>;
};

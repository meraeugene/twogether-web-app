export type Genre =
  | "action"
  | "adventure"
  | "animation"
  | "comedy"
  | "crime"
  | "documentary"
  | "drama"
  | "family"
  | "fantasy"
  | "history"
  | "horror"
  | "music"
  | "mystery"
  | "romance"
  | "sci-fi"
  | "thriller"
  | "war"
  | "western";

export type OnboardingForm = {
  username: string;
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
  type: "movie" | "show";
  stream_url: string[];
  comment: string;
  visibility: "public" | "friends" | "private";
};

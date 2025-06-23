export type User = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  relationship_status: string | null;
  social_intent: string[] | null;
  favorite_genres:
    | (
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
        | "Western"
      )[]
    | null;
  favorite_moods: string[] | null;
  prefers: "movies" | "shows" | "both";
  onboarding_complete: boolean;
};

export type CurrentUser = {
  avatar_url: string;
  email: string | null;
  full_name: string;
  id: string;
  username: string;
};

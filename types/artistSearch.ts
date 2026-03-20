export type ArtistProfile = {
  id: number;
  name: string;
  biography: string;
  profile_url: string | null;
  birthday?: string;
  place_of_birth?: string;
  known_for_department?: string;
};

export type ArtistMovie = {
  id: number;
  title: string;
  overview: string;
  poster_url: string | null;
  year?: string;
  role?: string;
  popularity: number;
  duration?: number | null;
  genres?: string[];
  trailer_key?: string | null;
};

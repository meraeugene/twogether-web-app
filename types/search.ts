export type SearchKind = "all" | "titles" | "artists";

export type SearchSuggestion = {
  id: number;
  label: string;
  subtitle?: string;
  image_url?: string | null;
  category: "movie" | "tv" | "person";
};

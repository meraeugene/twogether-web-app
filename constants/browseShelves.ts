export const BROWSE_GENRE_SHELVES = [
  { id: "action", title: "Action", genre: "Action" },
  { id: "science-fiction", title: "Science fiction", genre: "Science Fiction" },
  { id: "thriller", title: "Thrillers", genre: "Thriller" },
  { id: "comedy", title: "Comedy", genre: "Comedy" },
  { id: "romance", title: "Romance", genre: "Romance" },
  { id: "horror", title: "Horror", genre: "Horror" },
] as const;

export type BrowseCategoryId = "movies" | "tv" | "anime" | "kdramas";
export type BrowseShelfConfig = { id: string; title: string; genre: string };

const tvShelves = [
  { id: "action-adventure", title: "Action & adventure", genre: "Action & Adventure" },
  { id: "comedy", title: "Comedy", genre: "Comedy" },
  { id: "crime", title: "Crime", genre: "Crime" },
  { id: "drama", title: "Drama", genre: "Drama" },
  { id: "science-fiction-fantasy", title: "Sci-fi & fantasy", genre: "Sci-Fi & Fantasy" },
  { id: "mystery", title: "Mystery", genre: "Mystery" },
];

export const BROWSE_CATEGORY_SHELVES: Record<BrowseCategoryId, readonly BrowseShelfConfig[]> = {
  movies: BROWSE_GENRE_SHELVES,
  tv: tvShelves,
  anime: [tvShelves[0], tvShelves[1], tvShelves[4], tvShelves[5], tvShelves[3],
    { id: "family", title: "Family", genre: "Family" }],
  kdramas: [tvShelves[3], tvShelves[1], tvShelves[5], tvShelves[2], tvShelves[4], tvShelves[0]],
};

export const TV_GENRE_MAP: Record<string, number> = {
  "Action & Adventure": 10759, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Family: 10751, Kids: 10762, Mystery: 9648,
  "Sci-Fi & Fantasy": 10765, "War & Politics": 10768, Western: 37,
};

export function isBrowseCategory(value: string): value is BrowseCategoryId {
  return Object.prototype.hasOwnProperty.call(BROWSE_CATEGORY_SHELVES, value);
}

export function browseCategoryHref(category: BrowseCategoryId): string {
  return `/browse/${category === "kdramas" ? "kdrama" : category}`;
}

"use client";

import BrowseTitleList from "../BrowseTitleList";

export default function TrendingTMDBMovieList({ genre }: { genre: string }) {
  const endpoint = `/api/tmdb/trending/movies?${genre && genre !== "Latest" ? `genre=${encodeURIComponent(genre)}` : ""}`;
  return <BrowseTitleList key={endpoint} endpoint={endpoint} />;
}

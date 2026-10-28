"use client";

import BrowseTitleList from "../BrowseTitleList";

export default function TrendingTMDBAnimeList({ genre }: { genre?: string }) {
  const endpoint = genre ? `/api/tmdb/browse-shelves?category=anime&genre=${encodeURIComponent(genre)}` : "/api/tmdb/trending/anime?";
  return <BrowseTitleList key={endpoint} endpoint={endpoint} />;
}

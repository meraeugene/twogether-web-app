"use client";

import BrowseTitleList from "../BrowseTitleList";

export default function TrendingTMDBTVShowsList({ genre }: { genre?: string }) {
  const endpoint = genre ? `/api/tmdb/browse-shelves?category=tv&genre=${encodeURIComponent(genre)}` : "/api/tmdb/trending/tv?";
  return <BrowseTitleList key={endpoint} endpoint={endpoint} />;
}

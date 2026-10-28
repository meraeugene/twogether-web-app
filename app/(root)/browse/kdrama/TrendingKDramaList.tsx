"use client";

import BrowseTitleList from "../BrowseTitleList";

export default function TrendingKDramaList({ genre }: { genre?: string }) {
  const endpoint = genre ? `/api/tmdb/browse-shelves?category=kdramas&genre=${encodeURIComponent(genre)}` : "/api/tmdb/trending/kdrama?";
  return <BrowseTitleList key={endpoint} endpoint={endpoint} />;
}

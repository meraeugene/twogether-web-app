"use client";

import useSWR from "swr";

import { TMDBEnrichedResult } from "@/types/tmdb";
import { fetcher } from "@/utils/swr/fetcher";
import { BrowseCategory } from "./BrowseCategory";

export default function BrowseLandingPage() {
  const { data, error, isLoading } = useSWR<{
    movies: TMDBEnrichedResult[];
    anime: TMDBEnrichedResult[];
    tv: TMDBEnrichedResult[];
  }>("/api/tmdb/trending", fetcher, { revalidateOnFocus: false });

  const movies = data?.movies ?? [];
  const anime = data?.anime ?? [];
  const tv = data?.tv ?? [];

  return (
    <main className="min-h-screen relative bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      <BrowseCategory
        title="Movies"
        href="/browse/movies"
        items={movies}
        error={error}
        isLoading={isLoading}
      />
      <BrowseCategory
        title="Anime"
        href="/browse/anime"
        items={anime}
        error={error}
        isLoading={isLoading}
      />
      <BrowseCategory
        title="TV/Shows"
        href="/browse/tv"
        items={tv}
        error={error}
        isLoading={isLoading}
      />
    </main>
  );
}

"use client";

import { useMemo } from "react";
import TrendingTMDBAnimeList from "./TrendingTMDBAnimeList";

export default function BrowseAnimeClient({ genre }: { genre?: string }) {

  const trendingList = useMemo(() => {
    return <TrendingTMDBAnimeList genre={genre} />;
  }, [genre]);

  return (
    <main className="page-gutter page-listing min-h-screen relative bg-black pb-16 pt-28 px-7 text-white font-(family-name:--font-geist-sans)">
      <div className="absolute inset-0 page-ambient pointer-events-none" />
      <section className="mb-16">
        <h1 className="font-semibold text-center lg:text-left text-2xl md:text-3xl mb-10 mt-6 ">
          {genre ? `${genre} Anime` : "Trending Anime"}
        </h1>

        {trendingList}
      </section>
    </main>
  );
}

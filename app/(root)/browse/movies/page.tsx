"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES } from "@/constants/genre";
import { useMemo, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import TrendingTMDBMovieList from "./TrendingTMDBMovieList";
import BackButton from "@/components/BackButton";

export default function BrowseMoviesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGenre = searchParams.get("genre") || "Trending";
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("genre", genre);
    router.replace(`?${newParams.toString()}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    }
  };

  const trendingList = useMemo(() => {
    return <TrendingTMDBMovieList genre={selectedGenre} />;
  }, [selectedGenre]);

  return (
    <main className="min-h-screen relative bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <section className="mb-16">
        <BackButton />

        <div className="max-w-2xl mx-auto w-full mt-2">
          <PlaceholdersAndVanishInput
            placeholders={browsePlaceholders}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="flex w-full flex-col md:flex-row justify-between gap-4 mb-10 text-center mt-6">
          <h1 className="font-semibold text-2xl md:text-3xl ">
            {selectedGenre} Movies
          </h1>

          <select
            className=" border border-white/10 px-4 py-2 rounded-md bg-black text-white text-sm focus:outline-none focus:ring-2 hover:border-red-500 cursor-pointer focus:ring-red-500 transition duration-200"
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
          >
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {trendingList}
      </section>
    </main>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES } from "@/constants/genre";
import { useMemo, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import TrendingTMDBMovieList from "./TrendingTMDBMovieList";
import BackButton from "@/components/BackButton";

export default function BrowseMoviesClient() {
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

  const handleSubmit = (e?: React.FormEvent, submittedValue?: string) => {
    e?.preventDefault();
    const trimmed = (submittedValue ?? searchQuery).trim();
    if (trimmed) {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    }
  };

  const trendingList = useMemo(() => {
    return <TrendingTMDBMovieList genre={selectedGenre} />;
  }, [selectedGenre]);

  return (
    <main className="min-h-screen relative bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-16 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

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
            className="rounded-md border border-red-900 bg-black px-4 py-2 text-sm text-white transition duration-200 cursor-pointer hover:border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
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

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES } from "@/constants/genre";
import LatestTMDBList from "./LatestTMDBList";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial genre from URL on first render
  const initialGenre = searchParams.get("genre") || "Action";
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

  const latestList = useMemo(() => {
    return <LatestTMDBList genre={selectedGenre} />;
  }, [selectedGenre]);

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      <section className="mb-16">
        <div className="max-w-2xl mx-auto w-full">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl mx-auto shadow-lg rounded-md md:rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-black via-zinc-900 to-neutral-900"
          >
            <input
              type="text"
              placeholder="Search movie or show..."
              className="bg-transparent text-white placeholder-white/40 px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 lg:px-6 lg:py-3 lg:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm font-semibold transition-colors duration-200 lg:px-5 lg:py-3 lg:text-base"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex w-full flex-col md:flex-row justify-between gap-4 mb-10 text-center mt-6">
          <h1 className="font-semibold text-2xl md:text-3xl">Latest Movies</h1>

          <select
            className=" border border-white/10 px-4 py-2 rounded-md bg-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
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

        {latestList}
      </section>
    </main>
  );
}

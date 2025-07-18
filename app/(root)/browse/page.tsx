"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES } from "@/constants/genre";
import LatestTMDBList from "./LatestTMDBList";
import { useMemo, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";

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

  const placeholders = [
    "Search for Inception...",
    "Search for Interstellar...",
    "Search for The Dark Knight...",
    "Search for Fight Club...",
    "Search for La La Land...",
    "Search for Parasite...",
    "Search for The Godfather...",
    "Search for Everything Everywhere All At Once...",
    "Search for The Grand Budapest Hotel...",
    "Search for Whiplash...",
  ];

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      <section className="mb-16">
        <div className="max-w-2xl mx-auto w-full">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSubmit}
          />
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

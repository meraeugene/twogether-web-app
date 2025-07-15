"use client";

import { useState } from "react";
import LatestTMDBList from "./LatestTMDBList";
import { GENRES } from "@/constants/genre";

export default function BrowsePage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("Action");

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 px-7 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:items-center mb-10">
        <h1 className="text-2xl font-[family-name:var(--font-geist-mono)] md:text-3xl font-bold text-white ">
          Latest Movies
        </h1>

        {/* Genre Dropdown */}
        <div className="w-full  sm:w-auto flex items-center gap-3">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full sm:w-48 bg-white/10 text-white px-3 py-2 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          >
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LatestTMDBList genre={selectedGenre} />
    </main>
  );
}

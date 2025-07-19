"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES } from "@/constants/genre";
import { useMemo, useState } from "react";
import CollectionPage from "./CollectionPage";

export default function BingePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial genre from URL on first render
  const initialGenre = searchParams.get("genre") || "Action";
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("genre", genre);
    router.replace(`?${newParams.toString()}`);
  };

  const latestList = useMemo(() => {
    return <CollectionPage genre={selectedGenre} />;
  }, [selectedGenre]);

  return (
    <main className=" min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 text-white">
      <section className="mb-16">
        <div className="flex w-full flex-col md:flex-row justify-between gap-4 mb-10 text-center mt-6">
          <h1 className="font-semibold  text-2xl md:text-3xl">Binge Worthy</h1>

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

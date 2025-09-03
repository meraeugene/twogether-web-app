"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BINGE_GENRES } from "@/constants/genre";
import { useMemo, useState } from "react";
import CollectionPage from "./CollectionPage";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { bingePlaceholders } from "@/constants/placeholders";

export default function BingePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push(`/search/collections/${encodeURIComponent(trimmed)}`);
    }
  };

  const latestList = useMemo(() => {
    return <CollectionPage genre={selectedGenre} />;
  }, [selectedGenre]);

  return (
    <main className="min-h-screen relative bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      {" "}
      {/* Combined Background Layers */}{" "}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {" "}
        {/* Radial Dots */}{" "}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />{" "}
        {/* Red Gradient Overlay */}{" "}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />{" "}
      </div>{" "}
      <section className="mb-16">
        {" "}
        <div className="max-w-2xl mx-auto w-full">
          {" "}
          <PlaceholdersAndVanishInput
            placeholders={bingePlaceholders}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSubmit}
          />{" "}
        </div>{" "}
        <div className="flex w-full flex-col md:flex-row justify-between gap-4 mb-10 text-center mt-6">
          {" "}
          <h1 className="font-semibold text-2xl md:text-3xl">
            {" "}
            {selectedGenre} Binge Worthy{" "}
          </h1>{" "}
          <select
            className=" border border-white/10 px-4 py-2 rounded-md bg-black text-white text-sm focus:outline-none focus:ring-2 hover:border-red-500 cursor-pointer focus:ring-red-500 transition duration-200"
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
          >
            {" "}
            {BINGE_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {" "}
                {genre}{" "}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        {latestList}{" "}
      </section>{" "}
    </main>
  );
}

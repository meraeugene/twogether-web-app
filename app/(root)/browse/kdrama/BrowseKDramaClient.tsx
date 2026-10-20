"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import BackButton from "@/components/BackButton";
import TrendingKDramaList from "./TrendingKDramaList";

export default function BrowseKDramaClient({ genre }: { genre?: string }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e?: React.FormEvent, submittedValue?: string) => {
    e?.preventDefault();
    const trimmed = (submittedValue ?? searchQuery).trim();
    if (trimmed) {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    }
  };

  const trendingList = useMemo(() => {
    return <TrendingKDramaList genre={genre} />;
  }, [genre]);

  return (
    <main className="page-gutter page-listing min-h-screen relative bg-black pb-16 pt-28 px-7 text-white font-[family-name:var(--font-geist-sans)]">
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

        <h1 className="font-semibold text-center lg:text-left text-2xl md:text-3xl mb-10 mt-6 ">
          {genre ? `${genre} K-Dramas` : "Trending K-Dramas"}
        </h1>

        {trendingList}
      </section>
    </main>
  );
}

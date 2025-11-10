"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import BackButton from "@/components/BackButton";
import TrendingKDramaList from "./TrendingKDramaList";

export default function BrowseKDramaPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    }
  };

  const trendingList = useMemo(() => {
    return <TrendingKDramaList />;
  }, []);

  return (
    <main className="min-h-screen relative bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
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
          Trending K-Dramas
        </h1>

        {trendingList}
      </section>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import TrendingTMDBTVShowsList from "./TrendingTMDBTVShowsList";

export default function BrowseTVShowsClient({ genre }: { genre?: string }) {
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
    return <TrendingTMDBTVShowsList genre={genre} />;
  }, [genre]);

  return (
    <main className="page-gutter page-listing min-h-screen relative bg-black pb-16 pt-28 px-7 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="absolute inset-0 page-ambient pointer-events-none" />

      <section className="mb-16">
        <div className="max-w-2xl mx-auto w-full mt-2">
          <PlaceholdersAndVanishInput
            placeholders={browsePlaceholders}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSubmit}
          />
        </div>

        <h1 className="font-semibold text-center lg:text-left text-2xl md:text-3xl mb-10 mt-6 ">
          {genre ? `${genre} TV Shows` : "Trending TV Shows"}
        </h1>

        {trendingList}
      </section>
    </main>
  );
}

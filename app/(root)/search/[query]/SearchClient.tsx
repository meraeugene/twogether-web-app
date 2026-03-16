"use client";

import FilmCard from "@/components/FilmCard";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import { Recommendation } from "@/types/recommendation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SearchClient({
  query,
  results,
}: {
  query: string;
  results: Recommendation[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isPending) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    startTransition(() => {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    });
  };

  return (
    <>
      <div className="absolute inset-0 bg-linear-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

      <Link
        prefetch
        href="/browse"
        className="inline-flex  items-center justify-center py-2 px-4 rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="max-w-2xl mx-auto w-full mb-8">
        <PlaceholdersAndVanishInput
          placeholders={browsePlaceholders}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSubmit}
        />
      </div>

      {!isPending && (
        <h1 className="text-xl md:text-3xl lg:text-3xl font-bold mb-6">
          Search results for: <span className="text-red-500">{query}</span>
        </h1>
      )}

      {isPending ? (
        <div className="text-white py-8 font-(family-name:--font-geist-sans)">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 xl:grid-cols-5 gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-2/3 w-full bg-white/10 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <p className="text-white/60 text-sm md:text-base lg:text-lg text-center lg:text-left">
          No results found.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 xl:grid-cols-5 gap-8">
          {results.map((item) => (
            <FilmCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

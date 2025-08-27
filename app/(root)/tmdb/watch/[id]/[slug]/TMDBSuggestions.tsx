"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetcher } from "@/utils/swr/fetcher";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import TMDBSuggestionSkeleton from "./TMDBSuggestionSkeleton";
import { useTMDBWatch } from "@/stores/useTMDBWatch";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { TMDBEnrichedResult } from "@/types/tmdb";

type SWRResponse = {
  results: TMDBEnrichedResult[];
  total_pages: number;
};

export default function TMDBSuggestions({
  tmdbId,
  type,
}: {
  tmdbId: number | string;
  type: string;
}) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSWR<SWRResponse>(
    tmdbId ? `/api/tmdb/similar?id=${tmdbId}&type=${type}&page=${page}` : null,
    fetcher
  );

  const setCurrentTMDB = useTMDBWatch((s) => s.setCurrentTMDB);

  const suggestions = data?.results || [];
  const totalPages = data?.total_pages || 1;

  if (isLoading) return <TMDBSuggestionSkeleton />;
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <section className="mt-16">
      {/* Header with nav buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold">You May Also Like</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 md:p-3 rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 md:p-3 rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-7">
        {suggestions.map((rec) => (
          <div
            key={rec.tmdb_id}
            className="w-full rounded-sm overflow-hidden shadow-lg"
          >
            {/* Poster */}
            <div className="group relative">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={rec.poster_url || "/placeholder.png"}
                  alt={rec.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover w-full h-full transition duration-300 group-hover:brightness-50 rounded-lg"
                />
              </div>
              {/* Hover Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/50">
                <Link
                  href={`/tmdb/watch/${rec.tmdb_id}/${getSlugFromTitle(
                    rec.title
                  )}`}
                  onClick={() => setCurrentTMDB(adaptTMDBToRecommendation(rec))}
                  className="flex cursor-pointer items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-1 ring-white/10 hover:ring-3 hover:ring-red-100 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  <FaPlay className="text-xl" />
                </Link>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-4">
              <Link
                href={`/tmdb/watch/${rec.tmdb_id}/${getSlugFromTitle(
                  rec.title
                )}`}
                onClick={() => setCurrentTMDB(adaptTMDBToRecommendation(rec))}
                className="w-full cursor-pointer flex items-center gap-3 text-white bg-red-600 hover:bg-red-700 transition p-2 rounded-md font-[family-name:var(--font-geist-mono)] text-sm mb-3 lg:hidden"
              >
                <FaPlay className="text-white text-xs" />
                Watch Now
              </Link>

              <div className="font-medium text-white line-clamp-2">
                {rec.title}
              </div>
              <div className="flex mt-1 items-center justify-between flex-wrap">
                <div className="text-white/80 text-sm flex gap-2">
                  <span>{rec.year}</span>
                  {rec.media_type === "tv" ? (
                    <span className="text-white/50 font-medium">
                      S{rec.seasons || 1} · {rec.episodes || 1}EPS
                    </span>
                  ) : (
                    <span className="text-white/50 font-medium">
                      {rec.duration || 0}m
                    </span>
                  )}
                </div>
                <div className="bg-gray-700 rounded-sm px-2 py-1 text-xs capitalize">
                  {rec.media_type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

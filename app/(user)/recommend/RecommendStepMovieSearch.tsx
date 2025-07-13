"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { PartialRecommendation } from "@/types/recommendation";
import RecommendCardSkeleton from "./RecommendCardSkeleton";
import { fetcher } from "@/utils/swr/fetcher";
import ErrorMessage from "@/components/ErrorMessage";

export default function RecommendStepMovieSearch({
  onSelect,
}: {
  onSelect: (movie: PartialRecommendation) => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, error, isLoading } = useSWR<TMDBEnrichedResult[]>(
    debouncedQuery
      ? `/api/recommend?query=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher
  );

  const results: TMDBEnrichedResult[] = data || [];

  const handleSelect = (item: TMDBEnrichedResult) => {
    const tmdb_id = item.id;
    const title = item.title || item.name || "Unknown";
    const type = item.media_type === "tv" ? "tv" : "movie";
    const poster_url = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    const genres = item.genres ?? [];
    const year = item.year || "Unknown Year";
    const duration = item.duration || null;
    const synopsis = item.overview || "No synopsis available";
    const seasons = item.seasons ?? null;
    const episodes = item.episodes ?? null;
    const episodeTitlesPerSeason = item.episodeTitlesPerSeason ?? undefined;

    const stream_url =
      type === "tv"
        ? [
            `https://vidlink.pro/tv/${item.id}/1/1?title=true&poster=true&autoplay=false`,
            `https://vidsrc.cc/v2/embed/tv/${item.id}/1/1?autoPlay=false&poster=true`,
            `https://vidsrc.to/embed/tv/${item.id}/1/1`,
          ]
        : [
            `https://vidlink.pro/movie/${item.id}?title=true&poster=true&autoplay=false`,
            `https://vidsrc.cc/v2/embed/movie/${item.id}?autoPlay=false&poster=true`,
            `https://vidsrc.to/embed/movie/${item.id}`,
          ];

    onSelect({
      tmdb_id,
      title,
      genres,
      poster_url,
      type,
      stream_url,
      year,
      duration,
      synopsis,
      seasons,
      episodes,
      episode_titles_per_season: episodeTitlesPerSeason,
    });
  };

  if (error) {
    return (
      <ErrorMessage
        title={error.details?.error || "Failed to results."}
        message={error.details?.message || "Please try again later."}
        hint={error.details?.hint}
      />
    );
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-geist-mono)]">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a movie or show"
        className="w-full p-4  mb-0 rounded-lg bg-black/80 text-white placeholder-white/40 border border-white/10 text-lg"
      />

      <div className="grid grid-cols-2 mt-4 md:grid-cols-3 lg:grid-cols-3 gap-4 ">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <RecommendCardSkeleton key={i} />
          ))}

        {!isLoading &&
          results.length > 0 &&
          results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="transition cursor-pointer hover:bg-gray-900 hover:scale-[1.02] rounded-lg p-2 text-left"
            >
              <div className="relative w-full aspect-[2/3] mb-2 rounded overflow-hidden">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                    alt={item.title || item.name || "poster"}
                    fill
                    sizes="(max-width: 768px) 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <span className="text-white/60">No Image</span>
                  </div>
                )}
              </div>
              <div className="text-base ">{item.title || item.name}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-white/60 capitalize flex gap-2">
                  <span>{item.year}</span>
                  {item.media_type === "tv" ? (
                    <span className="text-amber font-medium">
                      S{item.seasons || 1}·E{item.episodes || 1}
                    </span>
                  ) : (
                    <span className="text-amber font-medium">
                      {item.duration || "0"}m
                    </span>
                  )}
                </div>

                <div className="text-xs bg-gray-700 rounded-sm px-2 py-1 text-white/60 capitalize">
                  {item.media_type}
                </div>
              </div>
            </button>
          ))}
      </div>

      {!isLoading && debouncedQuery && results.length === 0 && (
        <div className="text-white/60 text-center text-lg">
          No results found for &quot;
          <span className="italic">{debouncedQuery}</span>&quot;
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center text-sm">
          Failed to load results. Please try again.
        </div>
      )}
    </div>
  );
}

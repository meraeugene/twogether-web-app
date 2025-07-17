"use client";

import useSWRInfinite from "swr/infinite";
import { useEffect, useRef, useMemo } from "react";
import FilmCard from "@/components/FilmCard";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { adaptTMDBToRecommendation } from "@/utils/tmdb/adaptTMDBToRecommendation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 8;

export default function LatestTMDBList({ genre }: { genre: string }) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const getKey = (pageIndex: number) =>
    `/api/tmdb/latest/movies?genre=${genre}&page=${pageIndex + 1}`;

  const { data, size, setSize, isValidating } = useSWRInfinite<
    TMDBEnrichedResult[]
  >(getKey, fetcher);

  const rawItems = data ? data.flat() : [];

  // Calculate how many items to show based on size
  const visibleCount = useMemo(() => {
    if (size === 1) return INITIAL_COUNT;
    return INITIAL_COUNT + (size - 1) * LOAD_MORE_COUNT;
  }, [size]);

  const visibleItems = rawItems.slice(0, visibleCount);

  useEffect(() => {
    if (!loaderRef.current || isValidating) return;

    const target = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [isValidating, setSize]);

  return (
    <section className="space-y-8">
      {/* Initial loading skeletons */}
      {!data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
          {Array.from({ length: INITIAL_COUNT }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] w-full rounded-md bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Real content when loaded */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
          {visibleItems.map((item) => {
            const adapted = adaptTMDBToRecommendation(item);

            return <FilmCard key={adapted.id} item={adapted} />;
          })}
        </div>
      )}

      <div ref={loaderRef} className="h-12 w-full" />

      {/* Show spinner only when loading more, not initial load */}
      {isValidating && data && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-white/50" />
        </div>
      )}
    </section>
  );
}

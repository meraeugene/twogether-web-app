"use client";

import { useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import FilmCard from "@/components/FilmCard";
import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { TMDBBrowseCategoryResponse, TMDBEnrichedResult } from "@/types/tmdb";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { fetcher } from "@/utils/swr/fetcher";

const fetchTitles = async (url: string) => {
  const data = await fetcher<TMDBEnrichedResult[] | TMDBBrowseCategoryResponse>(url);
  return Array.isArray(data) ? data : data.items;
};

export default function BrowseTitleList({ endpoint }: { endpoint: string }) {
  const isMobile = useIsMobile();
  const railRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { data, error, isValidating, setSize, mutate } = useSWRInfinite<TMDBEnrichedResult[]>(
    (index, previous) => previous?.length === 0 || index >= 500 ? null : `${endpoint}&page=${index + 1}`,
    fetchTitles,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
  const items = useMemo(() => {
    const seen = new Set<string>();
    return (data?.flat() ?? []).filter(item => {
      const key = `${item.type}-${item.tmdb_id ?? item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);
  const hasMore = Boolean(data?.length && data[data.length - 1].length && data.length < 500);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target || !hasMore || isValidating || error) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void setSize(size => size + 1);
    }, { root: isMobile ? railRef.current : null, rootMargin: isMobile ? "0px 150px" : "400px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isValidating, isMobile, error, setSize, items.length]);

  const loader = hasMore && <div ref={loaderRef} className="movie-rail-loader flex min-h-20 items-center justify-center">
    {isValidating ? <LoadingSpinner label="Loading more titles" /> : <button type="button" className="glass-control cursor-pointer rounded-xl px-3 py-3 text-sm" onClick={() => void (error ? mutate() : setSize(size => size + 1))}>{error ? "Try again" : "Load more"}</button>}
  </div>;

  return <section aria-label="Titles" aria-busy={isValidating}>
    <div ref={railRef} tabIndex={0} role="group" aria-label="Movie and show titles, swipe left or right to explore" className="mobile-movie-rail media-grid grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {!data && !error ? Array.from({ length: 12 }, (_, index) => <FilmCardSkeleton key={index} />) : items.map(item => {
        const adapted = adaptTMDBToRecommendation(item);
        return <FilmCard key={adapted.id} item={adapted} />;
      })}
      {isMobile && loader}
    </div>
    {!isMobile && loader}
    {error && <div className="mt-5 text-center text-sm text-white/65" role="status"><p>These titles couldn&apos;t load.</p>{!hasMore && <button type="button" onClick={() => void mutate()} className="glass-control mt-3 cursor-pointer rounded-xl px-4 py-3">Try again</button>}</div>}
    {data && !items.length && !error && <p className="py-8 text-center text-white/60">No titles found for this genre.</p>}
  </section>;
}

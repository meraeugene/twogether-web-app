"use client";

/* eslint-disable @next/next/no-img-element -- Discovery artwork uses the TMDB source CDN. */
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Clapperboard, Play } from "lucide-react";
import FilmCard from "./FilmCard";
import MovieTitle from "./MovieTitle";
import Skeleton from "./ui/Skeleton";
import type { TMDBBrowseCategoryResponse } from "@/types/tmdb";
import { fetcher } from "@/utils/swr/fetcher";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import styles from "./SearchOverlay.module.css";

export default function SearchGenreRow({ category, genre, onTitle, previewContainer, onPreviewChange }: {
  category: "movies" | "tv";
  genre: string;
  onTitle: (title: string) => void;
  previewContainer: HTMLElement | null;
  onPreviewChange: (open: boolean, trigger?: HTMLElement) => void;
}) {
  const rowRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(!genre);
  const heading = `${genre || "Trending"} ${category === "movies" ? "movies" : "TV shows"}`;
  const headingId = `search-${category}-${genre || "trending"}`.replace(/[^a-z0-9-]/gi, "-");
  useEffect(() => {
    if (visible || !rowRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [visible]);
  const params = new URLSearchParams({ category, view: "grid", ...(genre ? { genre } : {}) });
  const { data, isLoading, error, mutate } = useSWR<TMDBBrowseCategoryResponse>(visible ? `/api/tmdb/browse-shelves?${params}` : null, fetcher, {
    revalidateOnFocus: false, dedupingInterval: 60000,
  });
  const loading = !visible || isLoading;
  const titles = data?.items?.slice(0, 12) ?? [];

  return <section ref={rowRef} className={styles.genreRow} aria-labelledby={headingId} aria-busy={loading}>
    <div className={styles.sectionHeading}><h3 id={headingId}>{heading}</h3><span>Swipe to explore · Tap for the trailer</span></div>
    {loading && <span className="sr-only" role="status">Loading {heading}</span>}
    {error ? <div className={styles.discoveryError} role="status"><p>These titles couldn&apos;t load.</p><button type="button" onClick={() => void mutate()}>Try again</button></div>
      : !loading && !titles.length ? <p className={styles.discoveryHint} role="status">No titles here yet. Try another genre.</p>
      : <div className={styles.discoveryGrid} tabIndex={0} role="group" aria-label={`${heading}, swipe left or right to explore`}>
        {loading ? Array.from({ length: 6 }, (_, index) => <div key={index} aria-hidden="true"><Skeleton className="aspect-[2/3] w-full rounded-xl" /><Skeleton className="mt-3 h-5 w-4/5" /><Skeleton className="mt-1 h-4 w-1/3" /></div>) : titles.map(movie => (
          <FilmCard key={`${movie.type}-${movie.id}`} item={adaptTMDBToRecommendation(movie)} previewContainer={previewContainer} onPreviewChange={onPreviewChange}
            renderTrigger={openPreview => <button type="button" className={styles.discoveryCard} aria-label={`Preview ${movie.title} trailer`} aria-haspopup="dialog"
              onClick={event => { event.currentTarget.focus({ preventScroll: true }); onTitle(movie.title); openPreview(); }}>
              <div className={styles.discoveryPoster}>
                {movie.poster_url ? <img src={movie.poster_url} alt="" width={300} height={450} loading="lazy" /> : <Clapperboard aria-hidden="true" />}
                <span><Play aria-hidden="true" /></span>
              </div>
              <h4><MovieTitle title={movie.title} /></h4><p>{movie.year || (movie.type === "tv" ? "TV show" : "Movie")}</p>
            </button>} />
        ))}
      </div>}
  </section>;
}

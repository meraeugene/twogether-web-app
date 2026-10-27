"use client";

/* eslint-disable @next/next/no-img-element -- Discovery artwork uses the TMDB source CDN. */
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, Clapperboard, History, Play, Sparkles, Tv, UserRound } from "lucide-react";
import { fetcher } from "@/utils/swr/fetcher";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { TMDB_GENRE_MAP } from "@/constants/tmdbGenres";
import { TV_GENRE_MAP } from "@/constants/browseShelves";
import type { TMDBBrowseCategoryResponse } from "@/types/tmdb";
import type { SearchKind } from "@/types/search";
import Skeleton from "@/components/ui/Skeleton";
import FilmCard from "./FilmCard";
import styles from "./SearchOverlay.module.css";

const destinations = [
  { label: "Movies", description: "Find your next favorite", href: "/browse/movies", Icon: Clapperboard },
  { label: "TV shows", description: "One more episode", href: "/browse/tv", Icon: Tv },
  { label: "Collections", description: "The complete story", href: "/binge", Icon: Sparkles },
  { label: "Timelines", description: "Watch in story order", href: "/chrono", Icon: History },
];

export default function SearchDiscovery({ kind, onQuery, onNavigate, onTitle, previewContainer, onPreviewChange }: {
  kind: SearchKind;
  onQuery: (query: string, kind: SearchKind) => void;
  onNavigate: () => void;
  onTitle: (title: string) => void;
  previewContainer: HTMLElement | null;
  onPreviewChange: (open: boolean, trigger?: HTMLElement) => void;
}) {
  const [selection, setSelection] = useState<{ category: "movies" | "tv"; genre: string }>({ category: "movies", genre: "" });
  const { category, genre } = selection;
  const params = new URLSearchParams({ category, view: "grid", ...(genre ? { genre } : {}) });
  const { data, isLoading, error, mutate } = useSWR<TMDBBrowseCategoryResponse>(kind === "artists" ? null : `/api/tmdb/browse-shelves?${params}`, fetcher, {
    revalidateOnFocus: false, dedupingInterval: 60000,
  });
  const titles = data?.items?.slice(0, 12) ?? [];
  const genres = Object.keys(category === "movies" ? TMDB_GENRE_MAP : TV_GENRE_MAP);
  const heading = `${genre || "Trending"} ${category === "movies" ? "movies" : "TV shows"}`;

  return (
    <div className={styles.discovery}>
      {kind === "artists" ? <section>
        <div className={styles.sectionHeading}><h3>Behind the stories</h3><span>Actors &amp; filmmakers</span></div>
        <p className={styles.discoveryHint}>Explore a favorite actor or director&apos;s filmography.</p>
        <div className={styles.chips}>
          {["Christopher Nolan", "Florence Pugh", "Bong Joon-ho", "Hayao Miyazaki"].map(name => (
            <button key={name} type="button" onClick={() => onQuery(name, "artists")}><UserRound aria-hidden="true" />{name}</button>
          ))}
        </div>
      </section> : <section aria-labelledby="search-discovery-heading">
        <div className={styles.sectionHeading}><h3 id="search-discovery-heading">Browse by genre</h3><span>Pick a mood, then preview a title</span></div>
        <div className={styles.mediaTypes} role="group" aria-label="Discover movies or TV shows">
          {([{ id: "movies", label: "Movies", Icon: Clapperboard }, { id: "tv", label: "TV Shows", Icon: Tv }] as const).map(({ id, label, Icon }) => (
            <button key={id} type="button" aria-pressed={category === id} onClick={() => setSelection({ category: id, genre: "" })}><Icon aria-hidden="true" />{label}</button>
          ))}
        </div>
        <div className={`${styles.chips} ${styles.genreChips}`} role="group" aria-label={`${category === "movies" ? "Movie" : "TV show"} genres`}>
          {["", ...genres].map(value => <button key={value} type="button" aria-pressed={genre === value} onClick={() => setSelection({ category, genre: value })}>{value || "Trending"}</button>)}
        </div>
        <div className={styles.sectionHeading}><h3>{heading}</h3><span>Tap a poster for the trailer</span></div>
        <div aria-busy={isLoading}>
          {isLoading && <span className="sr-only" role="status">Loading {heading}</span>}
          {error ? <div className={styles.discoveryError} role="status"><p>These titles couldn&apos;t load.</p><button type="button" onClick={() => void mutate()}>Try again</button></div>
            : !isLoading && !titles.length ? <p className={styles.discoveryHint} role="status">No titles here yet. Try another genre.</p> : <div className={styles.discoveryGrid}>
            {isLoading ? Array.from({ length: 12 }, (_, index) => <div key={index} aria-hidden="true"><Skeleton className="aspect-[2/3] w-full rounded-xl" /><Skeleton className="mt-3 h-5 w-4/5" /><Skeleton className="mt-1 h-4 w-1/3" /></div>) : titles.map(movie => (
              <FilmCard key={`${movie.type}-${movie.id}`} item={adaptTMDBToRecommendation(movie)} previewContainer={previewContainer} onPreviewChange={onPreviewChange}
                renderTrigger={openPreview => <button type="button" className={styles.discoveryCard} aria-label={`Preview ${movie.title} trailer`} aria-haspopup="dialog"
                  onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); onTitle(movie.title); openPreview(); }}>
                  <div className={styles.discoveryPoster}>
                    {movie.poster_url ? <img src={movie.poster_url} alt="" width={300} height={450} loading="lazy" /> : <Clapperboard aria-hidden="true" />}
                    <span><Play aria-hidden="true" /></span>
                  </div>
                  <h4>{movie.title}</h4><p>{movie.year || (movie.type === "tv" ? "TV show" : "Movie")}</p>
                </button>} />
            ))}
          </div>}
        </div>
      </section>}
      <section>
        <div className={styles.sectionHeading}><h3>Explore your way</h3></div>
        <div className={styles.destinationGrid}>
          {destinations.map(({ label, description, href, Icon }) => <Link key={href} href={href} prefetch={false} onClick={onNavigate} className={styles.destination}>
            <Icon aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight aria-hidden="true" />
          </Link>)}
        </div>
      </section>
    </div>
  );
}

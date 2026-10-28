"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clapperboard, History, Sparkles, Tv, UserRound } from "lucide-react";
import { TMDB_GENRE_MAP } from "@/constants/tmdbGenres";
import { TV_GENRE_MAP } from "@/constants/browseShelves";
import type { SearchKind } from "@/types/search";
import SearchGenreRow from "./SearchGenreRow";
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
  const genres = Object.keys(category === "movies" ? TMDB_GENRE_MAP : TV_GENRE_MAP);
  const visibleGenres = genre ? [genre] : ["", ...genres];

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
          {["", ...genres].map(value => <button key={value} type="button" aria-pressed={genre === value} onClick={() => setSelection({ category, genre: value })}>{value || "All genres"}</button>)}
        </div>
        {visibleGenres.map(value => <SearchGenreRow key={`${category}-${value}`} category={category} genre={value} onTitle={onTitle} previewContainer={previewContainer} onPreviewChange={onPreviewChange} />)}
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

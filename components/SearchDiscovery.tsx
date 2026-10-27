"use client";

/* eslint-disable @next/next/no-img-element -- Discovery artwork uses the TMDB source CDN. */
import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, Clapperboard, History, Sparkles, Tv, UserRound } from "lucide-react";
import { fetcher } from "@/utils/swr/fetcher";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import type { TMDBBrowseFeaturedResponse } from "@/types/tmdb";
import type { SearchKind } from "@/types/search";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./SearchOverlay.module.css";

const destinations = [
  { label: "Movies", description: "Find your next favorite", href: "/browse/movies", Icon: Clapperboard },
  { label: "TV shows", description: "One more episode", href: "/browse/tv", Icon: Tv },
  { label: "Collections", description: "The complete story", href: "/binge", Icon: Sparkles },
  { label: "Timelines", description: "Watch in story order", href: "/chrono", Icon: History },
];

export default function SearchDiscovery({ kind, onQuery, onNavigate, onTitle }: {
  kind: SearchKind;
  onQuery: (query: string, kind: SearchKind) => void;
  onNavigate: () => void;
  onTitle: (title: string) => void;
}) {
  const { data, isLoading } = useSWR<TMDBBrowseFeaturedResponse>(kind === "artists" ? null : "/api/tmdb/featured?v=2", fetcher, {
    revalidateOnFocus: false, dedupingInterval: 60000,
  });
  const currentMovies = data?.heroes?.length ? data.heroes : data?.items;
  const movies = currentMovies?.slice(0, 6) ?? [];

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
      </section> : (isLoading || movies.length > 0) && <section>
        <div className={styles.sectionHeading}><h3>{data?.heroes?.length ? "In the spotlight" : "Worth a watch"}</h3><span>A little inspiration</span></div>
        <div className={styles.discoveryGrid}>
          {isLoading ? Array.from({ length: 6 }, (_, index) => <div key={index} aria-hidden="true"><Skeleton className="aspect-[2/3] w-full rounded-xl" /><Skeleton className="mt-3 h-5 w-4/5" /><Skeleton className="mt-1 h-4 w-1/3" /></div>) : movies.map(movie => (
            <Link key={`${movie.type}-${movie.id}`} href={`/tmdb/watch/${movie.type}/${movie.id}/${getSlugFromTitle(movie.title)}`} prefetch={false} onClick={() => onTitle(movie.title)} className={styles.discoveryCard}>
              <div className={styles.discoveryPoster}>
                {movie.poster_url ? <img src={movie.poster_url} alt="" width={300} height={450} loading="lazy" /> : <Clapperboard aria-hidden="true" />}
                <span><ArrowUpRight aria-hidden="true" /></span>
              </div>
              <h4>{movie.title}</h4><p>{movie.year || "Movie"}</p>
            </Link>
          ))}
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

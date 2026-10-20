"use client";

/* eslint-disable @next/next/no-img-element -- Movie posters use the TMDB source CDN. */

import Link from "next/link";
import { FiChevronRight, FiFilm, FiPlay } from "react-icons/fi";
import type { TMDBEnrichedResult } from "@/types/tmdb";
import FilmCard from "@/components/FilmCard";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import styles from "./browse.module.css";

export default function BrowseMovieShelf({ id, title, href, items, isLoading, error, onRetry, priority = false }: {
  id: string;
  title: string;
  href: string;
  items?: TMDBEnrichedResult[];
  isLoading?: boolean;
  error?: boolean;
  onRetry: () => void;
  priority?: boolean;
}) {
  return (
    <section id={id} className={styles.shelf} aria-labelledby={`${id}-heading`} aria-busy={isLoading}>
      <div className={styles.shelfHeading}>
        <h2 id={`${id}-heading`}>{title}</h2>
        <Link href={href}>See all <FiChevronRight aria-hidden="true" /></Link>
      </div>
      {isLoading ? (
        <div className={styles.grid} aria-label={`Loading ${title.toLowerCase()}`}>
          {Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.skeleton} aria-hidden="true"><div className="skeleton-shimmer" /><span /><span /></div>)}
        </div>
      ) : error ? (
        <div className={styles.empty} role="status">
          <p>We couldn’t load these titles. Let’s try that again.</p>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      ) : !items?.length ? <p className={styles.empty}>No titles here just yet. Try another category.</p> : (
        <div className={styles.grid}>
          {items.map((item) => {
            const movieTitle = item.title || item.name || "Untitled";
            return (
              <FilmCard key={`${item.type}-${item.id}`} item={adaptTMDBToRecommendation(item)}
                renderTrigger={(openPreview) => (
                  <button type="button" className={styles.card} onClick={openPreview}
                    aria-label={`Play ${movieTitle} trailer overview`} aria-haspopup="dialog">
                    <div className={styles.poster}>
                      {item.poster_url ? <img src={item.poster_url} alt={`${movieTitle} poster`} width={500} height={750} loading={priority ? "eager" : "lazy"} /> : <FiFilm aria-label="Poster unavailable" />}
                      <span className={styles.posterOverlay} aria-hidden="true"><span className={styles.cardPlay}><FiPlay /></span></span>
                    </div>
                    <h3>{movieTitle}</h3>
                    <p>{item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "Coming soon"}</p>
                  </button>
              )} />
            );
          })}
        </div>
      )}
    </section>
  );
}

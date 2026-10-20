"use client";

import { useState } from "react";
import useSWR from "swr";
import type { TMDBBrowseCategoryResponse, TMDBBrowseFeaturedResponse } from "@/types/tmdb";
import { fetcher } from "@/utils/swr/fetcher";
import { BROWSE_CATEGORY_SHELVES, browseCategoryHref } from "@/constants/browseShelves";
import BrowseHero from "./BrowseHero";
import BrowseMovieShelf from "./BrowseMovieShelf";
import styles from "./browse.module.css";

const categories = [
  { id: "featured", label: "For You", href: "/browse/movies" },
  { id: "movies", label: "Movies", href: "/browse/movies" },
  { id: "tv", label: "TV Shows", href: "/browse/tv" },
  { id: "anime", label: "Anime", href: "/browse/anime" },
  { id: "kdramas", label: "K-Dramas", href: "/browse/kdrama" },
] as const;
type Category = typeof categories[number]["id"];

export default function BrowseLandingClient() {
  const [category, setCategory] = useState<Category>("featured");
  const featured = useSWR<TMDBBrowseFeaturedResponse>(
    "/api/tmdb/featured?v=2", fetcher, { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
  const trending = useSWR<TMDBBrowseCategoryResponse>(category === "featured" ? null : `/api/tmdb/browse-shelves?category=${category}`, fetcher, {
    revalidateOnFocus: false, dedupingInterval: 60000,
  });
  const activeCategory = categories.find((item) => item.id === category)!;
  const items = category === "featured" ? featured.data?.items : trending.data?.items;
  const isLoading = category === "featured" ? featured.isLoading : trending.isLoading;
  const error = category === "featured" ? featured.error : trending.error;
  const genreCategory = category === "featured" ? "movies" : category;
  const shelves = category === "featured" ? featured.data?.shelves : trending.data?.shelves;
  const retry = () => void (category === "featured" ? featured.mutate() : trending.mutate());

  return (
    <main className={styles.page}>
      <h1 className="sr-only">Browse movies and shows</h1>
      <section className={styles.hero} aria-label="Find your next watch">
        <BrowseHero movies={featured.data?.heroes} />
      </section>
      <nav className={styles.categories} aria-label="Browse categories">
        {categories.map((item) => (
          <button key={item.id} type="button" aria-pressed={category === item.id}
            aria-controls="browse-movies" onClick={() => setCategory(item.id)}>{item.label}</button>
        ))}
      </nav>
      <div className={styles.content}>
        <BrowseMovieShelf id="browse-movies" title={category === "featured" ? "Worth a watch" : `Trending ${activeCategory.label}`}
          href={activeCategory.href} items={items} isLoading={isLoading} error={Boolean(error)} priority
          onRetry={retry} />
        {BROWSE_CATEGORY_SHELVES[genreCategory].map((config) => {
          const shelf = shelves?.find((item) => item.id === config.id);
          return <BrowseMovieShelf key={`${category}-${config.id}`} id={`genre-${config.id}`} title={config.title}
            href={`${browseCategoryHref(genreCategory)}?genre=${encodeURIComponent(config.genre)}`} items={shelf?.items}
            isLoading={isLoading} error={Boolean(error) || shelf?.unavailable}
            onRetry={retry} />;
        })}
      </div>
    </main>
  );
}

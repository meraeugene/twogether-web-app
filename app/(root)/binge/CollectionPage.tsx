"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Film, Play } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { BingeCollection } from "@/types/binge";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import { fetcher } from "@/utils/swr/fetcher";
import ErrorMessage from "@/components/ErrorMessage";
import FilmCard from "@/components/FilmCard";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";

function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}

function CollectionSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <div className="skeleton-shimmer grid min-h-[280px] gap-6 lg:grid-cols-[34%_1fr]">
        <div className="rounded-2xl bg-white/[0.07]" />
        <div className="flex flex-col justify-center gap-5 py-3">
          <div className="h-8 w-2/5 rounded bg-white/[0.08]" />
          <div className="h-4 w-1/4 rounded bg-white/[0.06]" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] w-20 rounded-xl bg-white/[0.07] sm:w-24"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionRow({
  collection,
  priority,
}: {
  collection: BingeCollection;
  priority: boolean;
}) {
  const movieRailRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(
    collection.movies.length > 4,
  );
  const firstMovie = collection.movies[0];
  const backdrop = collection.movies.find((movie) => movie.backdrop_url)
    ?.backdrop_url;
  const totalRuntime = collection.movies.reduce(
    (total, movie) => total + (movie.duration || 0),
    0,
  );
  const watchHref = firstMovie
    ? `/tmdb/watch/${firstMovie.type}/${firstMovie.tmdb_id}/${getSlugFromTitle(firstMovie.title)}`
    : "/binge";

  const updateRailControls = () => {
    const rail = movieRailRef.current;
    if (!rail) return;
    setCanScrollPrevious(rail.scrollLeft > 4);
    setCanScrollNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  };

  const scrollMovies = (direction: -1 | 1) => {
    const rail = movieRailRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 300),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(updateRailControls);
    window.addEventListener("resize", updateRailControls);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateRailControls);
    };
  }, [collection.movies.length]);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0c] shadow-[0_28px_90px_rgba(0,0,0,.24)] transition duration-300 hover:border-white/20">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          sizes="(min-width: 1024px) 34vw, 100vw"
          className="pointer-events-none -z-10 object-cover opacity-[0.09] blur-2xl transition duration-500 group-hover:opacity-[0.14]"
        />
      )}

      <div className="grid lg:min-h-[310px] lg:grid-cols-[35%_1fr]">
        <div className="relative min-h-[230px] overflow-hidden lg:min-h-full">
          {backdrop ? (
            <Image
              src={backdrop}
              alt={`${collection.collection_name} artwork`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.025]"
            />
          ) : firstMovie?.poster_url ? (
            <Image
              src={firstMovie.poster_url}
              alt={`${collection.collection_name} artwork`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="object-cover object-top transition duration-700 group-hover:scale-[1.025]"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_58%,#0b0b0c_100%)] max-lg:bg-[linear-gradient(0deg,#0b0b0c_0%,transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
            <p className="max-w-[360px] text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              {collection.movies.length} films. One complete story.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-7 p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {collection.collection_name}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <Film className="h-4 w-4" />
                  {collection.movies.length} films
                </span>
                {totalRuntime > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {formatRuntime(totalRuntime)}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={watchHref}
              className="inline-flex h-12 w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              <Play className="h-4 w-4 fill-current" />
              Start from the beginning
            </Link>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Viewing order
                </p>
                <p className="mt-1 text-xs text-white/35 sm:hidden">
                  Swipe to see every movie
                </p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollMovies(-1)}
                  disabled={!canScrollPrevious}
                  aria-label={`Previous movies in ${collection.collection_name}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-white/35 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollMovies(1)}
                  disabled={!canScrollNext}
                  aria-label={`Next movies in ${collection.collection_name}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-white/35 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={movieRailRef}
              onScroll={updateRailControls}
              className="-mx-2 mt-2 flex min-w-0 snap-x snap-mandatory items-start gap-2 overflow-x-auto px-2 py-3 [scrollbar-width:none] sm:snap-proximity [&::-webkit-scrollbar]:hidden"
            >
              {collection.movies.map((movie, index) => {
                const previewItem = adaptTMDBToRecommendation({
                  id: movie.tmdb_id,
                  tmdb_id: movie.tmdb_id,
                  type: movie.type,
                  title: movie.title,
                  poster_url: movie.poster_url,
                  genres: movie.genres,
                  year: movie.year,
                  duration: movie.duration ?? null,
                  synopsis: movie.synopsis,
                  trailer_key: null,
                });

                return (
                  <div
                    key={`${movie.tmdb_id}-${movie.id}`}
                    className="w-[112px] shrink-0 snap-start sm:w-[124px]"
                  >
                    <FilmCard
                      item={previewItem}
                      compact
                      orderNumber={index + 1}
                      priority={priority && index < 4}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CollectionPage({
  genre,
  searchQuery = "",
  onHeroBackdropsChange,
}: {
  genre: string;
  searchQuery?: string;
  onHeroBackdropsChange?: (backdrops: string[]) => void;
}) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const getKey = (
    pageIndex: number,
    previousPageData: BingeCollection[] | null,
  ) => {
    if (previousPageData && previousPageData.length === 0) return null;

    const params = new URLSearchParams({ page: String(pageIndex + 1) });
    if (searchQuery.trim()) {
      params.set("query", searchQuery.trim());
    } else {
      params.set("genre", genre);
    }
    return `/api/tmdb/collections?${params.toString()}`;
  };

  const { data, setSize, isValidating, error } = useSWRInfinite<
    BingeCollection[]
  >(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    persistSize: false,
  });

  const collections = useMemo(() => (data ? data.flat() : []), [data]);
  const hasReachedEnd = Boolean(data && data[data.length - 1]?.length === 0);
  const uniqueCollections = useMemo(
    () =>
      Array.from(
        new Map(
          collections.map((collection) => [
            collection.collection_id,
            collection,
          ]),
        ).values(),
      ),
    [collections],
  );
  const heroBackdrops = useMemo(
    () =>
      Array.from(
        new Set(
          uniqueCollections
            .flatMap((collection) => collection.movies)
            .map((movie) => movie.backdrop_url || movie.poster_url)
            .filter((image): image is string => Boolean(image)),
        ),
      ).slice(0, 12),
    [uniqueCollections],
  );

  useEffect(() => {
    onHeroBackdropsChange?.(heroBackdrops);
  }, [heroBackdrops, onHeroBackdropsChange]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isValidating && !hasReachedEnd) {
          setSize((previousSize) => previousSize + 1);
        }
      },
      { rootMargin: "500px 0px", threshold: 0 },
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasReachedEnd, isValidating, setSize]);

  if (error) return <ErrorMessage />;

  return (
    <div className="space-y-5">
      {!data && isValidating
        ? Array.from({ length: 3 }).map((_, index) => (
            <CollectionSkeleton key={index} />
          ))
        : uniqueCollections.map((collection, index) => (
            <CollectionRow
              key={collection.collection_id}
              collection={collection}
              priority={index === 0}
            />
          ))}

      {data && !isValidating && uniqueCollections.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
          <h3 className="text-xl font-semibold text-white">
            No matching collections found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
            Try another franchise name, check the spelling, or clear the search
            to return to {genre} sagas.
          </p>
        </div>
      )}

      <div ref={loaderRef} className="flex h-20 items-center justify-center">
        {isValidating && data && (
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-red-500" />
        )}
      </div>
    </div>
  );
}

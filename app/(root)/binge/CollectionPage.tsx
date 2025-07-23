"use client";

import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import FilmCard from "@/components/FilmCard";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { BingeCollection } from "@/types/binge";
import ErrorMessage from "@/components/ErrorMessage";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CollectionPage({ genre }: { genre: string }) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const getKey = (pageIndex: number) =>
    `/api/tmdb/collections?genre=${genre}&page=${pageIndex + 1}`;

  const { data, setSize, isValidating, error } = useSWRInfinite<
    BingeCollection[]
  >(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  if (error) {
    <ErrorMessage
      title="Failed to load collections"
      message="Please try again later."
    />;
  }

  const collections = data ? data.flat() : [];

  const uniqueCollections = Array.from(
    new Map(collections.map((c) => [c.collection_id, c])).values()
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isValidating) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [isValidating, setSize]);

  const isInitialLoading = !data && isValidating;

  return (
    <section className="space-y-10">
      {isInitialLoading ? (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-section-${i}`}>
              <div className="h-8 w-72 bg-white/10 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div
                    key={`skeleton-card-${i}-${j}`}
                    className="aspect-[2/3] w-full rounded-md bg-white/10 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        uniqueCollections.map((collection) => (
          <div key={collection.collection_id}>
            <h2 className=" text-2xl md:text-3xl font-semibold mb-6">
              {collection.collection_name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
              {collection.movies.map((movie) => {
                const adapted = adaptTMDBToRecommendation(movie);
                return (
                  <FilmCard
                    key={`movie-${movie.media_type}-${movie.tmdb_id}-${movie.id}`}
                    item={adapted}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}

      <div ref={loaderRef} className="h-10 flex justify-center items-center">
        {isValidating && !isInitialLoading && (
          <div className="w-6 h-6 border-2 border-t-transparent border-white/60 rounded-full animate-spin" />
        )}
      </div>
    </section>
  );
}

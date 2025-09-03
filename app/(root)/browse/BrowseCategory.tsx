"use client";

import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import Link from "next/link";
import FilmCard from "@/components/FilmCard";
import { FiArrowRight } from "react-icons/fi";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { Suspense } from "react";
import Loader from "@/components/Loader";

export function BrowseCategory({
  title,
  href,
  items,
  error,
  isLoading,
}: {
  title: string;
  href: string;
  items: TMDBEnrichedResult[];
  error?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <section className="mb-16 relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
          <Link
            href={href}
            prefetch
            className="cursor-pointer w-fit inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 transition text-sm px-4 py-2 rounded-md font-[family-name:var(--font-geist-mono)]"
          >
            <span>Browse All</span>
            <FiArrowRight />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-md bg-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-400">Failed to load {title.toLowerCase()}.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {items.map((item) => {
              const adapted = adaptTMDBToRecommendation(item);
              return <FilmCard key={adapted.id} item={adapted} />;
            })}
          </div>
        )}
      </section>
    </Suspense>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

const TMDBSuggestionSkeleton = () => {
  return (
    <section className="watch-section relative mt-16" aria-busy="true" aria-label="Loading suggestions">
      {/* Header with nav buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold ">You May Also Like</h2>
        <div className="flex gap-3">
          <div className="p-2 md:p-3 rounded-full bg-gray-800/50 ">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <div className="p-2 md:p-3 rounded-full bg-gray-800/50 ">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full media-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-sm overflow-hidden shadow-lg"
          >
            {/* Poster */}
            <Skeleton className="relative aspect-[2/3] w-full rounded-lg" />

            {/* Info */}
            <div className="flex-1 pt-4">
              <Skeleton className="mb-3 h-9 w-full rounded-md lg:hidden" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <div className="flex mt-1 flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-8 rounded" />
                  <Skeleton className="h-5 w-8 rounded" />
                </div>
                <Skeleton className="h-6 w-12 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-2">
        <Skeleton className="h-2 w-6 rounded-full" /><Skeleton className="h-2 w-2 rounded-full" /><Skeleton className="h-2 w-2 rounded-full" />
      </div>
    </section>
  );
};

export default TMDBSuggestionSkeleton;

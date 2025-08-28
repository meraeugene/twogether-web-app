"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const TMDBSuggestionSkeleton = () => {
  return (
    <section className="mt-16">
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
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-sm overflow-hidden shadow-lg animate-pulse"
          >
            {/* Poster */}
            <div className="relative aspect-[2/3] w-full bg-white/10 rounded-lg" />

            {/* Info */}
            <div className="flex-1 text-sm py-2 space-y-2">
              <div className="h-4 w-3/4 mt-2 bg-white/10 rounded" />
              <div className="flex mt-3 items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-3 w-8 bg-white/10 rounded" />
                  <div className="h-3 w-6 bg-white/10 rounded" />
                </div>
                <div className="h-4 w-10 bg-white/10 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TMDBSuggestionSkeleton;

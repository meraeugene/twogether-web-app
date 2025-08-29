"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetcher } from "@/utils/swr/fetcher";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import { TMDBEnrichedResult } from "@/types/tmdb";
import TMDBSuggestionSkeleton from "./TMDBSuggestionSkeleton";
import {
  buttonVariants,
  containerVariants,
  itemVariants,
} from "@/utils/suggestionsAnimation";

type SWRResponse = {
  results: TMDBEnrichedResult[];
  total_pages: number;
};

const ITEMS_PER_SLIDE = 6; // client will show 6 per slide

export default function TMDBSuggestions({
  tmdbId,
  type,
}: {
  tmdbId: number | string;
  type: string;
}) {
  const [slide, setSlide] = useState(0); // client slide within 18 items

  const { data, isLoading } = useSWR<SWRResponse>(
    tmdbId ? `/api/tmdb/similar?id=${tmdbId}&type=${type}&page=1` : null,
    fetcher
  );

  const suggestions = data?.results || [];
  const totalSlides = Math.ceil(suggestions.length / ITEMS_PER_SLIDE);

  if (isLoading) return <TMDBSuggestionSkeleton />;
  if (!suggestions || suggestions.length === 0) return null;

  // current 6-item slide
  const currentItems = suggestions.slice(
    slide * ITEMS_PER_SLIDE,
    slide * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE
  );

  const handleNext = () => {
    if (slide < totalSlides - 1) setSlide(slide + 1);
  };

  const handlePrev = () => {
    if (slide > 0) setSlide(slide - 1);
  };

  return (
    <section className="mt-16">
      {/* Header with nav buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold">You May Also Like</h2>

        <div className="flex gap-3">
          <motion.button
            onClick={handlePrev}
            disabled={slide === 0}
            className="p-2 md:p-3 rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={slide >= totalSlides - 1}
            className="p-2 md:p-3 rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Grid with AnimatePresence for smooth slide transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide}
          className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-7"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {currentItems.map((rec) => (
            <motion.div
              key={`${rec.tmdb_id}-${slide}`}
              className="w-full rounded-sm overflow-hidden shadow-lg"
              variants={itemVariants}
              layout
            >
              {/* Poster */}
              <div className="group relative">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                  <Image
                    src={rec.poster_url || "/placeholder.png"}
                    alt={rec.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover w-full h-full transition duration-300 group-hover:brightness-50"
                  />
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg">
                  <Link
                    prefetch
                    href={`/tmdb/watch/${rec.type}/${
                      rec.tmdb_id
                    }/${getSlugFromTitle(rec.title)}`}
                  >
                    <div className="flex cursor-pointer items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg ring-1 ring-white/10 hover:ring-3 hover:ring-red-100">
                      <FaPlay className="text-xl" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-4">
                <Link
                  prefetch
                  href={`/tmdb/watch/${rec.type}/${
                    rec.tmdb_id
                  }/${getSlugFromTitle(rec.title)}`}
                >
                  <div className="w-full cursor-pointer flex items-center gap-3 text-white bg-red-600 hover:bg-red-700 transition p-2 rounded-md font-[family-name:var(--font-geist-mono)] text-sm mb-3 lg:hidden">
                    <FaPlay className="text-white text-xs" />
                    Watch Now
                  </div>
                </Link>

                <div className="font-medium text-white">{rec.title}</div>

                <div className="flex mt-1 items-center justify-between flex-wrap gap-2">
                  <div className="text-white/80 text-sm flex gap-2">
                    <span>{rec.year}</span>
                    {rec.type === "tv" ? (
                      <span className="text-white/50 font-medium">
                        S{rec.seasons || 1} · {rec.episodes || 1}EPS
                      </span>
                    ) : (
                      <span className="text-white/50 font-medium">
                        {rec.duration || 0}m
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-700 rounded-sm px-2 py-1 text-xs capitalize">
                    {rec.type}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: totalSlides }, (_, index) => (
          <motion.button
            key={index}
            onClick={() => setSlide(index)}
            className={`w-2 h-2 cursor-pointer rounded-full transition-all duration-300 ${
              slide === index
                ? "bg-red-500 w-6"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </section>
  );
}

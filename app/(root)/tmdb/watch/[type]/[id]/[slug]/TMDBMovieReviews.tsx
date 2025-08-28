"use client";

import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import { BiStar } from "react-icons/bi";
import TMDBReviewCard from "./TMDBReviewCard";
import { TMDBMovieReview } from "@/types/tmdbMovieReview";

export default function TMDBMovieReviews({ tmdbId }: { tmdbId: number }) {
  const {
    data: reviews,
    error,
    isLoading,
  } = useSWR<TMDBMovieReview[]>(`/api/tmdb/reviews/${tmdbId}`, fetcher);

  if (isLoading) {
    return (
      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mt-12" />
    );
  }

  if (error) {
    return (
      <div className="relative mt-12 w-fit p-4 border-l-4 border-red-500 bg-red-500/5">
        <div className="absolute top-2 left-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <p className="text-sm ml-4 text-red-400">Failed to load reviews</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="w-full xl:max-w-1/2 mt-16">
        <div className="relative mb-8">
          <div className="absolute -top-2 -left-4 w-12 h-0.5 bg-red-500 transform -rotate-12" />
          <div className="absolute -top-1 -left-2 w-8 h-0.5 bg-red-300 transform -rotate-12" />
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Reviews
          </h3>
        </div>
        <div className="text-center py-6 md:py-12 border px-8 border-white/10 bg-black/10">
          <BiStar className="text-4xl font-light text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            No reviews yet. Be the first to leave one!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:max-w-1/2 mt-16">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute -top-2 -left-4 w-12 h-0.5 bg-red-500 transform -rotate-12" />
        <div className="absolute -top-1 -left-2 w-8 h-0.5 bg-red-300 transform -rotate-12" />
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Reviews
          </h3>
          <span className="text-sm  bg-white/10 px-3 py-1 rounded-sm">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className="opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "forwards",
            }}
          >
            <TMDBReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
}

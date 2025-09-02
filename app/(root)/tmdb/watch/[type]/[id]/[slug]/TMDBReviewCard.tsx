/* eslint-disable @next/next/no-img-element */
"use client";

import { BiUser } from "react-icons/bi";
import TMDBStarRating from "./TMDBStarRating";
import { TMDBMovieReview } from "@/types/tmdbMovieReview";
import Link from "next/link";

const TMDBReviewCard = ({ review }: { review: TMDBMovieReview }) => {
  const createdAt = new Date(review.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative border border-white/10 bg-black/20 backdrop-blur-sm">
      {/* Decorative corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-red-500" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-red-500" />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center overflow-hidden">
              {review.avatar_url ? (
                <Link href={`/profile/${review.username}/${review.user_id}`}>
                  <img
                    src={review.avatar_url}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <BiUser className="text-xl text-gray-400" />
              )}
            </div>

            {/* User info */}
            <div>
              <Link
                href={`/profile/${review.username}/${review.user_id}`}
                className="text-white font-medium"
              >
                @{review.username || review.full_name || "Anonymous User"}
              </Link>
              <p className="text-xs text-gray-400">{createdAt}</p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <TMDBStarRating rating={review.rating} size="text-base" />
        </div>

        {/* Comment */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <p className="text-gray-300 leading-relaxed pl-4">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default TMDBReviewCard;

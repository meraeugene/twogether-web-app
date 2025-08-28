"use client";

import { useState, useTransition } from "react";
import { BiSend, BiStar, BiSolidStar, BiSolidStarHalf } from "react-icons/bi";
import { createMovieReviewAction } from "@/actions/movieReviewActions";
import { mutate } from "swr";

export default function TMDBReviewForm({
  currentUserId,
  tmdbId,
}: {
  currentUserId: string;
  tmdbId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ comment?: string; rating?: string }>(
    {}
  );

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setErrors({});

    startTransition(async () => {
      const result = await createMovieReviewAction(formData, {
        userId: currentUserId,
        tmdbId,
      });

      if (result.errors) {
        setErrors(result.errors);
      }
      if (result.message) {
        setMessage(result.message);

        setValue(0);
        setHover(null);

        mutate(`/api/tmdb/reviews/${tmdbId}`);

        setTimeout(() => setMessage(null), 2000);
      }
    });
  }

  // --- Rating state ---
  const max = 10;
  const [hover, setHover] = useState<number | null>(null);
  const [value, setValue] = useState<number>(0);

  const displayValue = hover ?? value;

  // Generate stars for rating
  const stars = Array.from({ length: max }, (_, i) => {
    const starIndex = i + 1;
    const halfValue = starIndex - 0.5;

    const isFullStar = displayValue >= starIndex;
    const isHalfStar = displayValue >= halfValue && displayValue < starIndex;

    return {
      index: starIndex,
      halfValue,
      isFullStar,
      isHalfStar,
    };
  });

  const handleStarClick = (rating: number) => {
    setValue(rating);
  };

  const handleStarHover = (rating: number) => {
    setHover(rating);
  };

  const handleStarLeave = () => {
    setHover(null);
  };

  return (
    <div className="w-full xl:max-w-1/2 mt-16">
      <form action={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute -top-2 -left-4 w-12 h-0.5 bg-red-500 transform -rotate-12" />
          <div className="absolute -top-1 -left-2 w-8 h-0.5 bg-red-300 transform -rotate-12" />
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Leave a Review
          </h3>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className="relative p-4 border-l-4 border-green-500 bg-green-500/5
               animate-fade-out"
          >
            <div className="absolute top-2 left-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm ml-4 text-green-400">{message}</p>
          </div>
        )}

        {/* Star Rating */}
        <div>
          <span className="text-base text-gray-300">
            Rating:{" "}
            {value > 0
              ? Number.isInteger(value)
                ? value
                : value.toFixed(1)
              : "0"}{" "}
            / {max}
          </span>

          <div className="flex items-center gap-1 mb-3 mt-2">
            {stars.map((star) => (
              <div key={star.index} className="relative">
                {/* Full star container */}
                <div className="flex">
                  {/* Left half clickable area */}
                  <div
                    onClick={() => handleStarClick(star.halfValue)}
                    onMouseEnter={() => handleStarHover(star.halfValue)}
                    onMouseLeave={handleStarLeave}
                    className="cursor-pointer flex items-center justify-center w-3 h-6 relative z-10"
                  >
                    {/* Render the appropriate star state */}
                    {star.isHalfStar && !star.isFullStar ? (
                      <BiSolidStarHalf className="text-2xl text-red-500 absolute left-0" />
                    ) : star.isFullStar ? (
                      <BiSolidStar className="text-2xl text-red-500 absolute left-0" />
                    ) : (
                      <BiStar className="text-2xl text-gray-600 hover:text-red-400 absolute left-0" />
                    )}
                  </div>

                  {/* Right half clickable area */}
                  <div
                    onClick={() => handleStarClick(star.index)}
                    onMouseEnter={() => handleStarHover(star.index)}
                    onMouseLeave={handleStarLeave}
                    className="cursor-pointer flex items-center justify-center w-3 h-6 relative z-10"
                  >
                    {/* Only show the right part if it's not already handled by left side */}
                    {!star.isHalfStar && !star.isFullStar && (
                      <BiStar className="text-2xl text-gray-600 hover:text-red-400 absolute right-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <input type="hidden" name="rating" value={value} />
          {errors.rating && (
            <p className="text-red-400 text-sm pl-4 border-l-2 border-red-400">
              {errors.rating}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="group ">
          <label
            htmlFor="comment"
            className="text-base font-medium text-gray-300 "
          >
            Your Comment
          </label>
          <div className="relative mt-4 mb-2">
            <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-red-500" />

            <textarea
              id="comment"
              name="comment"
              placeholder="Share your thoughts..."
              disabled={isPending}
              className="w-full resize-none rounded-none bg-transparent border border-white/20 
                         text-white placeholder-gray-400 p-4 text-base outline-none 
                         focus:border-red-500 transition-colors duration-300 min-h-[100px]
                         group-hover:border-white/40"
              rows={4}
            />
          </div>
          {errors.comment && (
            <p className="text-red-400 text-sm pl-4 border-l-2 border-red-400">
              {errors.comment}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="group cursor-pointer relative overflow-hidden bg-black border-2 border-white/20 text-white 
       px-8 py-3 font-semibold transition-all duration-500 hover:border-red-500
       disabled:opacity-50 disabled:cursor-not-allowed clip-path-button"
          >
            <div
              className="absolute inset-0 bg-red-500 transform -translate-x-full 
            group-hover:translate-x-0 transition-transform duration-500"
            />

            <div className="relative flex items-center gap-2 z-10">
              <div className="w-5 h-5 flex items-center justify-center">
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <BiSend className="text-lg group-hover:rotate-12 transition-all duration-500" />
                )}
              </div>
              <span>Submit</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

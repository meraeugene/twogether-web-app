"use client";

import { BiStar, BiSolidStar, BiSolidStarHalf } from "react-icons/bi";

const TMDBStarRating = ({
  rating,
  size = "text-lg",
}: {
  rating: number;
  size?: string;
}) => {
  const stars = Array.from({ length: 10 }, (_, i) => {
    const starIndex = i + 1;
    const halfValue = starIndex - 0.5;

    const isFullStar = rating >= starIndex;
    const isHalfStar = rating >= halfValue && rating < starIndex;

    return {
      index: starIndex,
      isFullStar,
      isHalfStar,
    };
  });

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <span key={star.index}>
          {star.isFullStar ? (
            <BiSolidStar className={`${size} text-red-500`} />
          ) : star.isHalfStar ? (
            <BiSolidStarHalf className={`${size} text-red-500`} />
          ) : (
            <BiStar className={`${size} text-gray-600`} />
          )}
        </span>
      ))}
      <span className="ml-2  text-gray-400">
        {Number.isInteger(rating) ? rating : rating.toFixed(1)}/10
      </span>
    </div>
  );
};

export default TMDBStarRating;

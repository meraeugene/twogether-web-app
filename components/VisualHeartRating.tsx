"use client";

import { IoMdHeart, IoMdHeartHalf, IoMdHeartEmpty } from "react-icons/io";

type Props = {
  value: number;
  size?: string; // e.g. "w-6 h-6"
};

export const VisualHeartRating = ({ value, size = "w-4 h-4" }: Props) => {
  const getIcon = (i: number) => {
    const isFull = value >= i;
    const isHalf = value >= i - 0.5 && value < i;
    const baseClass = `text-red-500 ${size}`;

    if (isFull) return <IoMdHeart key={i} className={baseClass} />;
    if (isHalf) return <IoMdHeartHalf key={i} className={baseClass} />;
    return <IoMdHeartEmpty key={i} className={baseClass} />;
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => getIcon(i))}
    </div>
  );
};

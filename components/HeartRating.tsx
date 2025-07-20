"use client";
import { useState } from "react";
import { IoMdHeart, IoMdHeartEmpty, IoMdHeartHalf } from "react-icons/io";

type Props = {
  value: number;
  onChange: (val: number) => void;
};

export const HeartRating = ({ value, onChange }: Props) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (i: number, isHalf: boolean) => {
    const newValue = isHalf ? i - 0.5 : i;
    onChange(newValue);
  };

  const getIcon = (i: number) => {
    const current = hoverValue !== null ? hoverValue : value;
    const isFull = current >= i;
    const isHalf = current >= i - 0.5 && current < i;

    const baseClass =
      "text-red-500 w-10 h-10 transition-transform duration-200 ease-out";

    const hoverClass =
      hoverValue !== null && current >= i
        ? "scale-110"
        : value >= i
        ? "animate-pulse"
        : "";

    if (isFull) return <IoMdHeart className={`${baseClass} ${hoverClass}`} />;
    if (isHalf)
      return <IoMdHeartHalf className={`${baseClass} ${hoverClass}`} />;
    return <IoMdHeartEmpty className={`${baseClass}`} />;
  };

  return (
    <div className="flex" onMouseLeave={() => setHoverValue(null)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="relative w-10 h-10 group">
          <button
            type="button"
            className="absolute cursor-pointer left-0 w-1/2 h-full z-10"
            onMouseEnter={() => setHoverValue(i - 0.5)}
            onClick={() => handleClick(i, true)}
          />
          <button
            type="button"
            className="absolute cursor-pointer right-0 w-1/2 h-full z-10"
            onMouseEnter={() => setHoverValue(i)}
            onClick={() => handleClick(i, false)}
          />
          <div className="group-hover:scale-110 transition-transform duration-150 ease-out">
            {getIcon(i)}
          </div>
        </div>
      ))}
    </div>
  );
};

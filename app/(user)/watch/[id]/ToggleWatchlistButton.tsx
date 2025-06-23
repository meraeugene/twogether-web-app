"use client";

import { useState, useTransition } from "react";
import { MdMovieFilter } from "react-icons/md";
import { toast } from "sonner";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/actions/watchlistActions";

export default function ToggleWatchlistButton({
  recommendationId,
  initialInWatchlist,
  initialWatchlistId,
  currentUserId,
}: {
  recommendationId: string;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  currentUserId: string;
}) {
  const [isInList, setIsInList] = useState(initialInWatchlist);
  const [watchlistId, setWatchlistId] = useState(initialWatchlistId);
  const [isPending, startTransition] = useTransition();

  console.log(isInList);

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isInList && watchlistId) {
          await removeFromWatchlist(watchlistId);
          toast.info("Removed from watchlist");
          setIsInList(false);
          setWatchlistId(null);
        } else {
          const id = await addToWatchlist(recommendationId, currentUserId);
          toast.success("Added to watchlist!");
          setIsInList(true);
          setWatchlistId(id);
        }
      } catch {
        toast.error("Something went wrong.");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`mt-3 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md text-sm transition
        ${
          isInList
            ? "bg-red-600 hover:bg-red-500"
            : "bg-red-500 hover:bg-red-600"
        }
        ${isPending ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <MdMovieFilter />
      {isInList ? "✗ Remove from Watchlist" : "✔ Add to Watchlist"}
    </button>
  );
}

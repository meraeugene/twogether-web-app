"use client";

import { useState, useTransition } from "react";
import { MdMovieFilter } from "react-icons/md";
import { toast } from "sonner";
import {
  addToWatchlist,
  addToWatchlistWithMetadata,
  removeFromWatchlist,
} from "@/actions/watchlistActions";
import { WatchlistMetadata } from "@/types/watchlist";

export default function ToggleWatchlistButton({
  recommendationId,
  initialInWatchlist,
  initialWatchlistId,
  currentUserId,
  fallbackMetadata,
  isAiRecommendation = false,
  isTMDBRecommendation = false,
}: {
  recommendationId: string;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  currentUserId: string;
  fallbackMetadata: WatchlistMetadata;
  isAiRecommendation?: boolean;
  isTMDBRecommendation?: boolean;
}) {
  const [isInList, setIsInList] = useState(initialInWatchlist);
  const [watchlistId, setWatchlistId] = useState(initialWatchlistId);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const optimisticInList = !isInList;
    setIsInList(optimisticInList);

    startTransition(async () => {
      try {
        if (!optimisticInList && watchlistId) {
          await removeFromWatchlist(watchlistId, currentUserId);
          setWatchlistId(null);
          toast.success("Removed from your watchlist.");
          return;
        }

        const id =
          recommendationId && !isAiRecommendation && !isTMDBRecommendation
            ? await addToWatchlist(recommendationId, currentUserId)
            : await addToWatchlistWithMetadata(currentUserId, fallbackMetadata);

        setWatchlistId(id);
        toast.success("Added to your watchlist.");
      } catch {
        setIsInList(!optimisticInList);
        toast.error("Something went wrong.");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-fit flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200
        ${
          isInList
            ? "bg-red-600 hover:bg-red-500"
            : "bg-white text-black hover:bg-white/90"
        }
        ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <MdMovieFilter />
      {isInList ? "Remove from Watchlist" : "Add to Watchlist"}
    </button>
  );
}

"use client";

import useSWR from "swr";
import FilmCard from "@/components/FilmCard";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import ErrorMessage from "@/components/ErrorMessage";

interface Props {
  userId: string;
}

export default function WatchlistClient({ userId }: Props) {
  const {
    data: watchList,
    isLoading,
    error,
  } = useSWR(["watchlist", userId], () => getWatchlistByUserId(userId));

  if (isLoading) {
    return (
      <main>
        <div className="mb-6">
          <div className="h-7 w-42 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-4 w-96 bg-white/5 rounded mb-7 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white/10 rounded-lg overflow-hidden aspect-[2/3]"
            >
              <div className="w-full h-full bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error || !watchList) {
    return (
      <ErrorMessage
        title="Failed to load watchlist."
        message="We couldn't load your watchlist."
        hint="Please try again later."
      />
    );
  }

  if (watchList.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Watchlist is Empty</h1>
        <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
          You haven&apos;t added any Movies/Shows to your Watchlist yet. Start{" "}
          <a href="/browse" className="text-white hover:underline">
            browsing
          </a>{" "}
          and add movies/shows you want to watch later!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Watchlist</h1>
      <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
        Here are the Movies/Shows you&apos;ve added to your Watchlist.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-6">
        {watchList.map((item) => (
          <FilmCard
            key={item.recommendation_id}
            item={item}
            userId={userId}
            isRemoveFromWatchlist
            watchlistItemId={item.id}
          />
        ))}
      </div>
    </div>
  );
}

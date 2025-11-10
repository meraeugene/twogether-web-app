// app/(user)/watchlist/page.tsx
"use client";

import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import ErrorMessage from "@/components/ErrorMessage";
import FilmCard from "@/components/FilmCard";
import Link from "next/link";
import { CurrentUser } from "@/types/user";
import { Recommendation } from "@/types/recommendation";

type WatchlistResponse = {
  user: CurrentUser;
  items: Recommendation[];
};

export default function WatchlistPage() {
  const { data, error, isLoading } = useSWR<WatchlistResponse>(
    "/api/my-watchlist",
    fetcher
  );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );

  if (error || !data?.user) return <ErrorMessage />;

  const { user, items } = data;

  if (items.length === 0) {
    return (
      <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 relative xl:pt-32 text-white">
        <h1 className="text-2xl font-bold mb-4">Your Watchlist is Empty</h1>
        <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
          You haven&apos;t added any Movies/Shows to your Watchlist yet. Start{" "}
          <Link prefetch href="/browse" className="text-white hover:underline">
            browsing
          </Link>{" "}
          now.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 relative xl:pt-32 text-white">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Your Watchlist</h1>
        <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
          Here are the Movies/Shows you&apos;ve added to your Watchlist.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 mt-6">
          {data?.items.map((item) => (
            <FilmCard
              key={item.tmdb_id}
              item={item}
              userId={user.id}
              isRemoveFromWatchlist={true}
              watchlistItemId={item.id}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

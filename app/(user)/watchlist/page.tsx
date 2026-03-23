import { getMyWatchlist } from "@/actions/watchlistActions";
import ErrorMessage from "@/components/ErrorMessage";
import FilmCard from "@/components/FilmCard";
import Link from "next/link";

export default async function WatchlistPage() {
  const watchlist = await getMyWatchlist();

  if (!watchlist) return <ErrorMessage />;

  const { userId, items } = watchlist;

  if (items.length === 0) {
    return (
      <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 relative xl:pt-32 text-white">
        <h1 className="text-2xl font-bold mb-4">Your Watchlist is Empty</h1>
        <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
          You haven&apos;t added any Movies/Shows to your Watchlist yet. Start{" "}
          <Link
            prefetch={false}
            href="/browse"
            className="text-white hover:underline"
          >
            browsing
          </Link>{" "}
          now.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 relative xl:pt-32 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Watchlist</h1>
        <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
          Here are the Movies/Shows you&apos;ve added to your Watchlist.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 mt-6">
          {items.map((item) => (
            <FilmCard
              key={item.tmdb_id}
              item={item}
              userId={userId}
              isRemoveFromWatchlist={true}
              watchlistItemId={item.id}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

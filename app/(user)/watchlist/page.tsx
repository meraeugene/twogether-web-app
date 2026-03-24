import { getCurrentUser } from "@/actions/authActions";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import ErrorMessage from "@/components/ErrorMessage";
import FilmCard from "@/components/FilmCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <ErrorMessage />;
  }

  const items = await getWatchlistByUserId(user.id);

  if (!items) {
    return <ErrorMessage />;
  }

  if (items.length === 0) {
    return (
      <main className="relative flex min-h-screen flex-col bg-black px-7 pb-16 pt-28 font-[family-name:var(--font-geist-sans)] text-white lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
        <h1 className="mb-4 text-2xl font-bold">Your Watchlist is Empty</h1>
        <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-gray-600">
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
    <main className="relative flex min-h-screen flex-col bg-black px-7 pb-16 pt-28 font-[family-name:var(--font-geist-sans)] text-white lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <div>
        <h1 className="mb-4 text-2xl font-bold">Your Watchlist</h1>
        <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-gray-600">
          Here are the Movies/Shows you&apos;ve added to your Watchlist.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((item) => (
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

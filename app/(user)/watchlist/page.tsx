import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import FilmCard from "../../../components/FilmCard";

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const watchList = await getWatchlistByUserId(user.id);

  if (!watchList) {
    return (
      <ErrorMessage
        title="Failed to Load Watchlist"
        message="Unable to fetch your watchlist."
        hint="Please try again later."
      />
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 relative xl:pt-32 text-white">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      {watchList.length === 0 ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Your Watchlist is Empty</h1>
          <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
            You haven&apos;t added any Movies/Shows to your Watchlist yet. Start{" "}
            <Link href="/browse" className="text-white hover:underline">
              browsing
            </Link>{" "}
            now.
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Your Watchlist</h1>
          <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
            Here are the Movies/Shows you&apos;ve added to your Watchlist.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 mt-6">
            {watchList.map((item) => (
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
      )}
    </main>
  );
}

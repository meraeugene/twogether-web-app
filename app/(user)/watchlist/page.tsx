import { getCurrentUser } from "@/actions/authActions";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import ErrorMessage from "@/components/ErrorMessage";
import FilmCard from "@/components/FilmCard";
import Link from "@/components/NavigationLink";

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
      <main className="page-gutter page-listing relative flex min-h-screen flex-col bg-black px-7 pb-16 pt-28 font-[family-name:var(--font-geist-sans)] text-white">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your Watchlist</h1>
        <p className="mb-8 text-sm leading-6 text-white/55">
          You haven&apos;t added any Movies/Shows to your Watchlist yet. Start{" "}
          <Link
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
    <main className="page-gutter page-listing relative flex min-h-screen flex-col bg-black px-7 pb-16 pt-28 font-[family-name:var(--font-geist-sans)] text-white">
      <div className="pointer-events-none absolute inset-0 page-ambient" />
      <div className="relative">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your Watchlist</h1>
        <p className="mb-8 text-sm leading-6 text-white/55">
          Here are the Movies/Shows you&apos;ve added to your Watchlist.
        </p>
        <div className="media-grid grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
          {items.map((item, index) => (
            <FilmCard
              key={item.tmdb_id}
              item={item}
              priority={index < 6}
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

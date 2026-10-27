import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";
import { LoadingPage } from "@/components/PageSkeletons";

export default function WatchlistSkeletonLoading() {
  return (
    <LoadingPage label="Loading your watchlist">
      <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your Watchlist</h1>
      <p className="mb-8 text-sm leading-6 text-white/55">Here are the Movies/Shows you&apos;ve added to your Watchlist.</p>
      <div className="media-grid grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => <FilmCardSkeleton key={index} />)}
      </div>
    </LoadingPage>
  );
}

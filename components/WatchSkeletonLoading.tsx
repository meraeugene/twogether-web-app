import Skeleton from "@/components/ui/Skeleton";
import { LoadingPage } from "@/components/PageSkeletons";
import TMDBSuggestionSkeleton from "@/app/(root)/tmdb/watch/[type]/[id]/[slug]/TMDBSuggestionSkeleton";

function PlayerSkeleton() {
  return (
    <div className="watch-player space-y-4 md:space-y-8">
      <Skeleton className="watch-screen mobile-bleed aspect-video w-full rounded-2xl border border-white/10" />
      <div className="watch-servers flex flex-wrap gap-2">
        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-11 w-28 shrink-0 rounded-xl md:h-9" />)}
      </div>
      <Skeleton className="mt-4 h-4 w-72 max-w-full sm:h-5" />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <section className="watch-summary relative mt-8 space-y-5">
      <Skeleton className="h-8 w-3/4 md:h-10" />
      <div className="max-w-3xl space-y-2.5">
        <Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-4/5" />
      </div>
      <div className="flex items-center gap-4"><Skeleton className="h-5 w-9" /><Skeleton className="h-5 w-10" /><Skeleton className="h-6 w-12 rounded-sm" /></div>
      <div className="flex flex-wrap gap-2">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-6 w-20 rounded" />)}</div>
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <section className="watch-section relative mt-12 border-t border-white/10 pt-8">
      <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-x-5 gap-y-6 sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[210px_1fr] lg:gap-x-10">
        <Skeleton className="aspect-[2/3] w-full rounded-lg lg:row-span-2 lg:rounded-2xl" />
        <div className="min-w-0"><Skeleton className="h-4 w-28" /><Skeleton className="mt-2 h-7 w-3/4 sm:h-9" /><Skeleton className="mt-3 h-6 w-full max-w-72" /></div>
        <div className="col-span-full grid min-w-0 grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:col-span-1 lg:col-start-2 xl:grid-cols-4">
          {Array.from({ length: 6 }, (_, index) => <div key={index}><Skeleton className="h-4 w-20 max-w-full" /><Skeleton className="mt-1.5 h-6 w-28 max-w-full" /></div>)}
        </div>
      </div>
      <div className="mt-10 border-t border-white/10 pt-7">
        <Skeleton className="h-4 w-28" /><Skeleton className="mt-1 mb-5 h-8 w-64 max-w-full" />
        <div className="mobile-rail flex gap-3 overflow-hidden pb-3 sm:gap-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="w-[128px] shrink-0 sm:w-[148px]"><Skeleton className="aspect-[2/3] rounded-2xl" /><Skeleton className="mt-3 h-5 w-4/5" /><Skeleton className="mt-1 h-4 w-3/5" /></div>)}
        </div>
      </div>
    </section>
  );
}

export function WatchReviewsSkeleton() {
  return <section aria-busy="true" aria-label="Loading reviews" className="watch-section relative mt-16 w-full xl:max-w-1/2"><Skeleton className="mb-8 h-8 w-36" /><div className="space-y-4 border-y border-white/10 py-5"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div><Skeleton className="h-5 w-28" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-4/5" /></div></section>;
}

export default function WatchSkeletonLoading({ variant = "recommendation" }: { variant?: "tmdb" | "recommendation" | "ai" }) {
  return (
    <LoadingPage label="Loading watch details">
      <Skeleton className="mb-3 h-11 w-11 rounded-full md:mb-6 md:h-8 md:w-12 md:rounded-md lg:h-9 lg:w-16" />
      {variant === "recommendation" ? (
        <div className="flex flex-col gap-10 xl:flex-row">
          <div className="min-w-0 flex-1 space-y-10"><PlayerSkeleton /><SummarySkeleton /><WatchReviewsSkeleton /></div>
          <aside className="grid w-full grid-cols-2 gap-7 md:grid-cols-3 lg:grid-cols-4 xl:block xl:w-[15%] xl:space-y-4 2xl:w-[10%]">{Array.from({ length: 4 }, (_, index) => <div key={index}><Skeleton className="aspect-[2/3] w-full" /><Skeleton className="mt-3 h-5 w-4/5" /></div>)}</aside>
        </div>
      ) : (
        <><PlayerSkeleton /><SummarySkeleton />{variant === "tmdb" && <><DetailsSkeleton /><WatchReviewsSkeleton /><TMDBSuggestionSkeleton /></>}</>
      )}
    </LoadingPage>
  );
}

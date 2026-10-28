import { LoadingPage } from "@/components/PageSkeletons";
import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";
import Skeleton from "@/components/ui/Skeleton";
import CollectionSkeleton from "@/components/CollectionSkeleton";
import styles from "@/app/(root)/browse/browse.module.css";

export function BrowseHeroSkeleton() {
  return (
    <div className={styles.heroMedia} aria-hidden="true">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className={styles.feature}>
        <Skeleton className="h-20 w-72 max-w-full" />
        <Skeleton className="my-4 h-5 w-48 max-w-full" />
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="mb-6 h-5 w-4/5" />
        <div className={styles.heroActions}><Skeleton className="h-11 w-24 rounded-md" /><Skeleton className="h-11 w-32 rounded-md" /></div>
        <div className={styles.playbackHint} />
      </div>
    </div>
  );
}

export function BrowsePageSkeleton() {
  return <main className={styles.page} aria-busy="true">
    <span className="sr-only" role="status">Loading movies and shows</span>
    <div className={styles.hero}><BrowseHeroSkeleton /></div>
    <div className={styles.categories} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="mx-1 h-8 flex-1 rounded-full" />)}</div>
    <div className={styles.content} aria-hidden="true">
      {Array.from({ length: 3 }, (_, row) => <section key={row} className={styles.shelf}>
        <div className={styles.shelfHeading}><Skeleton className="h-9 w-48" /><Skeleton className="h-5 w-16" /></div>
        <div className={styles.grid}>{Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.skeleton}><div className="skeleton-shimmer" /><span /><span /></div>)}</div>
      </section>)}
    </div>
  </main>;
}

export function BrowseCategorySkeleton({ movies = false }: { movies?: boolean }) {
  return <LoadingPage label="Loading titles"><section className="mb-16">
    <div className={`mt-6 mb-10 flex flex-col gap-4 ${movies ? "md:flex-row md:justify-between" : "items-center lg:items-start"}`}><Skeleton className="h-8 w-56 md:h-9" />{movies && <Skeleton className="h-10 w-full rounded-md md:w-44" />}</div>
    <div className="media-grid grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6">{Array.from({ length: 12 }, (_, index) => <FilmCardSkeleton key={index} />)}</div>
  </section></LoadingPage>;
}

export function BingePageSkeleton() {
  return <LoadingPage label="Loading binge collections">
    <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Binge collections</h1><Skeleton className="h-14 w-full rounded-xl lg:max-w-xl" /></header>
    <div className="mobile-filter-rail mobile-rail flex flex-wrap gap-2">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-11 w-24 shrink-0 rounded-full" />)}</div>
    <section className="mt-8"><Skeleton className="mb-5 h-7 w-60 max-w-full sm:h-8" /><div className="space-y-5">{Array.from({ length: 3 }, (_, index) => <CollectionSkeleton key={index} />)}</div></section>
  </LoadingPage>;
}

export function SearchPageSkeleton() {
  return <LoadingPage label="Loading search results">
    <Skeleton className="mb-6 h-7 w-80 max-w-full md:h-9" />
    <div className="media-grid grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <FilmCardSkeleton key={index} />)}</div>
  </LoadingPage>;
}

export function CollectionSearchPageSkeleton() {
  return (
    <LoadingPage label="Loading collection results">
        <div className="space-y-10">
        {Array.from({ length: 2 }, (_, row) => <section key={row}>
          <Skeleton className="mb-4 h-8 w-64 max-w-full lg:h-9" />
          <div className="media-grid grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => <FilmCardSkeleton key={index} />)}
          </div>
        </section>)}
      </div>
    </LoadingPage>
  );
}

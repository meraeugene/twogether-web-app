import Skeleton from "@/components/ui/Skeleton";

export function FilmCardSkeleton() {
  return (
    <div className="relative w-full font-(family-name:--font-geist-sans)">
      <Skeleton className="aspect-2/3 w-full rounded-md shadow-md" />
      <div className="mt-4 mb-3">
        <Skeleton className="h-6 w-4/5 rounded" />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-8 rounded" />
            <Skeleton className="h-5 w-10 rounded" />
          </div>
          <Skeleton className="h-6 w-12 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export default function FilmGridSkeleton({
  titleWidth = "w-48",
  count = 12,
  showDescription = false,
  showHeader = true,
  gridClassName = "media-grid grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
}: {
  titleWidth?: string;
  count?: number;
  showDescription?: boolean;
  showHeader?: boolean;
  gridClassName?: string;
}) {
  return (
    <section className="relative z-10">
      {showHeader && (
        <Skeleton className={`h-8 ${titleWidth}`} />
      )}
      {showHeader && showDescription && (
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      )}

      <div
        className={`${gridClassName} ${
          showHeader ? "mt-6" : ""
        }`}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <FilmCardSkeleton key={idx} />
        ))}
      </div>
    </section>
  );
}

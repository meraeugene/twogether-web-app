import Skeleton from "@/components/ui/Skeleton";

export function FilmCardSkeleton() {
  return (
    <div className="relative w-full space-y-3 font-(family-name:--font-geist-sans)">
      <Skeleton className="aspect-2/3 w-full rounded-md shadow-md" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

export default function FilmGridSkeleton({
  titleWidth = "w-48",
  count = 12,
  showDescription = false,
  showHeader = true,
}: {
  titleWidth?: string;
  count?: number;
  showDescription?: boolean;
  showHeader?: boolean;
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
        className={`grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${
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

"use client";

export function FilmCardSkeleton() {
  return (
    <div className="relative w-full font-(family-name:--font-geist-sans)">
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-md bg-white/10 animate-pulse shadow-md" />
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
        <div
          className={`h-8 ${titleWidth} rounded bg-white/10 animate-pulse`}
        />
      )}
      {showHeader && showDescription && (
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10 animate-pulse" />
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

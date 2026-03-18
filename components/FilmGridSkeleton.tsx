"use client";

export default function FilmGridSkeleton({
  titleWidth = "w-48",
  count = 12,
  showDescription = false,
}: {
  titleWidth?: string;
  count?: number;
  showDescription?: boolean;
}) {
  return (
    <section className="relative z-10">
      <div className={`h-8 ${titleWidth} rounded bg-white/10 animate-pulse`} />
      {showDescription && (
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10 animate-pulse" />
      )}

      <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <div className="aspect-[2/3] w-full rounded-md bg-white/10 animate-pulse" />
            <div className="h-5 w-4/5 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-3/5 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

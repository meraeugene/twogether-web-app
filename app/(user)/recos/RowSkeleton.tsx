export default function RowSkeleton() {
  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6 mt-4">
        <div className="h-8 w-44 rounded bg-white/10 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-[2/3] w-full animate-pulse rounded-lg bg-white/10"
          />
        ))}
      </div>
    </section>
  );
}

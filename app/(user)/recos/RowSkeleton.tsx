export default function RowSkeleton({ title }: { title: string }) {
  return (
    <section className="mb-16 relative z-10">
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
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

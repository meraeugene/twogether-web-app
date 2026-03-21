"use client";

export default function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-28 text-white lg:px-24 xl:px-32">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="h-12 w-3/4 rounded-2xl bg-white/10" />
          <div className="h-4 w-full max-w-2xl rounded-full bg-white/5" />
          <div className="h-4 w-2/3 max-w-xl rounded-full bg-white/5" />
        </div>
        <div className="aspect-video w-full rounded-[2rem] border border-white/10 bg-white/[0.04]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-[1.75rem] border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const pulse = "animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.05]";

export default function ChronoLoading() {
  return (
    <main className="min-h-screen bg-[#040404] px-7 pb-20 pt-28 text-white lg:px-24 xl:px-32 2xl:px-26 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_28%),linear-gradient(135deg,rgba(127,29,29,0.14),transparent_36%),linear-gradient(180deg,#090909_0%,#040404_45%,#020202_100%)]" />
      <div className="relative mx-auto max-w-[1480px] space-y-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="h-9 w-44 animate-pulse rounded-full bg-red-500/15" />
            <div className="h-14 w-full max-w-3xl animate-pulse rounded-3xl bg-white/10" />
            <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-white/10" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:w-[28rem]">
            <div className={`${pulse} h-24`} />
            <div className={`${pulse} h-24`} />
          </div>
        </div>

        <div className={`${pulse} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="space-y-3">
            <div className="h-8 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="h-12 w-48 animate-pulse rounded-full bg-red-500/15" />
          </div>
        </div>

        <div className={`${pulse} overflow-hidden p-5 md:p-8`}>
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="h-7 w-28 animate-pulse rounded-full bg-red-500/15" />
              <div className="h-10 w-72 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-white/10" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>

          <div className="flex min-w-max gap-4 overflow-hidden py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="w-[230px] shrink-0 md:w-[280px]">
                <div className={`${pulse} p-4`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                    <div className="h-8 w-8 animate-pulse rounded-full bg-red-500/15" />
                  </div>
                  <div className="aspect-[2/3] animate-pulse rounded-[1.4rem] bg-white/10" />
                  <div className="mt-4 space-y-3">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

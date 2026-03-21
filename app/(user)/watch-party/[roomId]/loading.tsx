export default function WatchPartyRoomLoading() {
  return (
    <main className="min-h-screen bg-[#050505] px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-34 2xl:px-26">
      <div className="mx-auto animate-pulse">
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <div className="flex gap-3">
              <div className="h-8 w-24 rounded-full bg-white/10" />
              <div className="h-8 w-28 rounded-full bg-red-600/20" />
            </div>
            <div className="mt-4 h-14 w-3/4 rounded-2xl bg-white/10" />
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="h-9 w-32 rounded-md bg-white/10" />
              <div className="h-9 w-28 rounded-md bg-white/10" />
              <div className="h-9 w-28 rounded-md bg-white/10" />
            </div>
          </div>

          <div className="w-full xl:max-w-md">
            <div className="mt-4 h-4 w-40 rounded bg-white/10" />
            <div className="mt-4 h-24 rounded-[24px] bg-white/10" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(430px,500px)] 2xl:grid-cols-[minmax(0,1fr)_450px]">
          <div className="aspect-video rounded-[2rem] bg-white/10 xl:h-[calc(100vh-8rem)] xl:aspect-auto" />
          <div className="min-h-[520px] rounded-[28px] bg-white/10 sm:min-h-[620px] xl:h-[calc(100vh-8rem)]" />
        </div>
      </div>
    </main>
  );
}

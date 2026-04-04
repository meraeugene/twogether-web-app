"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock3, Play } from "lucide-react";
import GlowingOutlineButton from "@/components/ui/GlowingOutlineButton";
import {
  getRecentWatch,
  RECENT_WATCH_UPDATED_EVENT,
  type RecentWatchEntry,
} from "@/utils/recentWatch";

export default function ResumeWatching() {
  const [recentWatch, setRecentWatch] = useState<RecentWatchEntry | null>(null);

  useEffect(() => {
    const syncRecentWatch = () => {
      setRecentWatch(getRecentWatch());
    };

    syncRecentWatch();
    window.addEventListener("storage", syncRecentWatch);
    window.addEventListener(RECENT_WATCH_UPDATED_EVENT, syncRecentWatch);

    return () => {
      window.removeEventListener("storage", syncRecentWatch);
      window.removeEventListener(RECENT_WATCH_UPDATED_EVENT, syncRecentWatch);
    };
  }, []);

  if (!recentWatch) return null;

  return (
    <section className="relative overflow-hidden bg-[#030303] py-14 sm:py-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-64 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#fb2c36_0.9px,transparent_0.9px)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)] md:items-end md:gap-10 xl:flex xl:flex-row xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-400/80">
              Resume Watching
            </p>
            <h2 className="mt-3 max-w-4xl text-4xl font-medium leading-[0.95] tracking-tighter text-white sm:text-5xl md:text-4xl 2xl:text-7xl">
              Pick up where
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                you left off.
              </span>
            </h2>
          </div>

          <p className="max-w-md border-l border-white/10 pl-5 text-sm font-light leading-relaxed text-neutral-400 sm:text-base md:pl-6 md:text-[15px] lg:text-lg">
            Your latest title stays ready on this device, with the same episode
            and server selection.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,44,54,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
            <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[420px]">
              <Image
                src={recentWatch.posterUrl || "/mock.jpg"}
                alt={recentWatch.title}
                fill
                unoptimized
                className="object-cover "
              />
            </div>

            <div className="relative flex flex-col justify-between gap-8 p-6 sm:p-8 md:p-10 lg:p-12">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 md:mb-10 rounded-full border border-red-500/30 bg-red-500/5 backdrop-blur-md">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-red-400 uppercase">
                    {recentWatch.type === "tv"
                      ? "Series Resume"
                      : "Movie Resume"}
                  </span>
                </div>

                <h3 className="max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {recentWatch.title}
                </h3>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/45 sm:text-sm">
                  {recentWatch.year ? <span>{recentWatch.year}</span> : null}
                  <span className="rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-red-400 uppercase">
                    {recentWatch.type}
                  </span>
                  {recentWatch.type === "tv" &&
                  recentWatch.season &&
                  recentWatch.episode ? (
                    <span className="rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-red-400 uppercase">
                      S{recentWatch.season} E{recentWatch.episode}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-6  sm:flex-row sm:items-end flex-wrap sm:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-sm text-white/45">
                    <Clock3 className="h-4 w-4 text-white/35" />
                    Last opened{" "}
                    {new Date(recentWatch.updatedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>

                  <p className="max-w-md text-sm leading-relaxed text-white/35">
                    Resume your latest stream instantly and jump back into the
                    story without searching again.
                  </p>
                </div>

                <GlowingOutlineButton
                  href={recentWatch.href}
                  className="self-start sm:self-auto"
                  contentClassName="gap-3 px-6 py-3"
                  leadingIcon={<Play size={18} fill="currentColor" />}
                  trailingIcon={false}
                >
                  Resume Now
                </GlowingOutlineButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

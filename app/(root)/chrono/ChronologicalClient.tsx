"use client";

import useSWR from "swr";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineFieldTime } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { FRANCHISE_GROUPS } from "./data";
import { Recommendation } from "@/types/recommendation";
import { FaPlay } from "react-icons/fa";
import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getSlugFromTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function ChronologicalClient() {
  const [selectedFranchise, setSelectedFranchise] = useState<string>(
    "marvel-cinematic-universe",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoMoving, setIsAutoMoving] = useState(true);
  const routeViewportRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const { data, error, isLoading } = useSWR<{
    name: string;
    movies: Recommendation[];
  }>(`/api/tmdb/chronological?franchise=${selectedFranchise}`, fetcher);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const groupedFranchiseCount = useMemo(
    () =>
      FRANCHISE_GROUPS.reduce((total, group) => total + group.items.length, 0),
    [],
  );

  useEffect(() => {
    const viewport = routeViewportRef.current;

    if (!viewport || !isAutoMoving) return;

    let frameId = 0;
    let lastTimestamp = 0;
    const speed = 80;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

      if (maxScrollLeft <= 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const nextLeft = viewport.scrollLeft + speed * deltaSeconds;

      if (nextLeft >= maxScrollLeft) {
        viewport.scrollLeft = 0;
      } else {
        viewport.scrollLeft = nextLeft;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [data, isAutoMoving]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/30 border-t-white" />
      </div>
    );
  }

  if (error || !data) return <ErrorMessage />;

  const handleWatchNow = (movie: Recommendation) => {
    const slug = getSlugFromTitle(movie.title);
    if (movie.is_tmdb_recommendation && movie.recommended_by?.id === "tmdb") {
      router.push(`/tmdb/watch/${movie.type}/${movie.tmdb_id}/${slug}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404]  pb-20  pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)] sm:px-7 ">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_28%),linear-gradient(135deg,rgba(127,29,29,0.14),transparent_36%),linear-gradient(180deg,#090909_0%,#040404_45%,#020202_100%)]" />

      <div className="pointer-events-none hidden lg:block absolute inset-x-0 top-26 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <section className="relative mx-auto max-w-[1480px]">
        <div className="mb-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-red-100/80">
              Chronological Route
            </span>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              {data.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              Follow every chapter from the earliest story point to the final
              release.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-white/60 sm:grid-cols-2 xl:max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                Franchise
              </div>
              <div className="mt-2 text-sm font-medium text-white/90">
                {groupedFranchiseCount} routes
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                Sequence
              </div>
              <div className="mt-2 text-sm font-medium text-white/90">
                {data.movies.length} connected stops
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/45">
              Start to End
            </span>
            <p className="text-sm text-white/55">
              The route can auto-move in the background, and you can stop it
              anytime while keeping the scrollbar hidden.
            </p>
          </div>

          <div className="chrono-scroll flex shrink-0 items-center gap-3 overflow-x-auto flex-col md:flex-row pb-1">
            <button
              onClick={() => setIsAutoMoving((current) => !current)}
              className="inline-flex flex-none cursor-pointer items-center justify-center gap-3 self-start rounded-full border border-white/10 w-full md:w-fit bg-white/[0.04] px-5 py-3 text-sm font-semibold whitespace-nowrap text-white transition duration-300 hover:bg-white/[0.08]"
            >
              {isAutoMoving ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isAutoMoving ? "Stop the Journey" : "Begin the Journey"}
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex flex-none cursor-pointer items-center justify-center w-full md:w-fit gap-3 self-start rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold whitespace-nowrap text-white transition duration-300 hover:border-red-400/40 hover:bg-red-500/15"
            >
              <AiOutlineFieldTime className="h-5 w-5 text-red-300" />
              Explore Another Saga
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(248,113,113,0.08),transparent_24%)]" />

          <div className="relative z-10 mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-red-100/80">
                  Story Map
                </span>
                <span className="text-xs uppercase tracking-[0.24em] text-white/35">
                  {data.movies.length} entries
                </span>
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                {data.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                Each card is positioned as a route stop, alternating above and
                below the path to make the chronology easy to scan at a glance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/45">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                Beginning
              </span>
              <span className="h-px w-10 bg-gradient-to-r from-red-400/60 to-transparent" />
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                Finale
              </span>
            </div>
          </div>

          <div
            ref={routeViewportRef}
            className="chrono-scroll relative z-10 overflow-x-auto overflow-y-hidden pb-4"
          >
            <div className="relative min-w-max px-2 py-4 md:px-4 md:py-8">
              <div className="pointer-events-none absolute left-0 right-0 top-[8.2rem] h-px bg-gradient-to-r from-red-400/0 via-red-400/35 to-red-400/0" />
              <div className="pointer-events-none absolute left-6 top-[8.2rem] h-3 w-3 -translate-y-1/2 rounded-full border border-red-300/50 bg-[#050505] shadow-[0_0_18px_rgba(248,113,113,0.35)]" />
              <div className="pointer-events-none absolute right-6 top-[8.2rem] h-3 w-3 -translate-y-1/2 rounded-full border border-red-300/50 bg-[#050505] shadow-[0_0_18px_rgba(248,113,113,0.35)]" />

              <div className="flex min-w-max items-start gap-4 md:gap-0">
                {data.movies.map((movie, index) => {
                  const isEven = index % 2 === 0;
                  const isFirst = index === 0;
                  const isLast = index === data.movies.length - 1;

                  return (
                    <div
                      key={`${movie.tmdb_id}-${movie.type}-${index}`}
                      className="relative flex items-start md:items-stretch"
                    >
                      <div
                        className={`w-[230px] shrink-0 md:w-[280px] ${
                          isEven ? "md:translate-y-0" : "md:translate-y-28"
                        }`}
                      >
                        <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.28)] transition duration-300 hover:border-white/15">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/38">
                              {isFirst
                                ? "Start"
                                : isLast
                                  ? "Finale"
                                  : `Stop ${index + 1}`}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-[10px] font-semibold text-red-100/80">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="group relative">
                            <div className="relative overflow-hidden rounded-[1.4rem] bg-[#141414]">
                              <Image
                                src={
                                  movie.poster_url?.startsWith("http")
                                    ? movie.poster_url
                                    : `https://image.tmdb.org/t/p/w500${movie.poster_url}`
                                }
                                alt={movie.title}
                                unoptimized
                                width={500}
                                height={750}
                                className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-50"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                              <div className="absolute inset-0 hidden items-center justify-center opacity-0 transition duration-300 group-hover:flex group-hover:opacity-100">
                                <button
                                  onClick={() => handleWatchNow(movie)}
                                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_35px_rgba(239,68,68,0.45)] transition duration-300 hover:scale-110 hover:bg-red-600"
                                >
                                  <FaPlay className="text-lg" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h3 className="text-lg font-semibold leading-snug text-white">
                                {movie.title}
                              </h3>

                              {(movie.year || movie.duration) && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/60">
                                  {movie.year && (
                                    <span className="text-white/80">
                                      {movie.year}
                                    </span>
                                  )}
                                  {movie.year && movie.duration && (
                                    <span className="text-white/35">|</span>
                                  )}
                                  {movie.duration && (
                                    <span>{movie.duration} min</span>
                                  )}
                                </div>
                              )}

                              {movie.comment && (
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/58">
                                  {movie.comment}
                                </p>
                              )}

                              <button
                                onClick={() => handleWatchNow(movie)}
                                className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:border-red-400/40 hover:bg-red-500/15 md:hidden"
                              >
                                <FaPlay className="text-xs" />
                                Watch Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="pointer-events-none relative w-24 shrink-0">
                          <div className="absolute left-0 top-[8.15rem] h-px w-24 bg-gradient-to-r from-red-400/45 to-red-300/15" />
                          <div
                            className={`absolute left-1/2 top-[8.15rem] w-px bg-gradient-to-b from-red-400/40 to-transparent ${
                              isEven ? "h-28" : "-translate-y-28 h-28"
                            }`}
                          />
                          <div className="absolute left-1/2 top-[8.15rem] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-300/70 shadow-[0_0_18px_rgba(248,113,113,0.45)]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto border-l border-white/10 bg-[#090909]/95 p-6 text-white md:left-auto md:w-[430px]"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.26em] text-white/35">
                    Franchise Switcher
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Chronological Movies
                  </h2>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
                >
                  <IoClose className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-5">
                {FRANCHISE_GROUPS.map(({ genre, items }) => (
                  <div key={genre} className="space-y-3">
                    <div className="px-1 text-[11px] uppercase tracking-[0.24em] text-white/40">
                      {genre}
                    </div>
                    <div className="space-y-2">
                      {items.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedFranchise(key);
                            setIsOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm font-semibold tracking-wide transition duration-300 ${
                            selectedFranchise === key
                              ? "border-white/20 bg-white text-black"
                              : "border-white/10 bg-white/[0.04] text-white/88 hover:bg-white/[0.08]"
                          }`}
                        >
                          <span>{label}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              selectedFranchise === key
                                ? "bg-black"
                                : "bg-red-400/70"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

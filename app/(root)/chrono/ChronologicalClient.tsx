"use client";

import useSWR from "swr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineFieldTime } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { FRANCHISE_GROUPS } from "./data";
import { Recommendation } from "@/types/recommendation";
import { FaPlay } from "react-icons/fa";
import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import ChronoSkeleton from "./ChronoSkeleton";
import ChronoConnector from "./ChronoConnector";
import styles from "./chrono.module.css";

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
  }>(`/api/tmdb/chronological?franchise=${selectedFranchise}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
      event.preventDefault();
      setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const viewport = routeViewportRef.current;

    if (!viewport || !isAutoMoving) return;

    let frameId = 0;
    let lastTimestamp = 0;
    let currentLeft = viewport.scrollLeft;
    let maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    let isVisible = false;
    const speed = 40;

    const updateBounds = () => {
      maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      currentLeft = Math.min(viewport.scrollLeft, maxScrollLeft);
    };

    const tick = (timestamp: number) => {
      frameId = 0;

      if (!isVisible || document.hidden) {
        lastTimestamp = timestamp;
        return;
      }

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      if (maxScrollLeft <= 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      currentLeft += speed * deltaSeconds;

      if (currentLeft >= maxScrollLeft) {
        currentLeft = 0;
        viewport.scrollLeft = 0;
      } else {
        viewport.scrollLeft = currentLeft;
      }

      frameId = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (!frameId && isVisible && !document.hidden) {
        lastTimestamp = 0;
        frameId = requestAnimationFrame(tick);
      }
    };

    const stopAnimation = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startAnimation();
        else stopAnimation();
      },
      { threshold: 0.01 },
    );
    const resizeObserver = new ResizeObserver(updateBounds);

    intersectionObserver.observe(viewport);
    resizeObserver.observe(viewport);
    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopAnimation();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [data, isAutoMoving]);

  if (isLoading) {
    return <ChronoSkeleton />;
  }

  if (error || !data) return <ErrorMessage />;

  const handleWatchNow = (movie: Recommendation) => {
    const slug = getSlugFromTitle(movie.title);
    if (movie.is_tmdb_recommendation && movie.recommended_by?.id === "tmdb") {
      router.push(`/tmdb/watch/${movie.type}/${movie.tmdb_id}/${slug}`, { scroll: false });
    }
  };

  return (
    <div className="page-gutter page-listing relative min-h-screen overflow-hidden bg-[#040404]  pb-20  pt-28 px-7 text-white font-[family-name:var(--font-geist-sans)] sm:px-7 ">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_28%),linear-gradient(135deg,rgba(127,29,29,0.14),transparent_36%),linear-gradient(180deg,#090909_0%,#040404_45%,#020202_100%)]" />

      <section className="page-width relative mx-auto max-w-[1480px]">
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
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              {data.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              Follow the story in chronological order.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoMoving((current) => !current)}
              aria-pressed={!isAutoMoving}
              className="glass-control inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {isAutoMoving ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {isAutoMoving ? "Stop the Journey" : "Begin the Journey"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="glass-control inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-red-400/40 hover:bg-red-500/15"
            >
              <AiOutlineFieldTime className="h-5 w-5 text-red-300" aria-hidden="true" />
              Explore Another Saga
            </button>
          </div>
        </div>

        <div
          ref={routeViewportRef}
          role="region"
          aria-label="Chronological story timeline"
          tabIndex={0}
          onPointerDown={() => setIsAutoMoving(false)}
          onFocusCapture={() => setIsAutoMoving(false)}
          className="chrono-scroll relative z-10 overflow-x-auto overflow-y-hidden pb-4 [contain:layout_paint] [will-change:scroll-position]"
        >
          <div className={styles.track}>
            <div className={styles.row}>
              {data.movies.map((movie, index) => {
                const isEven = index % 2 === 0;
                const isFirst = index === 0;
                const isLast = index === data.movies.length - 1;

                return (
                  <div
                    key={`${movie.tmdb_id}-${movie.type}-${index}`}
                    className={styles.stop}
                  >
                    <div
                      className={`${styles.item} ${isEven ? "" : styles.staggered}`}
                    >
                      <div className={`${styles.card} glass-surface rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[0_16px_50px_rgba(0,0,0,0.28)] transition duration-300 hover:border-white/15`}>
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
                              width={500}
                              height={750}
                              sizes="(min-width: 1536px) 326px, (min-width: 1280px) 306px, (min-width: 768px) 286px, (max-width: 414px) calc(82vw - 30px), 310px"
                              quality={72}
                              className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-50"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 via-45% to-transparent" />

                            <div className="absolute inset-0 hidden items-center justify-center opacity-0 transition duration-300 group-hover:flex group-hover:opacity-100">
                              <button
                                onClick={() => handleWatchNow(movie)}
                                aria-label={`Watch ${movie.title}`}
                                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_35px_rgba(239,68,68,0.45)] transition duration-300 hover:scale-110 hover:bg-red-600"
                              >
                                <FaPlay className="text-lg" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h3 className={`${styles.title} font-semibold text-white`}>
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

                    {!isLast && <ChronoConnector descending={isEven} />}
                  </div>
                );
              })}
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
                          aria-pressed={selectedFranchise === key}
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

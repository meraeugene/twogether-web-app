"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { createPortal } from "react-dom";
import { Play, X, Clock, Calendar } from "lucide-react";

import { Recommendation } from "@/types/recommendation";
import {
  deleteRecommendation,
  toggleRecommendationVisibility,
} from "@/actions/recommendationActions";
import ConfirmModal from "@/components/ConfirmModal";
import { removeFromWatchlist } from "@/actions/watchlistActions";
import { PrivacyModal } from "./PrivacyModal";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import { MdDelete } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import Link from "next/link";
import { VisualHeartRating } from "./VisualHeartRating";

type MyRecosCache = {
  public: Recommendation[];
  private: Recommendation[];
};

// ─── Main ─────────────────────────────────────────────────────────────────────
function FilmCard({
  item,
  userId,
  isDeleteRecommendation,
  isRemoveFromWatchlist,
  watchlistItemId,
}: {
  item: Recommendation;
  isDeleteRecommendation?: boolean;
  isRemoveFromWatchlist?: boolean;
  userId?: string;
  watchlistItemId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isUpdatingPrivacy, startPrivacyTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cast">("overview");
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCinemaOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    if (cinemaOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [cinemaOpen]);

  const openCinema = () => {
    setActiveTab("overview");
    setCinemaOpen(true);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => setIsHovered(false);

  const handleOverlayMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleOverlayMouseLeave = () => {
    setCinemaOpen(false);
    setIsHovered(false);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    setIsVisible(false);
    startTransition(async () => {
      try {
        if (isDeleteRecommendation) {
          mutate<Recommendation[]>(
            "/api/recos",
            (current) =>
              current?.filter(
                (reco) => reco.recommendation_id !== item.recommendation_id,
              ),
            false,
          );
          mutate<MyRecosCache>(
            "/api/my-recos",
            (current) =>
              current
                ? {
                    ...current,
                    public: current.public.filter(
                      (reco) =>
                        reco.recommendation_id !== item.recommendation_id,
                    ),
                    private: current.private.filter(
                      (reco) =>
                        reco.recommendation_id !== item.recommendation_id,
                    ),
                  }
                : current,
            false,
          );

          await deleteRecommendation(userId!, item.recommendation_id);
          mutate("/api/recos"); // Refresh recommendations cache
          mutate("/api/my-recos"); // Refresh my recommendations cache
        } else if (isRemoveFromWatchlist && watchlistItemId) {
          await removeFromWatchlist(watchlistItemId, userId!);
          mutate("/api/my-watchlist"); // Refresh watchlist cache
        }
      } catch {
        // Roll back local hide if the action fails.
        setIsVisible(true);
      }
    });
  };

  const handleVisibilityChange = (newVisibility: "public" | "private") => {
    startPrivacyTransition(async () => {
      await toggleRecommendationVisibility(
        userId!,
        item.recommendation_id,
        newVisibility,
      );
      mutate("/api/my-recos"); // Refresh my recommendations cache
      setShowPrivacyModal(false);
    });
  };

  const handleClick = () => {
    const slug = getSlugFromTitle(item.title);

    if (item.generated_by_ai && item.recommended_by.id === "ai-generated") {
      router.push(`/ai-recommend/watch/${item.tmdb_id}/${slug}`);
      return;
    }

    if (item.is_tmdb_recommendation && item.recommended_by.id === "tmdb") {
      router.push(`/tmdb/watch/${item.type}/${item.tmdb_id}/${slug}`);
      return;
    }

    if (item.recommendation_id) {
      router.push(`/watch/${item.tmdb_id}/${slug}`);
      return;
    }
  };

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.07 * i, duration: 0.28 },
  });

  const trailerUrl = item.trailer_key
    ? `https://www.youtube.com/embed/${item.trailer_key}?autoplay=1&mute=0&controls=0&loop=1&playlist=${item.trailer_key}&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&vq=hd1080`
    : null;
  const runtimeLabel =
    item.type === "movie"
      ? item.duration
        ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m`
        : null
      : item.duration
        ? `${item.duration}m / ep`
        : item.seasons
          ? `S${item.seasons}`
          : null;

  const cinemaOverlay =
    cinemaOpen && typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="cinema"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-9999 flex flex-col overflow-hidden"
              style={{
                background: "#06030a",
              }}
              onMouseEnter={handleOverlayMouseEnter}
              onMouseLeave={handleOverlayMouseLeave}
            >
              {/* ══════════════════════════════════════════
                  FULLSCREEN TRAILER  (flex-1 = fills all remaining height)
              ══════════════════════════════════════════ */}
              <div className="relative w-full flex-1/2 md:flex-1 bg-[#06030a] overflow-hidden flex items-center justify-center ">
                {trailerUrl ? (
                  <div className="relative w-full aspect-[9/12] md:aspect-video z-10 transition-all duration-700 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                    {/* The Video Container with "Zoomed-Out" Letterbox Feel */}
                    <div className="absolute inset-0 overflow-hidden">
                      <iframe
                        loading="eager"
                        src={`${trailerUrl}&controls=0&modestbranding=1&rel=0`}
                        className="w-[150%] h-[110%] ml-[-25%] mt-[-5%] lg:mt-[0%]  md:w-full md:h-[100%] md:ml-0  pointer-events-none "
                        allow="autoplay; encrypted-media; fullscreen"
                        title=""
                      />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.poster_url || ""}
                    alt={item.title}
                    fill
                    className="object-cover brightness-50"
                  />
                )}

                {/* ── Cinema Overlays ── */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  {/* Deep Vertical Vignette */}
                  <div className="md:block absolute hidden  inset-y-0 left-0 w-32 bg-gradient-to-r from-[#06030a] to-transparent" />
                  <div className="md:block absolute hidden  inset-y-0 right-0 w-32 bg-gradient-to-l from-[#06030a] to-transparent" />

                  {/* Bottom Title Fade */}
                  <div className="md:block absolute hidden bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#06030a] via-[#06030a]/40 to-transparent" />
                </div>

                {/* ── Title block ── */}

                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10] }}
                  transition={{
                    duration: 4, // total timeline
                    times: [0, 0.15, 0.9, 1], // control phases
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-30 pointer-events-none max-w-xs md:max-w-full w-full  "
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium">
                      Trailer Preview
                    </span>

                    <h1
                      className="text-white font-black italic uppercase tracking-tighter"
                      style={{
                        fontSize: "clamp(1.3rem,3vw,4rem)",
                        lineHeight: "1.1",
                        filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))",
                      }}
                    >
                      {item.title}
                    </h1>
                  </div>
                </motion.div>

                {/* Close Button (Modern Minimalist) */}

                <button
                  onClick={() => setCinemaOpen(false)}
                  className="absolute cursor-pointer top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-3 group"
                >
                  <span className="text-[9px] hidden lg:block tracking-wider uppercase text-white/40">
                    ESC
                  </span>

                  <div className="flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all group-hover:scale-110 group-hover:bg-white/10">
                    <X
                      size={18}
                      className="text-white/70 group-hover:text-white"
                    />
                  </div>
                </button>
              </div>

              {/* ══════════════════════════════════════════
                  INFO PANEL  (fixed height, no scroll)
              ══════════════════════════════════════════ */}
              <div
                className="shrink-0 w-full flex flex-col pb-12 lg:pb-8  items-center justify-center relative"
                style={{ minHeight: 230, background: "#040404" }}
              >
                {/* Radar Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
    w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px]
    bg-[radial-gradient(circle,rgba(220,38,38,0.03)_0%,transparent_70%)]"
                  />
                </div>

                <div className="w-full md:max-w-3xl lg:max-w-4xl flex flex-col items-center justify-center px-4 sm:px-6 relative z-10">
                  {/* HEADER SECTION */}
                  <div className="w-full flex  items-center justify-center gap-3 md:gap-6 mb-6">
                    {/* LEFT — YEAR */}
                    <motion.div
                      {...stagger(0)}
                      className="flex items-center gap-4 lg:flex-1 lg:justify-end"
                    >
                      <div className="flex flex-col items-center lg:items-end">
                        <span className="text-[10px] hidden md:block sm:text-[10px] font-black text-red-600 uppercase tracking-[0.25em] mb-1">
                          Year
                        </span>

                        <div className="flex items-center gap-2">
                          <Calendar size={10} className="text-white/60" />
                          <span className="text-[10px] sm:text-[14px] font-mono text-white/60">
                            {item.year}
                          </span>
                        </div>
                      </div>

                      <div className=" h-8 w-px bg-white/15 rotate-[20deg]" />
                    </motion.div>

                    {/* MOBILE — GENRES */}
                    <motion.div
                      {...stagger(0)}
                      className="flex flex-wrap md:hidden items-center justify-center gap-3 sm:gap-4"
                    >
                      <div className=" h-[1px] w-3 bg-red-600/30" />

                      <div className="flex flex-wrap justify-center gap-3">
                        {item.genres.slice(0, 1).map((g) => (
                          <span
                            key={g}
                            className="text-[8px] sm:text-[11px] font-black text-red-600 uppercase tracking-[0.3em]
              drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      <div className="h-[1px] w-3  bg-red-600/30" />
                    </motion.div>

                    {/* DESKTOP — GENRES */}
                    <motion.div
                      {...stagger(0)}
                      className="md:flex flex-wrap hidden items-center justify-center gap-3 sm:gap-4"
                    >
                      <div className=" h-[1px] w-6 bg-red-600/30" />

                      <div className="flex flex-wrap justify-center gap-3">
                        {item.genres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[8px] sm:text-[11px] font-black text-red-600 uppercase tracking-[0.3em]
              drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      <div className="h-[1px] w-6 bg-red-600/30" />
                    </motion.div>

                    {/* RIGHT — RUNTIME */}
                    <motion.div
                      {...stagger(0)}
                      className="flex items-center gap-4 lg:flex-1 lg:justify-start"
                    >
                      <div className="h-8 w-px bg-white/15 rotate-[20deg]" />

                      <div className="flex flex-col items-center lg:items-start">
                        <span className="text-[10px] hidden md:block sm:text-[10px] font-black text-red-600 uppercase tracking-[0.25em] mb-1">
                          Duration
                        </span>

                        <div className="flex items-center gap-2">
                          <Clock size={10} className="text-white/60" />
                          <span className="text-[10px] sm:text-[14px] font-mono text-white/60">
                            {runtimeLabel}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* SYNOPSIS */}
                  <div className="w-full mb-6 sm:mb-8 min-h-[44px]">
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.p
                          key="ov"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[12px] sm:text-[15px] leading-relaxed text-center
            text-white/60 max-w-sm md:max-w-lg mx-auto  line-clamp-2"
                        >
                          {item.synopsis}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* WATCH BUTTON */}
                  <motion.div
                    {...stagger(2)}
                    className="flex items-center gap-4 w-full justify-center"
                  >
                    <button
                      onClick={handleClick}
                      className="relative group h-12 sm:h-14 px-8 sm:px-12
        flex items-center gap-4 sm:gap-6
        bg-red-600/5 border border-red-600/30
        transition-colors cursor-pointer overflow-hidden"
                    >
                      {/* Laser Sweep */}
                      <div
                        className="absolute inset-y-0 left-0 w-px bg-red-600 shadow-[0_0_12px_red]
        -translate-x-full group-hover:translate-x-[350px] sm:group-hover:translate-x-[420px]
        transition-transform duration-1000 ease-in-out"
                      />

                      <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                        {/* Animated Bars */}
                        <div className="flex gap-1 items-end h-3">
                          {[0.1, 0.2, 0.3].map((delay, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [3, 12, 3] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                delay,
                              }}
                              className="w-[2px] bg-red-600"
                            />
                          ))}
                        </div>

                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-white/90">
                          Watch Now
                        </span>

                        <Play
                          size={12}
                          fill="currentColor"
                          className="text-red-600 ml-1"
                        />
                      </div>
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  if (!isVisible) return null;

  // ─── Card (poster) ────────────────────────────────────────────────────────
  return (
    <>
      <div
        ref={cardRef}
        onClick={openCinema}
        className="relative w-full font-(family-name:--font-geist-sans) group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AnimatePresence>
          {isVisible && (
            <motion.div layout className="w-full">
              <div className="relative aspect-2/3 w-full overflow-hidden rounded-md bg-[#141414] shadow-md cursor-pointer">
                <Image
                  src={item.poster_url || "/placeholder.jpg"}
                  alt={item.title}
                  fill
                  className={`object-cover transition-all duration-300 ${
                    isHovered ? "opacity-50 scale-105" : "opacity-100 scale-100"
                  }`}
                  sizes="(max-width: 768px) 50vw, 20vw"
                />

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center "
                      style={{
                        background:
                          "linear-gradient(to top, rgba(100,0,0,0.8) 0%, transparent 60%)",
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full  cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCinema();
                        }}
                        style={{
                          width: 52,
                          height: 52,
                          background: "rgba(220,38,38,0.9)",
                          boxShadow: "0 0 30px rgba(220,38,38,0.55)",
                        }}
                      >
                        <Play
                          size={18}
                          fill="white"
                          strokeWidth={0}
                          className="ml-0.5"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-4 mb-3">
                <div className="text-base font-semibold  ">{item.title}</div>

                <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-white/60 mt-1">
                  <span className="flex items-center gap-2">
                    <span className="text-white/80">{item.year}</span>

                    {item.type === "tv" ? (
                      <span className="text-white/50 font-medium">
                        S{item.seasons || 1} · {item.episodes || 1}EPS
                      </span>
                    ) : (
                      item.duration !== 0 && (
                        <span className="text-white/50 font-medium">
                          {item.duration}m
                        </span>
                      )
                    )}
                  </span>

                  <span className="bg-gray-700 rounded-sm px-2 py-1 text-xs capitalize">
                    {item.type}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isVisible && userId && isDeleteRecommendation && (
          <div
            className="absolute top-4 right-4 z-30 
                    -translate-y-4 opacity-0 
                    group-hover:translate-y-0 group-hover:opacity-100 
                    transition-all duration-500 ease-out"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              disabled={isPending}
              className="px-3 py-1 flex cursor-pointer items-center gap-1 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
            >
              <MdDelete className="text-base" />
              {isPending ? "Deleting..." : "Delete Recommendation"}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPrivacyModal(true);
              }}
              className="mt-2 w-full cursor-pointer px-3 py-1 flex items-center gap-2 text-xs rounded-full 
  bg-white/10 border border-white/20 
  hover:bg-white/20 hover:border-white/40
  text-white hover:text-white
  backdrop-blur-sm
  transition"
            >
              <FaLock className="text-xs opacity-80" />
              <span>Edit Privacy</span>
            </button>
          </div>
        )}

        {isVisible && userId && isRemoveFromWatchlist && (
          <div
            className="absolute top-4 right-4 z-30 
                    -translate-y-4 opacity-0 
                    group-hover:translate-y-0 group-hover:opacity-100 
                    transition-all duration-500 ease-out"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              disabled={isPending}
              className="px-3 py-1 flex cursor-pointer items-center gap-1 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
            >
              <MdDelete className="text-base" />
              {isPending ? "Removing..." : "Remove from Watchlist"}
            </button>
          </div>
        )}

        {/* Mobile action buttons - Delete & Privacy */}
        {isVisible && userId && isDeleteRecommendation && (
          <div className="lg:hidden flex gap-3 mt-4 ">
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              disabled={isPending}
              className="flex-1 p-2 rounded-md flex items-center justify-center
    text-white/90 bg-red-500/20 hover:bg-red-600/30 transition-all
    backdrop-blur border border-red-400/40 shadow-md disabled:opacity-60"
              title="Delete Recommendation"
            >
              <MdDelete className="text-base" />
            </button>

            {/* Privacy Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPrivacyModal(true);
              }}
              className="flex-1 p-2 rounded-md flex items-center justify-center 
      text-white/90 bg-white/10 hover:bg-white/20 transition-all 
      backdrop-blur border border-white/20 shadow-sm"
              title="Edit Privacy"
            >
              <FaLock className="text-sm" />
            </button>
          </div>
        )}

        {isVisible && userId && isRemoveFromWatchlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            disabled={isPending}
            className="mt-4  lg:hidden w-full   gap-2 rounded-md 
       px-1 py-2 text-xs font-medium  
       hover:text-red-200 font-[family-name:var(--font-geist-mono)] 
       disabled:cursor-not-allowed 
      text-white/90 bg-red-500/20  hover:bg-red-600/30 transition-all
    backdrop-blur border border-red-400/40 shadow-md disabled:opacity-60"
          >
            {isPending ? "Removing..." : "Remove from Watchlist"}
          </button>
        )}

        {isVisible && item.recommendation_id && item.comment && (
          <p className="text-sm text-white/80 border-l-4 border-red-500 pl-2 my-3 italic">
            &quot;{item.comment}&quot;
          </p>
        )}

        {isVisible && item.rating && <VisualHeartRating value={item.rating} />}

        {isVisible && item.recommended_by.username && (
          <div className=" mt-3 ">
            <Link
              prefetch
              href={`/profile/${item.recommended_by.username}/${item.recommended_by.id}`}
              className=" text-sm text-white/60 hover:underline flex items-center gap-2"
            >
              {item.recommended_by.avatar_url && (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={item.recommended_by.avatar_url}
                    alt={item.recommended_by.username}
                    width={24}
                    unoptimized
                    height={24}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              {item.generated_by_ai
                ? "AI Assistant"
                : item.recommended_by.username}
            </Link>
          </div>
        )}
      </div>

      {cinemaOverlay}

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title={`Remove ${item.title}?`}
        description="Are you sure you want to remove this from your list?"
        confirmText="Remove"
        loading={isPending}
      />

      <PrivacyModal
        open={showPrivacyModal}
        currentVisibility={item.visibility || "public"}
        onClose={() => setShowPrivacyModal(false)}
        onChange={handleVisibilityChange}
        loading={isUpdatingPrivacy}
      />
    </>
  );
}

export default React.memo(FilmCard);

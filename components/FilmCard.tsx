"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { createPortal } from "react-dom";
import {
  Play,
  Plus,
  Trash2,
  ChevronDown,
  X,
  Clock,
  Calendar,
  Tv2,
} from "lucide-react";

import { Recommendation } from "@/types/recommendation";
import {
  deleteRecommendation,
  toggleRecommendationVisibility,
} from "@/actions/recommendationActions";
import ConfirmModal from "@/components/ConfirmModal";
import { removeFromWatchlist } from "@/actions/watchlistActions";
import { PrivacyModal } from "./PrivacyModal";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({
  children,
  glow,
}: {
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide select-none"
      style={{
        background: glow ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.07)",
        border: glow
          ? "1px solid rgba(220,38,38,0.45)"
          : "1px solid rgba(255,255,255,0.12)",
        color: glow ? "#fca5a5" : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FilmCard({
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
  const [hoverProgress, setHoverProgress] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const openCinema = () => {
    setActiveTab("overview");
    setCinemaOpen(true);
  };

  const HOVER_OPEN_DELAY = 1000;

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoverProgress(true);
    hoverTimer.current = setTimeout(() => {
      setHoverProgress(false);
      openCinema();
    }, HOVER_OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoverProgress(false);

    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setCinemaOpen(false), 150);
  };
  const handleOverlayMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  const handleOverlayMouseLeave = () => {
    setCinemaOpen(false);
    setIsHovered(false);
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCinemaOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const confirmDelete = () => {
    setShowConfirm(false);
    setIsVisible(false);
    setCinemaOpen(false);
    startTransition(async () => {
      if (isDeleteRecommendation) {
        await deleteRecommendation(userId!, item.recommendation_id);
        mutate("/api/recos");
      } else if (isRemoveFromWatchlist && watchlistItemId) {
        await removeFromWatchlist(watchlistItemId, userId!);
        mutate("/api/my-watchlist");
      }
    });
  };

  const handleVisibilityChange = (v: "public" | "private") => {
    startPrivacyTransition(async () => {
      await toggleRecommendationVisibility(userId!, item.recommendation_id, v);
      mutate("/api/my-recos");
      setShowPrivacyModal(false);
    });
  };

  const handleClick = () => {
    const slug = getSlugFromTitle(item.title);
    router.push(
      item.generated_by_ai
        ? `/ai-recommend/watch/${item.tmdb_id}/${slug}`
        : item.is_tmdb_recommendation
          ? `/tmdb/watch/${item.type}/${item.tmdb_id}/${slug}`
          : `/watch/${item.tmdb_id}/${slug}`,
    );
  };

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.07 * i, duration: 0.28 },
  });

  const TABS = ["overview", "cast"] as const;

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
          ? `${item.seasons} Season${item.seasons > 1 ? "s" : ""}`
          : null;

  const synopsis = item.synopsis || item.comment || "No synopsis available.";

  const genres = item.genres?.slice(0, 2) || [];

  const cast = item.cast?.slice(0, 4) || [];

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
              <div className="relative w-full flex-1 bg-black overflow-hidden">
                {trailerUrl ? (
                  /* scale-[1.15] crops YouTube top/bottom chrome */
                  <div className="absolute inset-0 scale-[1.15] origin-center">
                    <iframe
                      loading="eager"
                      src={trailerUrl}
                      className="w-full h-full pointer-events-none"
                      allow="autoplay; encrypted-media; fullscreen"
                      title=""
                    />
                  </div>
                ) : (
                  <Image
                    src={item.poster_url || ""}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}

                {/* ── Overlay layer stack ── */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Solid top bar — kills YouTube title overlay */}
                  <div
                    className="absolute top-0 inset-x-0 bg-[#06030a]"
                    style={{ height: "8%" }}
                  />
                  {/* Solid bottom bar — kills YouTube controls */}
                  <div
                    className="absolute bottom-0 inset-x-0 bg-[#06030a]"
                    style={{ height: "8%" }}
                  />
                  {/* Dark vignette sides */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 35%, rgba(6,3,10,0.75) 100%)",
                    }}
                  />
                  {/* Strong bottom fade → info panel */}
                  <div
                    className="absolute bottom-0 inset-x-0"
                    style={{
                      height: "55%",
                      background:
                        "linear-gradient(to bottom, transparent 0%, rgba(6,3,10,0.6) 50%, #06030a 100%)",
                    }}
                  />
                </div>

                {/* ── Title block — bottom left of video ── */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className=" text-transparent  font-bold tracking-tighter bg-clip-text bg-linear-to-b from-white to-white/40 "
                    style={{
                      fontSize: "clamp(2rem, 4vw, 2.2rem)",
                      textShadow: "0 4px 32px rgba(0,0,0,0.95)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.title}
                  </motion.h1>
                </div>

                {/* Close button */}
                <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
                  <span
                    className="text-[10px] tracking-wider uppercase text-white/40 select-none"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    ESC
                  </span>

                  <button
                    onClick={() => setCinemaOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all duration-200 hover:text-white cursor-pointer"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                    }}
                  >
                    <X size={17} strokeWidth={2.3} />
                  </button>
                </div>
              </div>

              {/* ══════════════════════════════════════════
                  INFO PANEL  (fixed height, no scroll)
              ══════════════════════════════════════════ */}
              <div
                className="shrink-0  w-full flex items-center justify-center"
                style={{ height: 210, background: "#06030a" }}
              >
                <div className="w-full max-w-2xl flex flex-col items-center gap-3 px-6">
                  {/* Row 1 — meta chips */}
                  <motion.div
                    {...stagger(0)}
                    className="flex items-center justify-center gap-2 flex-wrap"
                  >
                    <Chip>
                      <Calendar size={10} />
                      {item.year}
                    </Chip>
                    <Chip>
                      <Tv2 size={10} />
                      {item.type?.toUpperCase()}
                    </Chip>
                    <Chip>
                      <Clock size={10} />
                      {item.duration}m
                    </Chip>
                  </motion.div>

                  {/* Row 2 — tabs + genre pills */}
                  <motion.div
                    {...stagger(1)}
                    className="flex items-center justify-center gap-5 w-full flex-wrap"
                  >
                    {/* Tabs */}
                    <div
                      className="flex border-b"
                      style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                      {TABS.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className="relative px-4 py-1 text-[11px] font-semibold uppercase tracking-widest transition-colors"
                          style={{
                            color:
                              activeTab === tab
                                ? "#f87171"
                                : "rgba(255,255,255,0.28)",
                          }}
                        >
                          {tab}
                          {activeTab === tab && (
                            <motion.div
                              layoutId="tab-line"
                              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                              style={{
                                background:
                                  "linear-gradient(to right, #dc2626, #7f1d1d)",
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Genre pills */}
                    <div className="flex gap-1.5 flex-wrap justify-center">
                      {genres.map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                          style={{
                            background: "rgba(220,30,30,0.08)",
                            border: "1px solid rgba(220,30,30,0.25)",
                            color: "rgba(252,165,165,0.7)",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Row 3 — tab content (fixed height) */}
                  <div className="w-full" style={{ height: 56 }}>
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.div
                          key="ov"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.16 }}
                          className="flex items-center justify-center h-full"
                        >
                          <p
                            className="text-[12.5px] leading-relaxed text-center line-clamp-2 max-w-xl"
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontStyle: "normal",
                            }}
                          >
                            {synopsis}
                          </p>
                        </motion.div>
                      )}

                      {activeTab === "cast" && (
                        <motion.div
                          key="ca"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.16 }}
                          className="flex justify-center gap-6"
                        >
                          {cast.map((m) => (
                            <div
                              key={m.name}
                              className="flex flex-col items-center text-center"
                            >
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                style={{
                                  background: "rgba(255,255,255,0.12)",
                                }}
                              >
                                {/* cast profile image */}
                              </div>

                              <p className="mt-1 text-[10px] text-white/80">
                                {m.name}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Row 4 — actions */}
                  <motion.div
                    {...stagger(2)}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <button
                      onClick={handleClick}
                      className="flex items-center cursor-pointer gap-2 px-6 py-2 rounded-full text-[13px] font-semibold bg-red-500/70 hover:bg-red-500/80 text-white "
                    >
                      <Play size={12} fill="white" strokeWidth={0} />
                      Watch Now
                    </button>

                    <button
                      className="flex h-9 w-9 items-center cursor-pointer justify-center rounded-full text-white/60 transition  hover:text-white"
                      style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <Plus size={15} strokeWidth={2} />
                    </button>

                    {userId && (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition  hover:text-red-400"
                        style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    )}

                    <button
                      onClick={() => setShowPrivacyModal(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition lg:hidden hover:text-white"
                      style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <ChevronDown size={15} strokeWidth={2} />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  // ─── Card (poster) ────────────────────────────────────────────────────────
  return (
    <>
      <div
        ref={cardRef}
        className="relative w-full font-(family-name:--font-geist-sans)"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 10 : 1 }}
      >
        <AnimatePresence mode="popLayout">
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
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(100,0,0,0.8) 0%, transparent 60%)",
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        {hoverProgress && (
                          <svg
                            className="absolute -inset-2 -rotate-90"
                            width="68"
                            height="68"
                            viewBox="0 0 68 68"
                          >
                            <circle
                              cx="34"
                              cy="34"
                              r="30"
                              fill="none"
                              stroke="rgba(255,255,255,0.10)"
                              strokeWidth="2"
                            />
                            <motion.circle
                              cx="34"
                              cy="34"
                              r="30"
                              fill="none"
                              stroke="rgba(248,113,113,0.95)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: HOVER_OPEN_DELAY / 1000,
                                ease: "linear",
                              }}
                            />
                          </svg>
                        )}

                        <div
                          className="flex items-center justify-center rounded-full"
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

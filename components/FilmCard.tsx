"use client";

import { useState, useTransition } from "react";
import { FaPlay } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Recommendation } from "@/types/recommendation";
import {
  deleteRecommendation,
  toggleRecommendationVisibility,
} from "@/actions/recommendationActions";
import ConfirmModal from "@/components/ConfirmModal";
import { removeFromWatchlist } from "@/actions/watchlistActions";
import { PrivacyModal } from "./PrivacyModal";
import { FaLock } from "react-icons/fa";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import { useRouter } from "next/navigation";
import { useTMDBWatch } from "@/stores/useTMDBWatch";
import { VisualHeartRating } from "./VisualHeartRating";
import { mutate } from "swr";

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

  const confirmDelete = () => {
    setShowConfirm(false);
    setIsVisible(false);
    startTransition(async () => {
      if (isDeleteRecommendation) {
        await deleteRecommendation(userId!, item.recommendation_id);
        mutate("/api/recos"); // Refresh recommendations cache
      } else if (isRemoveFromWatchlist && watchlistItemId) {
        await removeFromWatchlist(watchlistItemId, userId!);
        mutate("/api/my-watchlist"); // Refresh watchlist cache
      }
    });
  };

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isUpdatingPrivacy, startPrivacyTransition] = useTransition();

  const handleVisibilityChange = (newVisibility: "public" | "private") => {
    startPrivacyTransition(async () => {
      await toggleRecommendationVisibility(
        userId!,
        item.recommendation_id,
        newVisibility
      );
      mutate("/api/my-recos"); // Refresh my recommendations cache
      setShowPrivacyModal(false);
    });
  };

  const router = useRouter();
  const setCurrentTMDB = useTMDBWatch((s) => s.setCurrentTMDB);

  const handleClick = () => {
    const slug = getSlugFromTitle(item.title);

    if (item.generated_by_ai && item.recommended_by.id === "ai-generated") {
      router.push(`/ai-recommend/watch/${item.tmdb_id}/${slug}`);
      return;
    }

    if (item.is_tmdb_recommendation && item.recommended_by.id === "tmdb") {
      setCurrentTMDB(item);
      router.push(`/tmdb/watch/${item.tmdb_id}/${slug}`);
      return;
    }

    if (item.recommendation_id) {
      router.push(`/watch/${item.tmdb_id}/${slug}`);
      return;
    }
  };

  return (
    <>
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              y: 40,
              skewY: 6,
              filter: "blur(3px)",
            }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            layout
            className="group relative w-full rounded-lg font-[family-name:var(--font-geist-sans)] overflow-hidden shadow-lg"
          >
            <div className="relative aspect-[2/3] w-full">
              {item.poster_url ? (
                <Image
                  src={item.poster_url}
                  alt={item.title}
                  priority
                  fill
                  className="object-cover w-full h-full transition duration-300 group-hover:brightness-50 rounded-lg"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-white/10 text-white text-xs p-2 text-center rounded-lg font-[family-name:var(--font-geist-sans)]">
                  No Image Available
                </div>
              )}

              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/50 ">
                <button
                  onClick={handleClick}
                  className="flex cursor-pointer items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-1 ring-white/10 hover:ring-3 hover:ring-red-100 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  <FaPlay className="text-xl" />
                </button>
              </div>

              {userId && isDeleteRecommendation && (
                <div
                  className="absolute top-4 right-4 z-30 
                    -translate-y-4 opacity-0 
                    group-hover:translate-y-0 group-hover:opacity-100 
                    transition-all duration-500 ease-out"
                >
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isPending}
                    className="px-3 py-1 flex cursor-pointer items-center gap-1 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
                  >
                    <MdDelete className="text-base" />
                    {isPending ? "Deleting..." : "Delete Recommendation"}
                  </button>

                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="mt-2 w-full cursor-pointer px-3 py-1 flex items-center gap-2 text-xs rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 hover:text-white transition"
                  >
                    <FaLock className="text-xs" />
                    <span>Edit Privacy</span>
                  </button>
                </div>
              )}

              {userId && isRemoveFromWatchlist && (
                <div
                  className="absolute top-4 right-4 z-30 
                    -translate-y-4 opacity-0 
                    group-hover:translate-y-0 group-hover:opacity-100 
                    transition-all duration-500 ease-out"
                >
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isPending}
                    className="px-3 py-1 flex cursor-pointer items-center gap-1 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
                  >
                    <MdDelete className="text-base" />
                    {isPending ? "Removing..." : "Remove from Watchlist"}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile action buttons - Delete & Privacy */}
            {userId && isDeleteRecommendation && (
              <div className="lg:hidden flex gap-3 mt-4 ">
                {/* Delete Button */}
                <button
                  onClick={() => setShowConfirm(true)}
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
                  onClick={() => setShowPrivacyModal(true)}
                  className="flex-1 p-2 rounded-md flex items-center justify-center 
      text-white/90 bg-white/10 hover:bg-white/20 transition-all 
      backdrop-blur border border-white/20 shadow-sm"
                  title="Edit Privacy"
                >
                  <FaLock className="text-sm" />
                </button>
              </div>
            )}

            {userId && isRemoveFromWatchlist && (
              <button
                onClick={() => setShowConfirm(true)}
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

            <div className="py-4 text-white ">
              <button
                onClick={handleClick}
                className="w-full cursor-pointer flex items-center gap-3 text-white bg-red-600 hover:bg-red-700 transition p-2 rounded-md font-[family-name:var(--font-geist-mono)] text-sm mt-2 mb-4 lg:hidden"
              >
                <FaPlay className="text-white text-xs" />
                Watch Now
              </button>

              <div className="text-base font-semibold  ">{item.title}</div>

              <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-white/60 mt-1">
                <span className="flex items-center gap-2">
                  <span className="text-white/80">{item.year}</span>

                  {item.type === "tv" ? (
                    <span className="text-white/50 font-medium">
                      S{item.seasons || 1} · {item.episodes || 1}EPS
                    </span>
                  ) : (
                    <span className="text-white/50 font-medium">
                      {item.duration || 0}m
                    </span>
                  )}
                </span>

                <span className="bg-gray-700 rounded-sm px-2 py-1 text-xs capitalize">
                  {item.type}
                </span>
              </div>

              {item.recommendation_id && item.comment && (
                <p className="text-sm text-white/80 border-l-4 border-red-500 pl-2 my-3 italic">
                  &quot;{item.comment}&quot;
                </p>
              )}

              {item.rating && <VisualHeartRating value={item.rating} />}

              {item.recommended_by.username && (
                <div className=" mt-3 ">
                  <Link
                    href={`/profile/${item.recommended_by.username}/${item.recommended_by.id}`}
                    className=" text-sm text-white/60 hover:underline flex items-center gap-2"
                  >
                    {item.recommended_by.avatar_url && (
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={item.recommended_by.avatar_url}
                          alt={item.recommended_by.username}
                          width={24}
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
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title={
          isDeleteRecommendation
            ? `Delete "${item.title}" recommendation?`
            : `Remove "${item.title}" from Watchlist?`
        }
        description={
          isDeleteRecommendation
            ? "This recommendation will no longer appear on your profile or others' feeds."
            : "It will be removed from your watchlist, but you can add it again later."
        }
        confirmText={isDeleteRecommendation ? "Delete" : "Remove"}
        cancelText="Cancel"
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

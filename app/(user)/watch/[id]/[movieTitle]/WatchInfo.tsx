"use client";

import { Recommendation } from "@/types/recommendation";
import ToggleWatchlistButton from "@/app/(user)/watch/[id]/[movieTitle]/ToggleWatchlistButton";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { createRecommendation } from "@/actions/recommendationActions";
import { toast } from "sonner";
import { omit } from "@/utils/ai-recommend/omit";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import RecommendModal from "@/components/RecommendModal";
import WatchTogetherButton from "@/components/WatchTogetherButton";

export default function WatchInfo({
  recommendation,
  initialInWatchlist,
  initialWatchlistId,
  alreadyRecommended,
  currentUserId,
  isAiRecommendation = false,
}: {
  recommendation: Recommendation;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  currentUserId: string;
  alreadyRecommended?: boolean;
  isAiRecommendation?: boolean;
}) {
  const router = useRouter();
  const recommender = recommendation.recommended_by;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(
    alreadyRecommended ?? false,
  );
  const shouldShowComment =
    Boolean(recommendation.comment) &&
    recommendation.comment.trim().toLowerCase() !== "ai recommended";

  const handleSubmit = async (formData: {
    comment: string;
    rating: number;
    visibility: "public" | "private";
  }) => {
    setLoading(true);

    const aiRecommendData = omit(recommendation, [
      "id",
      "generated_by_ai",
      "recommended_by",
      "recommendation_id",
    ]);

    const { error } = await createRecommendation({
      ...aiRecommendData,
      comment: formData.comment,
      rating: formData.rating,
      visibility: formData.visibility,
    });

    setLoading(false);
    if (!error) {
      toast.success("Recommendation submitted successfully.");
      setHasRecommended(true);
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Error recommending. Please try again.");
      console.error("Error recommending:", error);
    }
  };

  return (
    <div className="space-y-5 font-[family-name:var(--font-geist-mono)] text-white ">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex justify-between w-full flex-wrap gap-4 flex-col md:flex-row  lg:items-center">
          <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] leading-tight">
            {recommendation.title}
          </h1>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap">
            <WatchTogetherButton
              currentUserId={currentUserId}
              movieTmdbId={recommendation.tmdb_id}
              movieTitle={recommendation.title}
              movieType={recommendation.type}
              streamUrl={
                Array.isArray(recommendation.stream_url)
                  ? recommendation.stream_url[0]
                  : recommendation.stream_url
              }
              posterUrl={recommendation.poster_url}
            />

            <ToggleWatchlistButton
              currentUserId={currentUserId}
              initialInWatchlist={initialInWatchlist}
              initialWatchlistId={initialWatchlistId}
              recommendationId={recommendation.recommendation_id}
              isAiRecommendation={isAiRecommendation}
              fallbackMetadata={omit(recommendation, [
                "id",
                "generated_by_ai",
                "recommendation_id",
                "created_at",
                "visibility",
              ])}
            />

            <AnimatePresence initial={false}>
              {isAiRecommendation && !hasRecommended && (
                <motion.button
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => setOpen(true)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.1] md:w-fit"
                >
                  <Sparkles className="w-4 h-4" />
                  Recommend This!
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {recommendation.synopsis && (
        <p className="text-sm md:text-base text-white/70 max-w-3xl leading-relaxed font-[family-name:var(--font-geist-sans)]">
          {recommendation.synopsis}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs md:text-sm text-white/60">
        <span className="text-white/80">{recommendation.year}</span>

        {recommendation.type === "tv" ? (
          <span className="text-white/50 font-medium">
            {recommendation.episodes || 1}EPS
          </span>
        ) : (
          <span className="text-white/50 font-medium">
            {recommendation.duration || 0}m
          </span>
        )}

        <span className="bg-gray-700 rounded-sm px-2 py-1 text-xs capitalize">
          {recommendation.type}
        </span>
      </div>

      {recommendation.genres?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recommendation.genres.map((g) => (
            <span
              key={g}
              className="bg-white/10 px-2 py-1 text-[11px] md:text-xs rounded"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {shouldShowComment && (
        <blockquote className="text-white/80 italic border-l-4 border-red-500 pl-4 mt-2 text-sm md:text-base">
          &quot;{recommendation.comment}&quot;
        </blockquote>
      )}

      {!isAiRecommendation && recommender ? (
        <div className="space-y-1 mt-4">
          <p className="text-white/60 uppercase text-xs mb-2 tracking-wide">
            Recommended by
          </p>

          <Link
            prefetch={false}
            href={`/profile/${recommender.username}/${recommender.id}`}
            className="inline-flex items-center gap-3 py-2 px-3 rounded-md transition-colors bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 w-fit"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <Image
                src={recommender.avatar_url}
                alt="Avatar"
                unoptimized
                width={28}
                height={28}
                className="w-[28px] h-[28px] object-cover"
              />
            </div>

            <strong className="capitalize text-sm md:text-base">
              {recommender.username}
            </strong>
          </Link>
        </div>
      ) : (
        <div className="space-y-1 mt-4">
          <p className="text-white/60 uppercase text-xs mb-2 tracking-wide">
            Recommended by
          </p>

          <div className="inline-flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2 backdrop-blur transition-colors hover:bg-white/10 w-fit">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={"/gemini-color.svg"}
                alt="Gemini Icon"
                width={24}
                unoptimized
                height={24}
                className="rounded-full object-cover"
              />
            </div>
            <strong className="capitalize text-sm md:text-base">
              Ai Recommended
            </strong>
          </div>
        </div>
      )}

      <RecommendModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

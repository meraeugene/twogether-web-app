"use client";

import { Recommendation } from "@/types/recommendation";
import ToggleWatchlistButton from "@/app/(user)/watch/[id]/ToggleWatchlistButton";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { createRecommendation } from "@/actions/recommendationActions";
import RecommendModal from "@/components/RecommendModal";
import { toast } from "sonner";
import { omit } from "@/utils/ai-recommend/omit";
import { useRouter } from "next/navigation";

export default function WatchInfo({
  id,
  recommendation,
  initialInWatchlist,
  initialWatchlistId,
  alreadyRecommended,
  currentUserId,
  isAiRecommendation = false,
}: {
  recommendation: Recommendation;
  id: string;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  currentUserId: string;
  alreadyRecommended?: boolean;
  isAiRecommendation?: boolean;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: {
    comment: string;
    visibility: string;
  }) => {
    setLoading(true);

    // Omit unnecessary fields from the recommendation data to prevent sending AI-generated metadata
    const safeData = omit(recommendation, [
      "generated_by_ai",
      "recommended_by",
      "id",
      "recommendation_id",
    ]);

    const { error } = await createRecommendation(currentUserId!, {
      ...safeData,
      comment: formData.comment,
      visibility: formData.visibility,
      user_id: currentUserId,
    });

    setLoading(false);
    if (!error) {
      toast.success(
        "Recommendation submitted! Your taste just blessed someone’s watchlist 🎉"
      );
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

          {!isAiRecommendation && (
            <ToggleWatchlistButton
              currentUserId={currentUserId || ""}
              initialInWatchlist={initialInWatchlist}
              filmId={id}
              initialWatchlistId={initialWatchlistId}
              recommendationId={recommendation.recommendation_id}
            />
          )}

          {isAiRecommendation && !alreadyRecommended && (
            <button
              onClick={() => setOpen(true)}
              className="cursor-pointer w-fit inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition text-white text-sm md:text-base px-4 py-2 rounded-md font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Recommend This!
            </button>
          )}
        </div>
      </div>

      {recommendation.synopsis && (
        <p className="text-sm md:text-base text-white/70 max-w-3xl leading-relaxed font-[family-name:var(--font-geist-sans)]">
          {recommendation.synopsis}
        </p>
      )}

      <div className="text-white/60 text-xs md:text-sm">
        {recommendation.year} · {recommendation.duration}m ·{" "}
        <span className="uppercase">{recommendation.type}</span>
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

      {recommendation.comment && (
        <blockquote className="text-white/80 italic border-l-4 border-red-500 pl-4 mt-2 text-sm md:text-base">
          “{recommendation.comment}”
        </blockquote>
      )}

      {!isAiRecommendation && recommendation.recommended_by ? (
        <div className="space-y-1 mt-4">
          <p className="text-white/60 uppercase text-xs mb-2 tracking-wide">
            Recommended by
          </p>

          <Link
            href={`/profile/${recommendation.recommended_by.username}/${recommendation.recommended_by.id}`}
            className="inline-flex items-center gap-3 py-2 px-3 rounded-md transition-colors bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 w-fit"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <Image
                src={recommendation.recommended_by.avatar_url}
                alt="Avatar"
                width={28}
                height={28}
                className="object-cover"
              />
            </div>

            <strong className="capitalize text-sm md:text-base">
              {recommendation.recommended_by.username}
            </strong>
          </Link>
        </div>
      ) : (
        <div className="space-y-1 mt-4">
          <p className="text-white/60 uppercase text-xs mb-2 tracking-wide">
            Recommended by
          </p>

          <div className="inline-flex items-center gap-3 py-2 px-3 rounded-md transition-colors bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 w-fit">
            <Image
              src={recommendation.recommended_by.avatar_url}
              alt="Avatar"
              width={28}
              height={28}
              className="rounded-full"
            />
            <strong className="capitalize text-sm md:text-base">
              {recommendation.recommended_by.username}
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

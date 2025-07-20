"use client";

import { useTMDBWatch } from "@/stores/useTMDBWatch";
import WatchPlayer from "@/app/(user)/watch/[id]/[movieTitle]/WatchPlayer";
import WatchGemeni from "@/app/(user)/watch/[id]/[movieTitle]/WatchGemeni";
import ErrorMessage from "@/components/ErrorMessage";
import { useEffect, useState } from "react";
import WatchSkeletonLoading from "@/components/WatchSkeletonLoading";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import ToggleWatchlistButton from "@/app/(user)/watch/[id]/[movieTitle]/ToggleWatchlistButton";
import { omit } from "@/utils/ai-recommend/omit";
import RecommendModal from "@/components/RecommendModal";
import { createRecommendation } from "@/actions/recommendationActions";
import { toast } from "sonner";

export default function TMDBWatchPage({
  currentUserId,
  alreadyRecommended,
  initialInWatchlist,
  initialWatchlistId,
  isTMDBRecommendation,
}: {
  currentUserId?: string;
  alreadyRecommended: boolean;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  isTMDBRecommendation?: boolean;
}) {
  const router = useRouter();

  const recommendation = useTMDBWatch((s) => s.currentTMDB);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  if (!hasHydrated) return <WatchSkeletonLoading />;

  if (!recommendation) {
    return (
      <ErrorMessage
        title="AI Recommendation not found"
        message="We could not find the movie you selected. Try searching again."
      />
    );
  }

  const handleSubmit = async (formData: {
    comment: string;
    rating: number;
    visibility: "public" | "private";
  }) => {
    setLoading(true);

    const safeData = omit(recommendation, [
      "id",
      "recommended_by",
      "recommendation_id",
      "is_tmdb_recommendation",
      "generated_by_ai",
      "recommendation_created_at",
    ]);

    const { error } = await createRecommendation({
      ...safeData,
      comment: formData.comment,
      rating: formData.rating,
      visibility: formData.visibility,
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
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 text-white">
      <button
        onClick={() => router.back()}
        className="inline-flex w-12 h-8 lg:hidden items-center justify-center rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} />
      </button>

      <WatchPlayer
        urls={
          Array.isArray(recommendation.stream_url)
            ? recommendation.stream_url
            : [recommendation.stream_url]
        }
        type={recommendation.type}
        episodeTitlesPerSeason={
          recommendation.episode_titles_per_season
            ? Object.fromEntries(
                Object.entries(recommendation.episode_titles_per_season).map(
                  ([season, episodes]) => [
                    Number(season),
                    episodes.map((ep) => ep.title),
                  ]
                )
              )
            : undefined
        }
      />

      <div className="mt-8 space-y-5 font-[family-name:var(--font-geist-mono)] text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex justify-between w-full flex-wrap gap-4 flex-col md:flex-row  lg:items-center">
            <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] leading-tight">
              {recommendation.title}
            </h1>

            {currentUserId && (
              <div className="flex gap-3 md:flex-row flex-col ">
                <ToggleWatchlistButton
                  currentUserId={currentUserId || ""}
                  initialInWatchlist={initialInWatchlist}
                  initialWatchlistId={initialWatchlistId}
                  recommendationId={recommendation.recommendation_id}
                  isTMDBRecommendation={isTMDBRecommendation}
                  fallbackMetadata={omit(recommendation, [
                    "id",
                    "generated_by_ai",
                    "recommendation_id",
                    "created_at",
                    "visibility",
                    "is_tmdb_recommendation",
                  ])}
                />

                {isTMDBRecommendation && !alreadyRecommended && (
                  <button
                    onClick={() => setOpen(true)}
                    className="cursor-pointer w-fit inline-flex items-center gap-2 bg-white text-black transition hover:bg-white/90 text-sm md:text-base px-4 py-2 rounded-md font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    Recommend This!
                  </button>
                )}
              </div>
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
      </div>

      <WatchGemeni title={recommendation.title} currentUserId={currentUserId} />

      <RecommendModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </main>
  );
}

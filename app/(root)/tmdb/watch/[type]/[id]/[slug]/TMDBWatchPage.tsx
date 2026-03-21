"use client";

import WatchPlayer from "@/app/(user)/watch/[id]/[movieTitle]/WatchPlayer";
import WatchGemeni from "@/app/(user)/watch/[id]/[movieTitle]/WatchGemeni";
import { useState } from "react";
import WatchSkeletonLoading from "@/components/WatchSkeletonLoading";
import { Sparkles } from "lucide-react";
import ToggleWatchlistButton from "@/app/(user)/watch/[id]/[movieTitle]/ToggleWatchlistButton";
import { omit } from "@/utils/ai-recommend/omit";
import RecommendModal from "@/components/RecommendModal";
import { createRecommendation } from "@/actions/recommendationActions";
import { toast } from "sonner";
import TMDBSuggestions from "./TMDBSuggestions";
import { fetcher } from "@/utils/swr/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import ErrorMessage from "@/components/ErrorMessage";
import { Recommendation } from "@/types/recommendation";
import BackButton from "@/components/BackButton";
import TMDBReviewForm from "./TMDBReviewForm";
import TMDBMovieReviews from "./TMDBMovieReviews";
import { AnimatePresence, motion } from "framer-motion";
import WatchTogetherButton from "@/components/WatchTogetherButton";

type SWRResponse = {
  recommendation: Recommendation;
};

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
  const params = useParams<{ type: string; id: string }>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(alreadyRecommended);

  const { data, error, isLoading } = useSWR<SWRResponse>(
    `/api/tmdb/${params.id}/?type=${params.type}`,
    fetcher,
  );

  if (isLoading) return <WatchSkeletonLoading />;
  if (error) return <ErrorMessage />;

  const recommendation = data?.recommendation;

  const handleSubmit = async (formData: {
    comment: string;
    rating: number;
    visibility: "public" | "private";
  }) => {
    setLoading(true);

    if (!recommendation) {
      toast.error("Recommendation data is missing.");
      setLoading(false);
      return;
    }

    const safeData = omit(recommendation, [
      "id",
      "recommended_by",
      "recommendation_id",
      "is_tmdb_recommendation",
      "generated_by_ai",
      "recommendation_created_at",
    ]);

    const { error: submitError } = await createRecommendation({
      ...safeData,
      comment: formData.comment,
      rating: formData.rating,
      visibility: formData.visibility,
    });

    setLoading(false);
    document.body.classList.remove("overflow-hidden");

    if (!submitError) {
      toast.success("Recommendation submitted successfully.");
      setHasRecommended(true);
      setOpen(false);
      return;
    }

    toast.error("Error recommending. Please try again.");
    console.error("Error recommending:", submitError);
  };

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 relative lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 text-white ">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

      <BackButton />

      {recommendation && (
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
                    ],
                  ),
                )
              : undefined
          }
        />
      )}

      {recommendation && (
        <div className="mt-8 space-y-5 font-[family-name:var(--font-geist-mono)] text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex justify-between w-full flex-wrap gap-4 flex-col md:flex-row  lg:items-center">
              <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] leading-tight">
                {recommendation.title}
              </h1>

              {currentUserId && (
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

                  <AnimatePresence initial={false}>
                    {isTMDBRecommendation && !hasRecommended && (
                      <motion.button
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => {
                          document.body.classList.add("overflow-hidden");
                          setOpen(true);
                        }}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.1] md:w-fit"
                      >
                        <Sparkles className="w-4 h-4" />
                        Recommend This!
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}
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
                S{recommendation.seasons || 1} · {recommendation.episodes || 1}
                EPS
              </span>
            ) : (
              recommendation.duration !== 0 && (
                <span className="text-white/50 font-medium">
                  {recommendation.duration}m
                </span>
              )
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
        </div>
      )}

      <TMDBMovieReviews tmdbId={Number(params.id)} />

      {!currentUserId && (
        <div className="w-full xl:max-w-1/2 mt-16">
          <div className="relative mb-8">
            <div className="absolute -top-2 -left-4 w-12 h-0.5 bg-red-500 transform -rotate-12" />
            <div className="absolute -top-1 -left-2 w-8 h-0.5 bg-red-300 transform -rotate-12" />
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Login to Rate and Review
            </h3>
          </div>
        </div>
      )}

      {currentUserId && recommendation?.tmdb_id && (
        <TMDBReviewForm
          currentUserId={currentUserId}
          tmdbId={recommendation.tmdb_id}
        />
      )}

      {recommendation?.tmdb_id && (
        <TMDBSuggestions
          tmdbId={recommendation.tmdb_id}
          type={recommendation.type}
        />
      )}

      <WatchGemeni
        title={recommendation?.title ?? ""}
        currentUserId={currentUserId}
      />

      <RecommendModal
        open={open}
        onClose={() => {
          document.body.classList.remove("overflow-hidden");
          setOpen(false);
        }}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </main>
  );
}

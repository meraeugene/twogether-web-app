"use client";

import WatchPlayer from "@/app/(user)/watch/[id]/[movieTitle]/WatchPlayer";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { Sparkles, Star } from "lucide-react";
import ToggleWatchlistButton from "@/app/(user)/watch/[id]/[movieTitle]/ToggleWatchlistButton";
import { omit } from "@/utils/ai-recommend/omit";
import RecommendModal from "@/components/RecommendModal";
import { createRecommendation } from "@/actions/recommendationActions";
import { toast } from "sonner";
import TMDBSuggestions from "./TMDBSuggestions";
import { Recommendation } from "@/types/recommendation";
import BackButton from "@/components/BackButton";
import TMDBReviewForm from "./TMDBReviewForm";
import TMDBMovieReviews from "./TMDBMovieReviews";
import { AnimatePresence, motion } from "framer-motion";
import WatchTogetherButton from "@/components/WatchTogetherButton";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";

const WatchGemeni = dynamic(
  () => import("@/app/(user)/watch/[id]/[movieTitle]/WatchGemeni"),
  { ssr: false },
);
export default function TMDBWatchPage({
  initialRecommendation,
  currentUserId,
  alreadyRecommended,
  initialInWatchlist,
  initialWatchlistId,
  isTMDBRecommendation,
}: {
  initialRecommendation: Recommendation;
  currentUserId?: string;
  alreadyRecommended: boolean;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  isTMDBRecommendation?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(alreadyRecommended);
  const recommendation = initialRecommendation;

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
      "backdrop_url",
      "tagline",
      "tmdb_rating",
      "vote_count",
      "status",
      "original_language",
      "director",
      "creators",
      "production_countries",
      "cast",
    ]);

    const { error: submitError } = await createRecommendation({
      ...safeData,
      comment: formData.comment,
      rating: formData.rating,
      visibility: formData.visibility,
    });

    setLoading(false);

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
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-6 pt-28 pb-16 relative lg:px-24 xl:px-16 2xl:px-26 xl:pt-34 text-white ">
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
          resumeTracking={{
            tmdbId: recommendation.tmdb_id,
            title: recommendation.title,
            href: `/tmdb/watch/${recommendation.type}/${recommendation.tmdb_id}/${getSlugFromTitle(recommendation.title)}`,
            posterUrl: recommendation.poster_url,
            synopsis: recommendation.synopsis,
            type: recommendation.type,
            year: recommendation.year,
          }}
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
                        onClick={() => setOpen(true)}
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
                {recommendation.episodes || 1}EPS
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

      {recommendation && (
        <section className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,.3)] sm:p-7 lg:p-9">
          {recommendation.backdrop_url && (
            <Image
              src={recommendation.backdrop_url}
              alt=""
              fill
              sizes="100vw"
              className="pointer-events-none -z-10 object-cover opacity-[0.07] blur-2xl"
            />
          )}

          <div className="grid gap-7 lg:grid-cols-[210px_1fr] lg:gap-10">
            {recommendation.poster_url && (
              <div className="relative mx-auto aspect-[2/3] w-full max-w-[210px] overflow-hidden rounded-2xl border border-white/15 bg-white/[0.05] shadow-2xl shadow-black/45 lg:mx-0">
                <Image
                  src={recommendation.poster_url}
                  alt={`${recommendation.title} poster`}
                  fill
                  sizes="210px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">
                More details
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                About {recommendation.title}
              </h2>
              {recommendation.tagline && (
                <p className="mt-3 text-base italic text-white/55 sm:text-lg">
                  “{recommendation.tagline}”
                </p>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 xl:grid-cols-4">
                {recommendation.tmdb_rating ? (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      TMDB rating
                    </dt>
                    <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-white/80">
                      <Star className="h-4 w-4 fill-red-500 text-red-500" />
                      {recommendation.tmdb_rating.toFixed(1)} / 10
                    </dd>
                  </div>
                ) : null}
                {recommendation.director && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Director
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-white/80">
                      {recommendation.director}
                    </dd>
                  </div>
                )}
                {recommendation.creators && recommendation.creators.length > 0 && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Created by
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-white/80">
                      {recommendation.creators.join(", ")}
                    </dd>
                  </div>
                )}
                {recommendation.status && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Status
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-white/80">
                      {recommendation.status}
                    </dd>
                  </div>
                )}
                {recommendation.original_language && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Original language
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium uppercase text-white/80">
                      {recommendation.original_language}
                    </dd>
                  </div>
                )}
                {recommendation.production_countries &&
                  recommendation.production_countries.length > 0 && (
                    <div className="col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                        Production
                      </dt>
                      <dd className="mt-1.5 text-sm font-medium text-white/80">
                        {recommendation.production_countries.join(", ")}
                      </dd>
                    </div>
                  )}
              </dl>
            </div>
          </div>

          {recommendation.cast && recommendation.cast.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-7">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-400">
                    Featured cast
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight">
                    Actors and characters
                  </h2>
                </div>
                <p className="hidden text-xs text-white/35 sm:block">
                  Swipe to explore
                </p>
              </div>

              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
                {recommendation.cast.map((member) => (
                  <article
                    key={member.id}
                    className="w-[128px] shrink-0 snap-start sm:w-[148px]"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                      {member.profile_url ? (
                        <Image
                          src={member.profile_url}
                          alt={member.name}
                          fill
                          sizes="148px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white/[0.04] px-3 text-center text-2xl font-bold text-white/25">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold leading-5 text-white/85">
                      {member.name}
                    </h3>
                    {member.character && (
                      <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/40">
                        {member.character}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <TMDBMovieReviews tmdbId={recommendation.tmdb_id} />

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

      {currentUserId && recommendation.tmdb_id && (
        <TMDBReviewForm
          currentUserId={currentUserId}
          tmdbId={recommendation.tmdb_id}
        />
      )}

      {recommendation.tmdb_id && (
        <TMDBSuggestions
          tmdbId={recommendation.tmdb_id}
          type={recommendation.type}
        />
      )}

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

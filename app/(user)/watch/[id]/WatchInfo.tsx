import { Recommendation } from "@/types/recommendation";
import ToggleWatchlistButton from "@/app/(user)/watch/[id]/ToggleWatchlistButton";
import Image from "next/image";
import Link from "next/link";

export default function WatchInfo({
  id,
  recommendation,
  initialInWatchlist,
  initialWatchlistId,
  currentUserId,
  isAiRecommendation = false,
}: {
  recommendation: Recommendation;
  id: string;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
  currentUserId?: string;
  isAiRecommendation?: boolean;
}) {
  return (
    <div className="space-y-5 font-[family-name:var(--font-geist-mono)] text-white ">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

      {!isAiRecommendation && recommendation.recommended_by && (
        <div className="space-y-1 mt-4">
          <p className="text-white/60 uppercase text-xs mb-2 tracking-wide">
            Recommended by
          </p>

          <Link
            href={`/profile/${recommendation.recommended_by.username}/${recommendation.recommended_by.id}`}
            className="inline-flex items-center gap-3 py-2 px-3 rounded-md transition-colors bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 w-fit"
          >
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
          </Link>
        </div>
      )}
    </div>
  );
}

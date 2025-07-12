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
    <div className="space-y-3 font-[family-name:var(--font-geist-mono)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-geist-sans)]">
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

      <p className="text-base text-white/50 w-1/2 font-[family-name:var(--font-geist-sans)]">
        {recommendation.synopsis}
      </p>

      <div className="text-white/70 text-sm">
        {recommendation.year} · {recommendation.duration}m ·{" "}
        <span className="uppercase">{recommendation.type}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {recommendation.genres?.map((g: string) => (
          <span key={g} className="bg-white/10 px-2 py-1 text-xs rounded">
            {g}
          </span>
        ))}
      </div>

      {recommendation.comment && (
        <blockquote className="text-white/80 italic border-l-4 border-red-500 pl-4 mt-4">
          “{recommendation.comment}”
        </blockquote>
      )}

      <p className="text-white/60 mt-2 uppercase text-sm">Recommended by </p>

      <Link
        href={`${
          isAiRecommendation
            ? null
            : `/profile/${recommendation.recommended_by.username}/${recommendation.recommended_by.id}`
        }`}
        className="flex items-center  gap-3  w-fit py-2 px-3 rounded-md transition-colors bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10"
      >
        <Image
          src={recommendation.recommended_by.avatar_url}
          alt="Avatar"
          width={28}
          height={28}
          className=" rounded-full"
        />
        <strong className="capitalize">
          {recommendation.recommended_by.username}
        </strong>
      </Link>
    </div>
  );
}

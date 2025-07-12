import { Recommendation } from "@/types/recommendation";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { v4 as uuidv4 } from "uuid";

export function adaptTMDBToRecommendation(
  tmdb: TMDBEnrichedResult
): Recommendation {
  const baseId = `${tmdb.media_type}-${tmdb.id}`; // deterministic

  return {
    id: baseId,
    recommendation_id: baseId,
    tmdb_id: tmdb.id,
    title: tmdb.title || tmdb.name || "Untitled",
    poster_url: tmdb.poster_url ?? undefined,
    type: tmdb.media_type === "tv" ? "show" : "movie",
    stream_url: [
      `https://vidlink.pro/${tmdb.media_type}/${tmdb.id}?title=true&poster=true&autoplay=false&nextbutton=true`,
      `https://vidsrc.to/embed/${tmdb.media_type}/${tmdb.id}`,
      `https://vidsrc.cc/v2/embed/${tmdb.media_type}/${tmdb.id}?autoPlay=false&poster=true`,
    ],
    genres: tmdb.genres,
    year: tmdb.year,
    duration: tmdb.duration ?? undefined,
    synopsis: tmdb.synopsis,
    comment: "AI Recommended",
    visibility: "public",
    created_at: new Date().toISOString(),
    recommended_by: {
      id: "ai-recommendation",
      username: "AI Assistant",
      avatar_url: "/gemini-color.svg",
    },
  };
}

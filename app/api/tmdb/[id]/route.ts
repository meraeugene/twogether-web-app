import { NextRequest, NextResponse } from "next/server";
import { getTMDBWatchRecommendation } from "@/utils/tmdb/getTMDBWatchRecommendation";

// Detail pages are mostly stable, so daily caching balances freshness and TMDB quota.
const TMDB_DETAILS_CACHE_SECONDS = 86400; // 24 hours

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const url = new URL(request.url);
    const tmdbId = (await params).id;
    const type = url.searchParams.get("type"); // "movie" or "tv"

    if (!tmdbId || !type) {
      return NextResponse.json(
        { error: "Missing TMDB ID or type" },
        { status: 400 },
      );
    }

    const recommendation = await getTMDBWatchRecommendation(
      tmdbId,
      type as "movie" | "tv",
    );

    if (!recommendation) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });
    }

    return NextResponse.json(
      { recommendation },
      {
        headers: {
          "Cache-Control": `public, max-age=${TMDB_DETAILS_CACHE_SECONDS}, stale-while-revalidate=300`,
        },
      },
    );
  } catch (err) {
    console.error("TMDB API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch movie/TV" },
      { status: 500 },
    );
  }
}

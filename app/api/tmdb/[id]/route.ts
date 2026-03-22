import { NextRequest, NextResponse } from "next/server";
import { getTMDBWatchRecommendation } from "@/utils/tmdb/getTMDBWatchRecommendation";

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

    return NextResponse.json({ recommendation });
  } catch (err) {
    console.error("TMDB API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch movie/TV" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { TMDBRawResult, TMDBEnrichedResult } from "@/types/tmdb";

// Cache store
const cache = new Map<
  string,
  { data: TMDBEnrichedResult[]; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  if (!query)
    return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const searchRes = await fetch(
    `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
      query
    )}&api_key=${TMDB_API_KEY}`
  );

  const searchData = await searchRes.json();

  const rawResults: TMDBRawResult[] = (searchData.results || [])
    .filter((item: TMDBRawResult) => ["movie", "tv"].includes(item.media_type))
    .sort((a: TMDBRawResult, b: TMDBRawResult) => {
      const getYear = (item: TMDBRawResult) =>
        item.media_type === "movie"
          ? parseInt(item.release_date?.slice(0, 4) || "0")
          : parseInt(item.first_air_date?.slice(0, 4) || "0");

      return getYear(b) - getYear(a); // Descending: latest first
    });

  const enrichedResults: TMDBEnrichedResult[] = await Promise.all(
    rawResults.map(async (item): Promise<TMDBEnrichedResult> => {
      const detailsRes = await fetch(
        `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
      );

      const detailsData = await detailsRes.json();

      return {
        ...item,
        imdb_id: detailsData.external_ids?.imdb_id || "",
        genres:
          detailsData.genres?.map(
            (g: { id: number; name: string }) => g.name
          ) || [],
        poster_url: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        year:
          item.media_type === "movie"
            ? detailsData.release_date?.slice(0, 4)
            : detailsData.first_air_date?.slice(0, 4),
        duration:
          item.media_type === "movie"
            ? detailsData.runtime
            : detailsData.episode_run_time?.[0] || 0,
        synopsis: detailsData.overview || "",
      };
    })
  );

  // Cache the enriched results
  cache.set(cacheKey, { data: enrichedResults, timestamp: now });

  return NextResponse.json(enrichedResults);
}

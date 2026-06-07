import { TMDBEnrichedResult } from "@/types/tmdb";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
// Recommendations change slowly, so a daily cache saves many repeated TMDB calls.
const SIMILAR_CACHE_SECONDS = 86400; // 24 hours

export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type") || "movie";

  if (!tmdbId) {
    return NextResponse.json({ error: "Missing TMDB ID" }, { status: 400 });
  }

  // Fetch recommendations
  const recRes = await fetch(
    `${BASE_URL}/${type}/${tmdbId}/recommendations?api_key=${API_KEY}&page=1`,
    { cache: "force-cache", next: { revalidate: SIMILAR_CACHE_SECONDS } },
  );
  const recData = await recRes.json();

  if (!recData.results) {
    return NextResponse.json({ results: [], total_pages: 0 });
  }

  // filter valid results
  const filtered = recData.results.filter(
    (item: TMDBEnrichedResult) => item.release_date || item.first_air_date
  );

  // only take first 18
  const sliced = filtered.slice(0, 18);

  // fetch details for each
  const detailedResults = await Promise.all(
    sliced.map(async (item: TMDBEnrichedResult) => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${item.type || type}/${
            item.id
          }?api_key=${API_KEY}&append_to_response=credits,videos`,
          { cache: "force-cache", next: { revalidate: SIMILAR_CACHE_SECONDS } },
        );
        const details = await detailsRes.json();

        return {
          id: item.id,
          tmdb_id: item.id,
          title: details.title || details.name,
          poster_url: details.poster_path
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : null,
          year:
            details.release_date?.slice(0, 4) ||
            details.first_air_date?.slice(0, 4),
          type: item.media_type || type,
          synopsis: details.overview,
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          duration:
            item.media_type === "movie"
              ? details.runtime ?? null
              : details.episode_run_time?.[0] ?? null,
          seasons:
            item.media_type === "tv" ? details.number_of_seasons : undefined,
          episodes:
            item.media_type === "tv" ? details.number_of_episodes : undefined,
        };
      } catch {
        return null;
      }
    })
  );

  const response = NextResponse.json({
    results: detailedResults.filter(Boolean),
    total_pages: 1,
  });
  response.headers.set(
    "Cache-Control",
    `public, max-age=${SIMILAR_CACHE_SECONDS}, stale-while-revalidate=300`,
  );
  return response;
}

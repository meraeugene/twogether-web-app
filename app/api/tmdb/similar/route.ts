import { TMDBEnrichedResult } from "@/types/tmdb";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type") || "movie";
  const page = req.nextUrl.searchParams.get("page") || "1";

  if (!tmdbId) {
    return NextResponse.json({ error: "Missing TMDB ID" }, { status: 400 });
  }

  // Fetch recommendations
  const recRes = await fetch(
    `${BASE_URL}/${type}/${tmdbId}/recommendations?api_key=${API_KEY}&page=${page}`,
    { cache: "no-store" }
  );
  const recData = await recRes.json();

  if (!recData.results) {
    return NextResponse.json({ results: [], total_pages: 0 });
  }

  // filter valid results
  const filtered = recData.results.filter(
    (item: TMDBEnrichedResult) => item.release_date || item.first_air_date
  );

  // only take first 6 per page
  const sliced = filtered.slice(0, 6);

  // fetch details for each
  const detailedResults = await Promise.all(
    sliced.map(async (item: TMDBEnrichedResult) => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${item.media_type || type}/${
            item.id
          }?api_key=${API_KEY}&append_to_response=credits,videos`,
          { cache: "no-store" }
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
          media_type: item.media_type || type,
          synopsis: details.overview,
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          duration: details.runtime || details.episode_run_time?.[0] || null,
          seasons: details.number_of_seasons || null,
        };
      } catch {
        return null;
      }
    })
  );

  return NextResponse.json({
    results: detailedResults.filter(Boolean),
    total_pages: recData.total_pages,
  });
}

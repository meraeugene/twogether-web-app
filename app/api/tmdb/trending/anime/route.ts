import { TMDBRawResult, TMDBEnrichedResult } from "@/types/tmdb";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") || "1");

  // Anime == TV shows with genre Animation (id: 16)
  const url = `${BASE_URL}/discover/tv?with_genres=16&sort_by=popularity.desc&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`;

  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });

  const tmdbData = await res.json();
  const rawItems: TMDBRawResult[] = tmdbData.results || [];

  const enriched: TMDBEnrichedResult[] = await Promise.all(
    rawItems.map(async (item): Promise<TMDBEnrichedResult> => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}`,
          {
            cache: "force-cache",
            next: { revalidate: 86400 },
          }
        );

        if (!detailsRes.ok) throw new Error("Details fetch failed");
        const details = await detailsRes.json();

        return {
          ...item,
          tmdb_id: item.id,
          type: "tv",
          poster_url: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          year: details.first_air_date?.slice(0, 4),
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          duration: details.episode_run_time?.[0],
          synopsis: details.overview || "",
        };
      } catch (err) {
        console.error(`Failed to enrich Anime TMDB ID ${item.id}:`, err);
        return {
          ...item,
          tmdb_id: item.id,
          type: "tv",
          genres: [],
          poster_url: null,
          year: undefined,
          duration: undefined,
          synopsis: "",
        };
      }
    })
  );

  const response = NextResponse.json(enriched);
  response.headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate=60"
  );
  return response;
}

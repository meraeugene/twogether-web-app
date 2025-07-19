import { Genre } from "@/types/formTypes";
import { TMDB_GENRE_MAP } from "@/constants/tmdbGenres";
import { TMDBRawResult, TMDBEnrichedResult } from "@/types/tmdb";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

function isGenre(value: string): value is Genre {
  return value in TMDB_GENRE_MAP;
}

export async function GET(req: NextRequest) {
  const genreParam = req.nextUrl.searchParams.get("genre");
  const page = Number(req.nextUrl.searchParams.get("page") || "1");

  if (!genreParam || !isGenre(genreParam)) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  const genreId = TMDB_GENRE_MAP[genreParam];

  const url = `${BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&include_adult=false&certification_country=US&certification.lte=PG-13&api_key=${API_KEY}&page=${page}`;

  const res = await fetch(url, {
    // cache for 24 hours, consider `force-cache` if you want it 100% static
    cache: "force-cache",
    next: { revalidate: 86400 }, // revalidate every 24 hours
  });

  const tmdbData = await res.json();
  const rawItems: TMDBRawResult[] = tmdbData.results || [];

  const enriched: TMDBEnrichedResult[] = await Promise.all(
    rawItems.map(async (item): Promise<TMDBEnrichedResult> => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}`,
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
          poster_url: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          year: details.release_date?.slice(0, 4),
          media_type: "movie",
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          duration: details.runtime,
          synopsis: details.overview || "",
        };
      } catch (err) {
        console.error(`Failed to enrich TMDB ID ${item.id}:`, err);
        return {
          ...item,
          tmdb_id: item.id,
          media_type: "movie",
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

  // ✅ Edge cache control for downstream CDNs
  response.headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate=60"
  );

  return response;
}

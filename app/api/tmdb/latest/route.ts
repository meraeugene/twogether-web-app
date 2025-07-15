import { Genre } from "@/types/formTypes";
import { TMDB_GENRE_MAP } from "@/constants/tmdbGenres";
import {
  TMDBRawResult,
  TMDBEnrichedResult,
  EpisodeTitle,
  TMDBSeasonResponse,
} from "@/types/tmdb";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

function isGenre(value: string): value is Genre {
  return value in TMDB_GENRE_MAP;
}

export async function GET(req: NextRequest) {
  const genreParam = req.nextUrl.searchParams.get("genre");
  const type = req.nextUrl.searchParams.get("type") || "movie";
  const page = Number(req.nextUrl.searchParams.get("page") || "1");

  if (!genreParam || !isGenre(genreParam)) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  const genreId = TMDB_GENRE_MAP[genreParam];
  const url = `${BASE_URL}/discover/${type}?with_genres=${genreId}&sort_by=popularity.desc&include_adult=false&api_key=${API_KEY}&page=${page}`;

  const res = await fetch(url);
  const tmdbData = await res.json();
  const rawItems: TMDBRawResult[] = tmdbData.results || [];

  const enriched: TMDBEnrichedResult[] = await Promise.all(
    rawItems.map(async (item): Promise<TMDBEnrichedResult> => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${type}/${item.id}?api_key=${API_KEY}`
        );
        if (!detailsRes.ok) throw new Error("Details fetch failed");

        const details = await detailsRes.json();

        const episodeTitlesPerSeason: Record<number, EpisodeTitle[]> = {};

        if (type === "tv") {
          for (let season = 1; season <= details.number_of_seasons; season++) {
            const seasonRes = await fetch(
              `${BASE_URL}/tv/${item.id}/season/${season}?api_key=${API_KEY}`
            );
            if (seasonRes.ok) {
              const seasonData: TMDBSeasonResponse = await seasonRes.json();
              episodeTitlesPerSeason[season] = seasonData.episodes.map(
                (ep) => ({
                  episode_number: ep.episode_number,
                  title: ep.name,
                })
              );
            }
          }
        }

        return {
          ...item,
          tmdb_id: item.id,
          poster_url: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          year:
            type === "movie"
              ? details.release_date?.slice(0, 4)
              : details.first_air_date?.slice(0, 4),
          type,
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          duration:
            type === "movie"
              ? details.runtime
              : details.episode_run_time?.[0] || 24,
          synopsis: details.overview || "",
          seasons: type === "tv" ? details.number_of_seasons : undefined,
          episodes: type === "tv" ? details.number_of_episodes : undefined,
          episodeTitlesPerSeason:
            type === "tv" ? episodeTitlesPerSeason : undefined,
        };
      } catch (err) {
        console.error(`Failed to enrich TMDB ID ${item.id}:`, err);
        return {
          ...item,
          tmdb_id: item.id,
          type,
          genres: [],
          poster_url: null,
          year: undefined,
          duration: undefined,
          synopsis: "",
        };
      }
    })
  );

  return NextResponse.json(enriched);
}

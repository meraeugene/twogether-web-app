import { NextResponse } from "next/server";
import { TMDBRawResult, TMDBEnrichedResult } from "@/types/tmdb";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET() {
  try {
    // --- Movies ---
    const moviesRes = await fetch(
      `${BASE_URL}/trending/movie/week?language=en-US&api_key=${API_KEY}`,
      { cache: "force-cache", next: { revalidate: 86400 } }
    );
    const moviesData = await moviesRes.json();
    const movies: TMDBRawResult[] = (moviesData.results || []).slice(0, 18);

    // --- Anime (TV with Animation genre 16) ---
    const animeRes = await fetch(
      `${BASE_URL}/discover/tv?with_genres=16&sort_by=popularity.desc&language=en-US&page=1&api_key=${API_KEY}`,
      { cache: "force-cache", next: { revalidate: 86400 } }
    );
    const animeData = await animeRes.json();
    const anime: TMDBRawResult[] = (animeData.results || []).slice(0, 18);

    // --- TV Shows (non-anime) ---
    const tvRes = await fetch(
      `${BASE_URL}/tv/popular?language=en-US&page=1&api_key=${API_KEY}`,
      { cache: "force-cache", next: { revalidate: 86400 } }
    );
    const tvData = await tvRes.json();
    const tv: TMDBRawResult[] = (tvData.results || []).slice(0, 18);

    // --- K-Dramas (TV, Korean language + Drama genre) ---
    const kdramaRes = await fetch(
      `${BASE_URL}/discover/tv?with_original_language=ko&with_genres=18&sort_by=popularity.desc&page=1&api_key=${API_KEY}`,
      { cache: "force-cache", next: { revalidate: 86400 } }
    );
    const kdramaData = await kdramaRes.json();
    const kdramas: TMDBRawResult[] = (kdramaData.results || []).slice(0, 18);

    // --- Enrichment helper ---
    async function enrichItem(
      item: TMDBRawResult,
      type: "movie" | "tv"
    ): Promise<TMDBEnrichedResult> {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${type}/${item.id}?api_key=${API_KEY}`,
          { cache: "force-cache", next: { revalidate: 86400 } }
        );

        if (!detailsRes.ok) throw new Error("Details fetch failed");

        const details = await detailsRes.json();

        return {
          ...item,
          tmdb_id: item.id,
          type,
          poster_url: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          year:
            type === "movie"
              ? details.release_date?.slice(0, 4)
              : details.first_air_date?.slice(0, 4),
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          duration:
            type === "movie" ? details.runtime : details.episode_run_time?.[0],
          synopsis: details.overview || "",
          seasons: type === "tv" ? details.number_of_seasons : undefined,
          episodes: type === "tv" ? details.number_of_episodes : undefined,
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
    }

    // Run enrichments in parallel
    const [enrichedMovies, enrichedAnime, enrichedTv, enrichedKdramas] =
      await Promise.all([
        Promise.all(movies.map((i) => enrichItem(i, "movie"))),
        Promise.all(anime.map((i) => enrichItem(i, "tv"))),
        Promise.all(tv.map((i) => enrichItem(i, "tv"))),
        Promise.all(kdramas.map((i) => enrichItem(i, "tv"))),
      ]);

    const response = NextResponse.json({
      movies: enrichedMovies,
      anime: enrichedAnime,
      tv: enrichedTv,
      kdramas: enrichedKdramas, //  Added K-Dramas here
    });

    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=60"
    );
    return response;
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

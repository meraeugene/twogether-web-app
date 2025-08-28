import { EpisodeTitle, TMDBSeasonResponse } from "@/types/tmdb";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(request.url);
    const tmdbId = (await params).id;
    const type = url.searchParams.get("type"); // "movie" or "tv"

    if (!tmdbId || !type) {
      return NextResponse.json(
        { error: "Missing TMDB ID or type" },
        { status: 400 }
      );
    }

    const apiUrl = `${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}&append_to_response=credits,videos`;
    const res = await fetch(apiUrl, { next: { revalidate: 86400 } });
    if (!res.ok)
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });

    const details = await res.json();

    // TV-specific logic
    let episodeTitlesPerSeason: Record<number, EpisodeTitle[]> | undefined;
    if (type === "tv") {
      episodeTitlesPerSeason = {};
      const totalSeasons = details.number_of_seasons || 0;
      for (let season = 1; season <= totalSeasons; season++) {
        const seasonRes = await fetch(
          `${BASE_URL}/tv/${details.id}/season/${season}?api_key=${API_KEY}`,
          { next: { revalidate: 86400 } }
        );
        if (seasonRes.ok) {
          const seasonData: TMDBSeasonResponse = await seasonRes.json();
          episodeTitlesPerSeason[season] = seasonData.episodes.map((ep) => ({
            episode_number: ep.episode_number,
            title: ep.name,
          }));
        }
      }
    }

    const recommendation = {
      id: details.id,
      tmdb_id: details.id,
      type,
      title: details.title || details.name,
      poster_url: details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : null,
      year:
        details.release_date?.slice(0, 4) ||
        details.first_air_date?.slice(0, 4),
      synopsis: details.overview ?? "",
      stream_url:
        type === "tv"
          ? [
              `https://vidlink.pro/tv/${details.id}/1/1?title=true&poster=true&autoplay=false`,
              `https://vidsrc.cc/v2/embed/tv/${details.id}/1/1?autoPlay=false&poster=true`,
              `https://vidsrc.to/embed/tv/${details.id}/1/1`,
            ]
          : [
              `https://vidlink.pro/movie/${details.id}?title=true&poster=true&autoplay=false`,
              `https://vidsrc.cc/v2/embed/movie/${details.id}?autoPlay=false&poster=true`,
              `https://vidsrc.to/embed/movie/${details.id}`,
            ],
      genres:
        details.genres?.map((g: { id: number; name: string }) => g.name) || [],
      duration: details.runtime ?? details.episode_run_time?.[0] ?? null,
      seasons: type === "tv" ? details.number_of_seasons : undefined,
      episodes: type === "tv" ? details.number_of_episodes : undefined,
      episode_titles_per_season: episodeTitlesPerSeason,
      visibility: "public",
      comment: "",
      is_tmdb_recommendation: true,
      created_at: new Date().toISOString(),
      recommended_by: { id: "tmdb", username: "", avatar_url: "" },
    };

    return NextResponse.json({ recommendation });
  } catch (err) {
    console.error("TMDB API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch movie/TV" },
      { status: 500 }
    );
  }
}

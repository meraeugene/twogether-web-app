import { NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/original";

type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  release_date: string;
};

export type TMDBVideo = {
  key: string;
  site: string;
  type: string;
};

export async function GET() {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch movies");
    }

    const data: { results: TMDBMovie[] } = await res.json();

    const movies = data.results.slice(0, 10);

    const moviesWithTrailers = await Promise.all(
      movies.map(async (movie) => {
        const videoRes = await fetch(
          `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`,
        );

        const videoData: { results: TMDBVideo[] } = await videoRes.json();

        const trailer = videoData.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube",
        );

        const slug = movie.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        return {
          id: movie.id,
          title: movie.title,
          slug,
          overview: movie.overview,
          year: movie.release_date?.split("-")[0] ?? null,
          backdrop: movie.backdrop_path
            ? `${IMAGE_BASE}${movie.backdrop_path}`
            : null,
          trailerKey: trailer?.key ?? null,
        };
      }),
    );

    return NextResponse.json(moviesWithTrailers.filter((m) => m.trailerKey));
  } catch (error) {
    console.error("TMDB API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch movie trailers" },
      { status: 500 },
    );
  }
}

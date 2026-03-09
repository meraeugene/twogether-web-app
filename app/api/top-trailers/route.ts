import { NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  release_date: string;
};

type TMDBVideo = {
  key: string;
  site: string;
  type: string;
};

export async function GET() {
  try {
    const moviesRes = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`,
      { cache: "no-store" },
    );

    const moviesData: { results: TMDBMovie[] } = await moviesRes.json();
    const movies = moviesData.results.slice(0, 10);

    const trailers = await Promise.all(
      movies.map(async (movie) => {
        const res = await fetch(
          `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`,
        );

        const data: { results: TMDBVideo[] } = await res.json();

        const trailer = data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube",
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
          year: movie.release_date?.split("-")[0],
          backdrop: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : null,
          trailerKey: trailer?.key ?? null,
        };
      }),
    );

    return NextResponse.json(trailers.filter((t) => t.trailerKey));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch trailers" },
      { status: 500 },
    );
  }
}

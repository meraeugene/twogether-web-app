import { getMovieReviews } from "@/actions/movieReviewActions";
import { NextResponse } from "next/server";

// Reviews are user-generated, so keep only a tiny cache window.
const REVIEWS_CACHE_SECONDS = 300; // 5 minutes

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) => {
  try {
    const tmdbId = (await params).id;
    const movieReviews = await getMovieReviews(tmdbId);

    return NextResponse.json(movieReviews, {
      status: 200,
      headers: {
        "Cache-Control": `public, max-age=${REVIEWS_CACHE_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
};

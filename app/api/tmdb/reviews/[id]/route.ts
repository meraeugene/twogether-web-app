import { getMovieReviews } from "@/actions/movieReviewActions";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) => {
  try {
    const tmdbId = (await params).id;
    const movieReviews = await getMovieReviews(tmdbId);

    return NextResponse.json(movieReviews, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
};

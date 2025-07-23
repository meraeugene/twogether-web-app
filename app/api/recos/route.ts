// @desc Get all recommendations
// @route GET /api/recos

import { getRecommendations } from "@/actions/recommendationActions";
import { NextResponse } from "next/server";

// @access Public
export const GET = async () => {
  try {
    const recommendations = await getRecommendations();

    // Handle no recommendations found
    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json(
        { message: "No recommendations found." },
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify(recommendations), { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    const errorDetails =
      error instanceof Error ? error.stack : JSON.stringify(error);

    return NextResponse.json(
      {
        message,
        error: errorDetails,
      },
      { status: 500 }
    );
  }
};

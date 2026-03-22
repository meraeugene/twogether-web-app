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

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch public recommendations:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};

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
  } catch (error: any) {
    console.error("Error getting recommendations:", error);
    return new NextResponse(
      JSON.stringify({
        message: error.message,
        error: error.error,
      }),
      { status: 500 }
    );
  }
};

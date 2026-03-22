// /app/api/my-recos/route.ts

import { getCurrentUser } from "@/actions/authActions";
import { getMyRecommendations } from "@/actions/recommendationActions";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await getMyRecommendations(user.id);
    if (!data) {
      return NextResponse.json(
        { message: "No recommendations found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user, ...data }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch recommendations:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};

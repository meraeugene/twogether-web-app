import { getCurrentUser } from "@/actions/authActions";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const items = await getWatchlistByUserId(user.id);
    if (!items) {
      return NextResponse.json(
        { message: "No watchlist found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user, items }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch watchlist:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};

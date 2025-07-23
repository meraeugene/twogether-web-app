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

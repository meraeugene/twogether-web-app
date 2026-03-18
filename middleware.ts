import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/auth/callback",
    "/onboarding",
    "/recos/:path*",
    "/recommend/:path*",
    "/watch/:path*",
    "/watchlist/:path*",
    "/profile/:path*",
    "/friends/:path*",
    "/messages/:path*",
    "/my-recommendations/:path*",
    "/ai-recommend/:path*",
  ],
};

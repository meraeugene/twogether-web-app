import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function matchesProtectedPath(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>,
        ) {
          cookiesToSet.forEach(
            ({ name, value }: { name: string; value: string }) =>
              request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }: {
              name: string;
              value: string;
              options?: any;
            }) => supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // 1. Redirect unauthenticated users trying to access protected routes
  const protectedPages = [
    "/onboarding",
    "/recos",
    "/recommend",
    "/watch",
    "/watchlist",
    "/profile",
    "/friends",
    "/messages",
    "/my-recommendations",
    "/ai-recommend",
    "/watch-party",
  ];
  if (
    !user &&
    protectedPages.some((protectedPath) =>
      matchesProtectedPath(pathname, protectedPath)
    )
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const profile = user
    ? (
        await supabase
          .from("users")
          .select("onboarding_complete")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  // 2. Redirect authenticated users trying to access onboarding again
  if (user && pathname === "/onboarding") {
    if (profile?.onboarding_complete) {
      url.pathname = "/recos";
      return NextResponse.redirect(url);
    }
  }

  // 3. Redirect authenticated users who haven't completed onboarding (when accessing other pages)
  if (user && pathname !== "/onboarding") {
    if (!profile?.onboarding_complete) {
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  if (user && matchesProtectedPath(pathname, "/watch-party")) {
    const segments = pathname.split("/").filter(Boolean);
    const roomId = segments.length >= 2 ? segments[1] : null;

    if (roomId) {
      const { data: room, error: roomError } = await supabase
        .from("watch_party_rooms")
        .select("id, host_user_id, guest_user_id, access_type")
        .eq("id", roomId)
        .maybeSingle();

      if (!roomError && room && (room.access_type ?? "public") === "private") {
        const isDirectParticipant =
          room.host_user_id === user.id || room.guest_user_id === user.id;

        if (!isDirectParticipant) {
          const { data: friendship, error: friendshipError } = await supabase
            .from("friend_requests")
            .select("id")
            .or(
              `and(sender_id.eq.${room.host_user_id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${room.host_user_id})`
            )
            .eq("status", "accepted")
            .maybeSingle();

          if (!friendshipError && !friendship) {
            url.pathname = "/watch-party";
            url.searchParams.set("error", "private-room");
            return NextResponse.redirect(url);
          }
        }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CURRENT_USER_COOKIE, serializeCurrentUserSnapshot } from "@/utils/currentUserSnapshot";

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
          .select("onboarding_complete, username")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  if (user && profile?.username) {
    supabaseResponse.cookies.set(
      CURRENT_USER_COOKIE,
      serializeCurrentUserSnapshot({
        id: user.id,
        username: profile.username,
        email: user.email || null,
        full_name: user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      }),
      {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      },
    );
  } else {
    supabaseResponse.cookies.set(CURRENT_USER_COOKIE, "", {
      path: "/",
      sameSite: "lax",
      maxAge: 0,
    });
  }

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

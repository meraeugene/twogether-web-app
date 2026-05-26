"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { CurrentUser } from "@/types/user";
import { createClient } from "@/utils/supabase/client";
import {
  CURRENT_USER_COOKIE,
  serializeCurrentUserSnapshot,
} from "@/utils/currentUserSnapshot";

const PresenceManager = dynamic(() => import("@/components/PresenceManager"), {
  ssr: false,
});
const CookieConsentBanner = dynamic(
  () => import("@/components/CookieConsentBanner"),
  { ssr: false },
);

function writeCurrentUserCookie(user: CurrentUser | null) {
  if (typeof document === "undefined") return;

  if (!user) {
    document.cookie = `${CURRENT_USER_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  document.cookie =
    `${CURRENT_USER_COOKIE}=${serializeCurrentUserSnapshot(user)}; ` +
    "path=/; max-age=604800; samesite=lax";
}

export default function Header({
  initialUser,
}: {
  initialUser?: CurrentUser | null;
}) {
  const [user, setUser] = useState<CurrentUser | null | undefined>(initialUser);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const loadCurrentUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        writeCurrentUserCookie(null);
        if (cancelled) return;
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", authUser.id)
        .maybeSingle();

      const nextUser = {
        id: authUser.id,
        email: authUser.email || null,
        full_name: authUser.user_metadata?.full_name || "",
        avatar_url: authUser.user_metadata?.avatar_url || "",
        username: profile?.username || "",
      };

      writeCurrentUserCookie(nextUser);
      if (cancelled) return;
      setUser(nextUser);
    };

    void loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED") return;
      void loadCurrentUser();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname]);

  return (
    <>
      <Navbar user={user} />
      {user?.id && <PresenceManager userId={user.id} />}
      {user?.id && <CookieConsentBanner />}
    </>
  );
}

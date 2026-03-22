"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { CurrentUser } from "@/types/user";
import { createClient } from "@/utils/supabase/client";
import {
  CURRENT_USER_COOKIE,
  deserializeCurrentUserSnapshot,
  serializeCurrentUserSnapshot,
} from "@/utils/currentUserSnapshot";

const PresenceManager = dynamic(() => import("@/components/PresenceManager"), {
  ssr: false,
});
const CookieConsentBanner = dynamic(
  () => import("@/components/CookieConsentBanner"),
  { ssr: false },
);

function readCurrentUserCookie() {
  if (typeof document === "undefined") return undefined;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CURRENT_USER_COOKIE}=`));

  if (!cookie) return undefined;

  const [, value = ""] = cookie.split("=");
  return deserializeCurrentUserSnapshot(value) ?? undefined;
}

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

export default function Header() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(() =>
    readCurrentUserCookie(),
  );

  useEffect(() => {
    const supabase = createClient();

    const loadCurrentUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        writeCurrentUserCookie(null);
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
      setUser(nextUser);
    };

    void loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED") return;
      void loadCurrentUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Navbar user={user} />
      {user?.id && <PresenceManager userId={user.id} />}
      {user?.id && <CookieConsentBanner />}
    </>
  );
}

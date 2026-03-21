"use client";

import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { CurrentUser } from "@/types/user";
import PresenceManager from "@/components/PresenceManager";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { createClient } from "@/utils/supabase/client";

export default function Header({
  initialUser,
}: {
  initialUser: CurrentUser | null;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser);

  useEffect(() => {
    const supabase = createClient();

    const loadCurrentUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", authUser.id)
        .maybeSingle();

      setUser({
        id: authUser.id,
        email: authUser.email || null,
        full_name: authUser.user_metadata?.full_name || "",
        avatar_url: authUser.user_metadata?.avatar_url || "",
        username: profile?.username || "",
      });
    };

    loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadCurrentUser();
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

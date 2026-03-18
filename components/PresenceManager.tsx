"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PresenceManager({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const setOnline = async () => {
      if (!isActive || document.visibilityState !== "visible") return;

      await supabase.from("user_status").upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    };

    const setOffline = async () => {
      await supabase.from("user_status").upsert({
        user_id: userId,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void setOnline();
        return;
      }

      void setOffline();
    };

    const handlePageHide = () => {
      isActive = false;
      void setOffline();
    };

    const interval = setInterval(() => {
      void setOnline();
    }, 60_000);

    void setOnline();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      isActive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [userId]);

  return null;
}

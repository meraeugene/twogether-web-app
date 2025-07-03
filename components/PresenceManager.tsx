"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PresenceManager({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();

    // Mark user as online immediately
    const setOnline = async () => {
      await supabase.from("user_status").upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    };

    // Mark user offline on tab close
    const handleUnload = async () => {
      await supabase.from("user_status").upsert({
        user_id: userId,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
    };

    // Heartbeat every 30s
    const interval = setInterval(setOnline, 30_000);

    // Initial online mark
    setOnline();

    // Unload listener
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload(); // just in case
    };
  }, [userId]);

  return null;
}

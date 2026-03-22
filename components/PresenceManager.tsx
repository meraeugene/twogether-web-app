"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const LEADER_LEASE_MS = 90_000;
const HEARTBEAT_MS = 60_000;

export default function PresenceManager({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();
    const tabId = crypto.randomUUID();
    const leaderKey = `presence-leader:${userId}`;
    let isActive = true;
    let isLeader = false;

    const readLeader = () => {
      const raw = window.localStorage.getItem(leaderKey);
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw) as { id: string; expiresAt: number };
        if (!parsed.id || !parsed.expiresAt) return null;
        return parsed;
      } catch {
        return null;
      }
    };

    const writeLeader = () => {
      window.localStorage.setItem(
        leaderKey,
        JSON.stringify({
          id: tabId,
          expiresAt: Date.now() + LEADER_LEASE_MS,
        }),
      );
      isLeader = true;
    };

    const renewLeadership = () => {
      const leader = readLeader();
      const hasExpiredLeader = !leader || leader.expiresAt <= Date.now();

      if (hasExpiredLeader || leader?.id === tabId) {
        writeLeader();
        return true;
      }

      isLeader = false;
      return false;
    };

    const releaseLeadership = () => {
      const leader = readLeader();
      if (leader?.id === tabId) {
        window.localStorage.removeItem(leaderKey);
      }
      isLeader = false;
    };

    const setOnline = async () => {
      if (
        !isActive ||
        document.visibilityState !== "visible" ||
        !renewLeadership()
      ) {
        return;
      }

      await supabase.from("user_status").upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    };

    const setOffline = async () => {
      if (!isLeader) return;

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
      releaseLeadership();
    };

    const handlePageHide = () => {
      isActive = false;
      void setOffline();
      releaseLeadership();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== leaderKey) return;
      const leader = readLeader();
      isLeader = leader?.id === tabId;
    };

    const interval = setInterval(() => {
      void setOnline();
    }, HEARTBEAT_MS);

    void setOnline();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("storage", handleStorage);

    return () => {
      isActive = false;
      void setOffline();
      releaseLeadership();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  return null;
}

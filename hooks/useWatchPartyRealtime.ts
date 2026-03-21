"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { updateWatchPartyPresence } from "@/actions/watchPartyActions";

export function useWatchPartyRealtime({
  roomId,
  currentUserId,
  currentUserName,
  onMessageReceived,
  onTyping,
  onJoined,
  onLeft,
  onHostChanged,
  onInviteSent,
}: {
  roomId: string;
  currentUserId: string;
  currentUserName: string | null;
  onMessageReceived: () => void;
  onTyping: (userId: string) => void;
  onJoined: (userId: string, name: string) => void;
  onLeft: (name: string) => void;
  onHostChanged: (name: string) => void;
  onInviteSent: (name: string) => void;
}) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const joinedAnnouncementRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    const heartbeat = async (isOnline: boolean) => {
      try {
        await updateWatchPartyPresence({
          roomId,
          userId: currentUserId,
          isOnline,
        });
      } catch (error) {
        console.error("Presence update failed:", error);
      }
    };

    void heartbeat(true);

    const interval = setInterval(() => {
      if (active) void heartbeat(true);
    }, 30000);

    const handlePageHide = () => {
      active = false;
      void heartbeat(false);
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("pagehide", handlePageHide);
      void heartbeat(false);
    };
  }, [roomId, currentUserId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`watch-party-room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "new-message" }, onMessageReceived);

    channel.on("broadcast", { event: "typing" }, ({ payload }) => {
      const userId = payload?.userId as string | undefined;
      if (!userId || userId === currentUserId) return;
      onTyping(userId);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(""), 2000);
    });

    channel.on("broadcast", { event: "participant-joined" }, ({ payload }) => {
      const userId = payload?.userId as string | undefined;
      const name = (payload?.name as string | undefined) ?? "A member";
      if (!userId || userId === currentUserId) return;
      onJoined(userId, name);
    });

    channel.on("broadcast", { event: "participant-left" }, ({ payload }) => {
      const name = (payload?.name as string | undefined) ?? "A member";
      onLeft(name);
    });

    channel.on("broadcast", { event: "host-changed" }, ({ payload }) => {
      const name = (payload?.name as string | undefined) ?? "A member";
      onHostChanged(name);
    });

    channel.on("broadcast", { event: "invite-sent" }, ({ payload }) => {
      const name = (payload?.name as string | undefined) ?? "A friend";
      onInviteSent(name);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      channelRef.current = null;
      joinedAnnouncementRef.current = false;
    };
  }, [
    currentUserId,
    onHostChanged,
    onInviteSent,
    onJoined,
    onLeft,
    onMessageReceived,
    onTyping,
    roomId,
  ]);

  useEffect(() => {
    if (!channelRef.current || !currentUserName || joinedAnnouncementRef.current) {
      return;
    }

    joinedAnnouncementRef.current = true;
    channelRef.current.send({
      type: "broadcast",
      event: "participant-joined",
      payload: {
        userId: currentUserId,
        name: currentUserName,
      },
    });
  }, [currentUserId, currentUserName]);

  return channelRef;
}

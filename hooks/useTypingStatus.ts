import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useTypingStatus(threadId: string, currentUserId: string) {
  const supabase = createClient();
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const lastTyped = useRef(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const channel = supabase.channel(`typing:${threadId}`, {
      config: {
        broadcast: {
          self: false, // Ignore own broadcasts
        },
      },
    });

    channel.on("broadcast", { event: "typing" }, ({ payload }) => {
      if (!mountedRef.current) return;

      const userId = payload.userId;
      if (userId && userId !== currentUserId) {
        setTypingUserId(userId);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setTypingUserId(null);
          }
        }, 2000);
      }
    });

    channel.subscribe((status, err) => {
      if (err) {
        console.error("Subscription error:", err);
      } else {
        console.log("Subscribed with status:", status);
      }
    });

    channelRef.current = channel;

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId]);

  const sendTyping = () => {
    const now = Date.now();
    if (now - lastTyped.current < 2000) return;

    lastTyped.current = now;

    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId },
    });
  };

  return { typingUserId, sendTyping };
}

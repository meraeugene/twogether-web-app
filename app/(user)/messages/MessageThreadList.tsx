"use client";

import { getUserThreads } from "@/actions/social/messageActions";
import Image from "next/image";
import useSWR from "swr";
import { formatCompactTime } from "@/utils/messages/formatCompactTime";
import { MessageThread } from "@/types/messages";
import { useMessageSound } from "@/utils/messages/useMessageSound";
import { useEffect, useRef } from "react";
import { isEmojiOnly } from "@/utils/messages/isEmoji";

export default function MessageThreadList({
  userId,
  onSelectThread,
  activeThreadId,
}: {
  userId: string;
  onSelectThread: (
    threadId: string,
    otherUserId: string,
    avatarUrl: string,
    username: string,
    displayName: string,
    threadStatus: "active" | "pending",
  ) => void;
  activeThreadId: string | null;
}) {
  const { data: threads, isLoading } = useSWR(
    ["threads", userId],
    () => getUserThreads(userId),
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
    },
  );

  const playSound = useMessageSound();
  const lastMessageIdsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!threads) return;

    threads.forEach((thread: MessageThread) => {
      const lastSeenId = lastMessageIdsRef.current.get(thread.thread_id);
      const currentId = thread.last_message_id;

      const isNewMessage =
        thread.unread_count > 0 &&
        thread.last_message_sender_id !== userId &&
        currentId &&
        currentId !== lastSeenId;

      if (isNewMessage) {
        playSound();
        lastMessageIdsRef.current.set(thread.thread_id, currentId);
      }
    });
  }, [threads, userId, playSound]);

  if (isLoading) {
    return (
      <div className="border-t border-white/10  p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-white/5 p-2 animate-pulse"
          >
            <div className="h-11 w-11 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded bg-white/10" />
              <div className="h-3 w-3/4 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <p className="border-t border-white/10  p-4 text-center text-white/50">
        No conversations found.
      </p>
    );
  }

  return (
    <div className="space-y-2 border-t border-white/10  p-4 ">
      {threads.map((thread: MessageThread) => {
        const isSender = thread.last_message_sender_id === userId;

        let lastMessagePreview = "No messages yet";

        if (thread.last_message) {
          const isEmoji = isEmojiOnly(thread.last_message);

          lastMessagePreview = isEmoji
            ? isSender
              ? "You sent an emoji"
              : "Sent an emoji"
            : `${isSender ? "You: " : ""}${thread.last_message}`;
        }

        const isUnread =
          thread.unread_count > 0 && thread.last_message_sender_id !== userId;

        return (
          <button
            key={thread.thread_id}
            onClick={() => {
              if (thread.status === "active" || thread.status === "pending") {
                onSelectThread(
                  thread.thread_id,
                  thread.other_user_id,
                  thread.other_avatar_url || "",
                  thread.other_username || "",
                  thread.other_display_name,
                  thread.status,
                );
              }
            }}
            className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 transition ${
              activeThreadId === thread.thread_id
                ? "bg-white/10"
                : "hover:bg-white/5"
            }`}
          >
            <div className="h-11 w-11 overflow-hidden rounded-full">
              <Image
                width={44}
                unoptimized
                height={44}
                className="rounded-full object-cover"
                src={thread.other_avatar_url || "/default-avatar.png"}
                alt={thread.other_username || "User Avatar"}
              />
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-white">
                  {thread.other_display_name}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 text-[13px] line-clamp-1 ${
                  isUnread ? "text-white" : "text-white/50"
                }`}
              >
                <span>{lastMessagePreview}</span>

                {thread.last_message_created_at && (
                  <>
                    <span className="text-white/30">-</span>
                    <span>
                      {formatCompactTime(
                        new Date(thread.last_message_created_at),
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            {isUnread && (
              <div className="flex h-6 w-6 items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping opacity-75" />
                <div className="-ml-2.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-blue-500 z-10" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

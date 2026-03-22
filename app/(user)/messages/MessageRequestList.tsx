"use client";

import { getMessageRequests } from "@/actions/social/messageActions";
import useSWR from "swr";
import { formatCompactTime } from "@/utils/messages/formatCompactTime";
import Image from "next/image";
import { isEmojiOnly } from "@/utils/messages/isEmoji";

export default function MessageRequestList({
  currentUserId,
  direction,
  onSelectThread,
  activeThreadId,
}: {
  currentUserId: string;
  direction: "incoming" | "sent";
  onSelectThread: (
    threadId: string,
    otherUserId: string,
    avatarUrl: string,
    displayName: string,
    username: string,
    threadStatus: "active" | "pending" | undefined,
  ) => void;
  activeThreadId: string | null;
}) {
  const { data: allRequests, isLoading } = useSWR(
    "message-requests",
    getMessageRequests,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
    },
  );

  const filteredRequests = allRequests?.filter(
    (r) => r.direction === direction,
  );

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

  if (!filteredRequests || filteredRequests.length === 0) {
    return (
      <p className="border-t border-white/10 p-4 text-center text-white/50">
        {direction === "incoming"
          ? "No incoming message requests."
          : "No sent message requests."}
      </p>
    );
  }

  return (
    <div className="space-y-2 border-t border-white/10 p-4">
      {filteredRequests.map((request) => {
        const otherId =
          request.user1_id === currentUserId
            ? request.user2_id
            : request.user1_id;

        const timeAgo = request.latest_message_created_at
          ? formatCompactTime(new Date(request.latest_message_created_at))
          : "";

        const isSender = request.sender_id === currentUserId;

        let messagePreview = "No message";

        if (request.latest_message) {
          const isEmoji = isEmojiOnly(request.latest_message);
          messagePreview = isEmoji
            ? isSender
              ? "You sent an emoji"
              : "Sent an emoji"
            : `${isSender ? "You: " : ""}${request.latest_message}`;
        }

        return (
          <button
            key={request.thread_id}
            onClick={() =>
              onSelectThread(
                request.thread_id,
                otherId,
                request.other_user_avatar_url,
                request.other_user_display_name,
                request.other_user_username,
                request.status,
              )
            }
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 transition ${
              activeThreadId === request.thread_id
                ? "bg-white/10"
                : "hover:bg-white/5"
            }`}
          >
            <div className="h-11 w-11 overflow-hidden rounded-full">
              <Image
                src={request.other_user_avatar_url || "/default-avatar.png"}
                alt="avatar"
                width={44}
                unoptimized
                height={44}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 text-left">
              <p className="text-[15px] font-medium text-white">
                {request.other_user_display_name || "Unnamed"}
              </p>
              <div className="flex items-center gap-1 text-[13px] text-white/50">
                <span className="line-clamp-1">{messagePreview}</span>

                {timeAgo && <span className="text-white/30">- {timeAgo}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

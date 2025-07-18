"use client";

import { getMessageRequests } from "@/actions/messageActions";
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
    threadStatus: "active" | "pending" | undefined
  ) => void;
  activeThreadId: string | null;
}) {
  const { data: allRequests, isLoading } = useSWR(
    "message-requests",
    getMessageRequests
  );

  const filteredRequests = allRequests?.filter(
    (r) => r.direction === direction
  );

  if (isLoading) {
    return (
      <div className="border-t border-white/10  p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 animate-pulse rounded-xl bg-white/5"
          >
            <div className="w-11 h-11 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="w-1/2 h-3 bg-white/10 rounded" />
              <div className="w-3/4 h-3 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredRequests || filteredRequests.length === 0)
    return (
      <p className="text-white/50 text-center border-t border-white/10 p-4">
        {direction === "incoming"
          ? "No incoming message requests."
          : "No sent message requests."}
      </p>
    );

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
                request.status
              )
            }
            className={`flex cursor-pointer items-center gap-3 p-2 rounded-xl transition w-full ${
              activeThreadId === request.thread_id
                ? "bg-white/10"
                : "hover:bg-white/5"
            }`}
          >
            <div className="w-11 h-11 rounded-full overflow-hidden">
              <Image
                src={request.other_user_avatar_url || "/default-avatar.png"}
                alt="avatar"
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 text-left">
              <p className="text-white font-medium text-[15px]">
                {request.other_user_display_name || "Unnamed"}
              </p>
              <div className="text-white/50 text-[13px] flex items-center gap-1">
                <span className="line-clamp-1">{messagePreview}</span>

                {timeAgo && <span className="text-white/30">· {timeAgo}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { getMessageRequests } from "@/actions/messageActions";
import useSWR from "swr";
import { formatCompactTime } from "@/utils/messages/formatCompactTime";
import Image from "next/image";

export default function MessageRequestList({
  currentUserId,
  onSelectThread,
  activeThreadId,
}: {
  currentUserId: string;
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
  const { data: requests, isLoading } = useSWR(
    "message-requests",
    getMessageRequests
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

  if (!requests || requests.length === 0)
    return (
      <p className="text-white/50 text-center border-t border-white/10 p-4">
        No message requests.
      </p>
    );

  return (
    <div className="space-y-2 border-t border-white/10 p-4">
      {requests.map((request) => {
        const otherId =
          request.user1_id === currentUserId
            ? request.user2_id
            : request.user1_id;

        const timeAgo = request.first_message_created_at
          ? formatCompactTime(new Date(request.first_message_created_at))
          : "";

        return (
          <button
            key={request.id}
            onClick={() =>
              onSelectThread(
                request.id,
                otherId,
                request.requester_avatar_url,
                request.requester_display_name,
                request.requester_username,
                request.status
              )
            }
            className={`flex cursor-pointer items-center gap-3 p-2 rounded-xl transition w-full ${
              activeThreadId === request.id ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <Image
              src={request.requester_avatar_url || "/default-avatar.png"}
              alt="avatar"
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <p className="text-white font-medium text-[15px]">
                {request.requester_display_name || "Unnamed"}
              </p>

              <div className="text-white/50 text-[13px] flex items-center gap-1 ">
                <span className="line-clamp-1">{request.first_message}</span>
                {timeAgo && <span className="text-white/30">· {timeAgo}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

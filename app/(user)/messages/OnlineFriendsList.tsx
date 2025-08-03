"use client";

import { getOnlineFriends, getOrCreateThread } from "@/actions/messageActions";
import Image from "next/image";
import useSWR from "swr";

export default function OnlineFriendsList({
  currentUserId,
  onStartChat,
}: {
  currentUserId: string;
  onStartChat: (
    threadId: string,
    otherUserId: string,
    avatar: string | null,
    displayName: string,
    username: string,
    threadStatus: "active" | "pending"
  ) => void;
}) {
  const { data: friends, isLoading } = useSWR(
    "online-friends",
    getOnlineFriends
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

  if (!friends || friends.length === 0) {
    return (
      <p className="text-white/50 text-center border-t border-white/10 p-4">
        No online friends.
      </p>
    );
  }

  return (
    <div className="space-y-2 border-t border-white/10 p-4">
      {friends.map((friend) => (
        <button
          onClick={async () => {
            const thread = await getOrCreateThread(currentUserId, friend.id);
            onStartChat(
              thread.id,
              friend.id,
              friend.avatar_url,
              friend.display_name || "",
              friend.username || "",
              "active"
            );
          }}
          key={friend.id}
          className="flex cursor-pointer items-center gap-3 w-full p-2 rounded-xl hover:bg-white/10 transition-all duration-200 group relative"
        >
          {/* Avatar + Ping */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden">
              <Image
                src={friend.avatar_url || "/default-avatar.png"}
                alt={friend.display_name || friend.username}
                width={44}
                unoptimized
                height={44}
                className="rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
          </div>

          {/* Name + Username */}
          <div className="flex-1 text-left">
            <p className="text-white font-medium text-[15px] leading-none">
              {friend.display_name || friend.username}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-white/40 text-[13px]">@{friend.username}</p>
              <p className="text-green-400 text-[12px] font-medium">
                • Active now
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

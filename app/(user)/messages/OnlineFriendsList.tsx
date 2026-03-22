"use client";

import {
  getOnlineFriends,
  getOrCreateThread,
} from "@/actions/social/messageActions";
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
    threadStatus: "active" | "pending",
  ) => void;
}) {
  const { data: friends, isLoading } = useSWR(
    "online-friends",
    getOnlineFriends,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
    },
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

  if (!friends || friends.length === 0) {
    return (
      <p className="border-t border-white/10 p-4 text-center text-white/50">
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
              "active",
            );
          }}
          key={friend.id}
          className="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-white/10"
        >
          <div className="relative">
            <div className="h-11 w-11 overflow-hidden rounded-full">
              <Image
                src={friend.avatar_url || "/default-avatar.png"}
                alt={friend.display_name || friend.username}
                width={44}
                unoptimized
                height={44}
                className="rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black bg-green-500" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 opacity-75 animate-ping" />
          </div>

          <div className="flex-1 text-left">
            <p className="text-[15px] font-medium leading-none text-white">
              {friend.display_name || friend.username}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[13px] text-white/40">@{friend.username}</p>
              <p className="text-[12px] font-medium text-green-400">
                - Active now
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

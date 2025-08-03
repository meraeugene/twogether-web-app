"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { sendFriendRequest } from "@/actions/friendActions";
import { FaUserPlus, FaUser } from "react-icons/fa";
import { toast } from "sonner";
import { FriendRequestStatus } from "@/types/friends";

export function UserResultCard({
  user,
  currentUserId,
  status: initialStatus,
}: {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  currentUserId: string;
  status: FriendRequestStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<FriendRequestStatus>(initialStatus);

  const handleSendRequest = () => {
    setStatus("pending");

    startTransition(async () => {
      try {
        toast.success(`Friend request sent to @${user.username}`);
        await sendFriendRequest(currentUserId, user.id);
      } catch (err) {
        console.error("Error sending friend request:", err);
        toast.error("Failed to add friend.");
        setStatus(initialStatus);
      }
    });
  };

  return (
    <div className="bg-black border border-white/10 px-2 py-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <Image
          src={user.avatar_url || "/default-avatar.png"}
          unoptimized
          alt="avatar"
          width={48}
          height={48}
          className="rounded-full object-cover border border-white/20"
        />
        <div>
          <p className="text-white font-semibold text-base sm:text-lg">
            {user.display_name}
          </p>
          <p className="text-white/40 text-sm">@{user.username}</p>
        </div>
      </div>

      <div className="flex gap-3 sm:ml-auto">
        <Link
          href={`/profile/${user.username}/${user.id}`}
          className="text-sm px-4 py-2 border border-white/20 text-white rounded-md transition hover:border-white/40 hover:text-white flex items-center gap-2"
        >
          <FaUser />
          Profile
        </Link>

        <button
          onClick={handleSendRequest}
          disabled={isPending || status === "accepted" || status === "pending"}
          className={`
            text-sm cursor-pointer px-4 py-2 border rounded-md transition font-medium whitespace-nowrap flex items-center gap-2
            ${
              status === "pending"
                ? "text-green-500 border-green-500"
                : "text-white border-white/20 hover:border-red-500 hover:text-red-500"
            }
          `}
        >
          <FaUserPlus />
          {status === "pending" ? "Request Sent" : "Add Friend"}
        </button>
      </div>
    </div>
  );
}

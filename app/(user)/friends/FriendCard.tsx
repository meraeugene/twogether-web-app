"use client";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "@/actions/friendActions";
import Image from "next/image";
import { useState, useTransition } from "react";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaUserXmark } from "react-icons/fa6";
import Link from "next/link";
import MessageModal from "@/components/MessageModal";
import { getOrCreateThread, sendMessage } from "@/actions/messageActions";
import { useRouter } from "next/navigation";

export function FriendCard({
  name,
  username,
  avatarUrl,
  status,
  id,
  mutate,
  currentUserId,
}: {
  name: string;
  username: string;
  avatarUrl: string;
  id?: string;
  currentUserId: string;
  status: "friend" | "request" | "sent";
  mutate?: () => void;
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messagePending, startMessageTransition] = useTransition();

  const handleSendMessage = (content: string) => {
    startMessageTransition(async () => {
      if (!id || !currentUserId || !content.trim()) return;

      try {
        // Step 1: Ensure thread exists
        const thread = await getOrCreateThread(currentUserId, id);

        // Step 2: Send the message
        await sendMessage({
          threadId: thread.id,
          senderId: currentUserId,
          receiverId: id,
          content,
        });

        // Step 3: Close the modal
        setShowMessageModal(false);

        router.push(`/messages`);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    });
  };

  const handleAccept = () => {
    startTransition(async () => {
      if (!id || !currentUserId) return;
      await acceptFriendRequest(id, currentUserId);
      mutate?.();
    });
  };

  const handleUnfriend = () => {
    startTransition(async () => {
      if (!id || !currentUserId) return;
      await removeFriend(currentUserId, id);
      mutate?.();
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      if (!id || !currentUserId) return;
      await rejectFriendRequest(id, currentUserId);
      mutate?.();
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      if (!id || !currentUserId) return;
      await cancelFriendRequest(currentUserId, id);
      mutate?.();
    });
  };

  return (
    <motion.div className="p-4 bg-white/5 rounded-xl border border-white/10 gap-4">
      <div className="flex items-start gap-4 mb-5">
        <Image
          src={avatarUrl || "/default-avatar.png"}
          alt="avatar"
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-white">{name}</h2>
          <p className="text-white/50 text-sm">@{username}</p>
        </div>
      </div>

      {/* buttons go here */}
      {status === "friend" && (
        <div className="flex gap-2">
          <Link
            href={`/profile/${username}/${id}`}
            className="mt-1 cursor-pointer text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-2 transition"
          >
            <FaUser className="text-xs" />
            View Profile
          </Link>

          <button
            onClick={handleUnfriend}
            disabled={isPending}
            className="text-sm cursor-pointer px-3 py-1 rounded-full  bg-red-600 hover:bg-red-700 text-white transition flex gap-2 items-center "
          >
            <FaUserXmark className="text-white" />
            Unfriend
          </button>

          <button
            onClick={() => setShowMessageModal(true)}
            disabled={messagePending}
            className="text-sm cursor-pointer text-white/80 px-3 py-1 rounded-full bg-white/10 hover:bg-red-600 transition flex gap-2 items-center"
          >
            <FaEnvelope className="text-white" />
            Message
          </button>
        </div>
      )}
      {status === "request" && (
        <div className="flex gap-2">
          <Link
            href={`/profile/${username}/${id}`}
            className="mt-1 cursor-pointer text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-2 transition"
          >
            <FaUser className="text-xs" />
            View Profile
          </Link>

          <button
            onClick={handleAccept}
            disabled={isPending}
            className="cursor-pointer text-sm px-3 py-1 rounded-full bg-green-600 hover:bg-green-700 transition"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={isPending}
            className="cursor-pointer text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            Decline
          </button>
        </div>
      )}
      {status === "sent" && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="cursor-pointer text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-red-600 transition"
        >
          Cancel
        </button>
      )}

      <MessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={handleSendMessage}
        loading={messagePending}
      />
    </motion.div>
  );
}

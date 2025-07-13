"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import { useTypingStatus } from "@/hooks/useTypingStatus";
import {
  getThreadMessages,
  sendMessage,
  acceptMessageThread,
  deleteMessageThread,
  markMessagesSeen,
  markMessagesDelivered,
} from "@/actions/messageActions";
import { MessageItem } from "./MessageItem";
import CustomEmojiPicker from "./CustomEmojiPicker";
import { FaSmileWink } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export default function MessageThreadView({
  threadId,
  currentUserId,
  otherUserId,
  otherUserAvatar,
  otherUserDisplayName,
  otherUserUsername,
  threadStatus,
}: {
  threadId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserAvatar: string | null;
  otherUserDisplayName: string;
  otherUserUsername: string | null;
  threadStatus: "active" | "pending" | undefined;
}) {
  const {
    data: messages,
    mutate: mutateMessages,
    isLoading,
  } = useSWR(["thread", threadId], () => getThreadMessages(threadId), {
    refreshInterval: 2000,
  });

  useEffect(() => {
    if (!isLoading && messages?.length) {
      const markStatuses = async () => {
        try {
          await markMessagesDelivered(threadId, otherUserId);
          await markMessagesSeen(threadId, currentUserId);
          await mutate(["threads", currentUserId]);
        } catch (err) {
          console.error("Failed to mark messages delivered/seen", err);
        }
      };

      markStatuses();
    }
  }, [
    isLoading,
    messages,
    threadId,
    currentUserId,
    mutateMessages,
    otherUserId,
  ]);

  const { typingUserId, sendTyping } = useTypingStatus(threadId, currentUserId);

  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageToSend = input;
    setInput("");

    const newMessage = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content: messageToSend,
      created_at: new Date().toISOString(),
      seen: false,
      sender_avatar_url: null,
      receiver_avatar_url: null,
    };

    await mutateMessages(async (prev) => {
      await sendMessage({
        threadId,
        senderId: currentUserId,
        receiverId: otherUserId,
        content: messageToSend,
      });
      return [...(prev || []), newMessage];
    }, false);

    await mutate(["threads", currentUserId]);
  };

  const handleAccept = async () => {
    try {
      await acceptMessageThread(threadId);
      mutateMessages();
      window.location.reload();
    } catch (error) {
      console.error("Failed to accept thread", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessageThread(threadId);
      mutateMessages();
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete thread", err);
    }
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <Image
          src={otherUserAvatar || "/default-avatar.png"}
          alt={otherUserDisplayName}
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <span className="text-white">{otherUserDisplayName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-0 space-y-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages?.map((msg, i) => {
            const currentTime = new Date(msg.created_at); // Timestamp of current message
            const prevMsg = messages[i - 1]; // Previous message (if any)
            const nextMsg = messages[i + 1]; // Next message (if any)
            const prevTime = prevMsg ? new Date(prevMsg.created_at) : null; // Timestamp of previous message or null

            // Decide whether to insert a center timestamp (e.g., "Sunday 11:00 AM")
            // if it's the first message, or 5+ minutes have passed since the last message that inserted a timestamp
            const shouldInsertTimestamp = Boolean(
              i === 0 ||
                (prevTime &&
                  currentTime.getTime() - prevTime.getTime() > 5 * 60 * 1000)
            );

            // Determine if this is the first message of a group (based on sender or time gap)
            const isFirstOfGroup =
              i === 0 || // First message in the list
              prevMsg?.sender_id !== msg.sender_id || // Different sender than previous
              (prevTime
                ? currentTime.getTime() - prevTime.getTime() > 5 * 60 * 1000 // More than 5 mins since previous
                : false);

            // Determine if this is the last message of a group (based on sender or time gap)
            const isLastOfGroup =
              i === messages.length - 1 || // Last message in the list
              nextMsg?.sender_id !== msg.sender_id || // Next message is from a different sender
              (nextMsg
                ? new Date(nextMsg.created_at).getTime() -
                    currentTime.getTime() >
                  5 * 60 * 1000 // More than 5 mins until next message
                : false);

            return (
              <MessageItem
                key={msg.id}
                msg={msg}
                isSender={msg.sender_id === currentUserId}
                isFirstOfGroup={isFirstOfGroup}
                isLastOfGroup={isLastOfGroup}
                avatarUrl={
                  msg.sender_id === currentUserId
                    ? msg.receiver_avatar_url
                    : msg.sender_avatar_url
                }
                showCenterTimestamp={shouldInsertTimestamp}
                showStatus={
                  msg.sender_id === currentUserId && i === messages.length - 1
                }
              />
            );
          })
        ) : (
          <div className="text-center text-white/40 ">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Request prompt */}
      {threadStatus === "pending" && (
        <div className="border-t  border-white/10 mt-6 text-sm flex justify-center items-center flex-col  text-white">
          <div className="py-3 flex flex-col px-4 text-center text-sm">
            <span>
              Accept message request from{" "}
              <b>
                {otherUserDisplayName} ({otherUserUsername})
              </b>
              {""} ?
            </span>
            <span className="text-xs text-white/50 mt-1 mx-auto">
              If you accept, they will also be able to send you message.
            </span>
          </div>
          <div className="flex py-4 gap-4 border-t border-white/10 w-full justify-center items-center">
            <button
              onClick={handleDelete}
              className="text-red-500 cursor-pointer hover:bg-red-500/10 px-3 py-1 rounded transition"
            >
              Delete
            </button>

            <span className="text-white/20">|</span>

            <button
              onClick={handleAccept}
              className="text-white cursor-pointer hover:bg-white/10 px-3 py-1 rounded transition"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {typingUserId === otherUserId && (
        <div className="flex mt-6 items-center gap-2 px-4 text-white/60 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0s]" />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.15s]" />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.3s]" />
          </div>
          <span>{otherUserDisplayName} is typing...</span>
        </div>
      )}

      {/* Input */}
      {threadStatus !== "pending" && (
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="py-3 pt-6 px-4 flex gap-2"
        >
          {/* Input with emoji icon inside */}
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sendTyping();
              }}
              placeholder="Aa"
              className="w-full px-3 py-2 pr-10 rounded-full bg-white/10 text-white placeholder-white/40"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              <FaSmileWink />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  key="emoji-picker"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-2 z-50"
                >
                  <CustomEmojiPicker
                    onSelect={(emojiCode) => {
                      setInput((prev) => prev + " " + emojiCode + " ");
                      sendTyping();
                      setShowEmojiPicker(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send button */}
          <button
            type="submit"
            className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-full text-white hover:bg-white/20 transition"
          >
            <IoSend className="text-xl" />
          </button>
        </motion.form>
      )}
    </div>
  );
}

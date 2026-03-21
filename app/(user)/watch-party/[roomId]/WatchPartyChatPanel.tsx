"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import { FaSmileWink } from "react-icons/fa";
import { useEffect, useRef } from "react";
import CustomEmojiPicker from "@/app/(user)/messages/CustomEmojiPicker";
import { customEmojis } from "@/utils/messages/customEmoji";
import type { RoomMessage, RoomUser } from "./watchPartyRoomTypes";

function renderMessageContent(content: string) {
  return content
    .split(/(:\w+:)/g)
    .map((part, index) =>
      customEmojis[part] ? (
        <Image
          key={`${part}-${index}`}
          src={customEmojis[part]}
          alt={part}
          unoptimized
          width={56}
          height={56}
          className="inline-block h-auto w-[56px] object-cover align-middle"
          draggable={false}
        />
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );
}

export default function WatchPartyChatPanel({
  messages,
  currentUserId,
  currentUser,
  otherUser,
  typingUserId,
  typingUserName,
  input,
  showEmojiPicker,
  messagesEndRef,
  onInputChange,
  onSubmit,
  onToggleEmojiPicker,
  onEmojiSelect,
}: {
  messages: RoomMessage[];
  currentUserId: string;
  currentUser: RoomUser | null;
  otherUser: RoomUser | null;
  typingUserId: string | null;
  typingUserName: string | null;
  input: string;
  showEmojiPicker: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onToggleEmojiPicker: () => void;
  onEmojiSelect: (emojiCode: string) => void;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 176);
    textarea.style.height = `${Math.max(nextHeight, 48)}px`;
  }, [input]);

  return (
    <aside className="flex min-h-[620px] max-h-[78vh] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0B0B0B]/80 shadow-2xl backdrop-blur-3xl xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between border-b border-white/[0.03] bg-gradient-to-b from-white/[0.08] to-transparent px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/90">
            Live Discussion
          </p>
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
          {messages.length} msgs
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-8 overflow-x-hidden overflow-y-auto px-5 py-6">
        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          const isOnlyEmoji = message.content
            .split(/(:\w+:)/g)
            .every((part) => customEmojis[part] || part.trim() === "");
          const senderAvatar =
            message.sender?.avatar_url ||
            (isMine ? currentUser?.avatar_url : otherUser?.avatar_url) ||
            "/default-avatar.png";
          const senderName =
            message.sender?.display_name ||
            message.sender?.username ||
            (isMine
              ? currentUser?.display_name || currentUser?.username
              : otherUser?.display_name || otherUser?.username) ||
            "Member";
          const timeLabel = new Date(message.created_at).toLocaleTimeString(
            [],
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            },
          );

          return (
            <div
              key={message.id}
              className={`group flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[92%] min-w-0">
                <div
                  className={`flex items-end gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Image
                    src={senderAvatar}
                    alt={message.sender?.username || "user"}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full border border-white/20 object-cover shadow-sm"
                  />

                  <div
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                  >
                    <span className="mb-1 px-1 text-[11px] font-semibold text-white/70">
                      {senderName}
                    </span>

                    <div className="relative min-w-0">
                      <div
                        className={`max-w-full break-words px-4 py-3 text-[13px] leading-7 transition-all duration-300 [overflow-wrap:anywhere] sm:max-w-[22rem] xl:max-w-[20rem] ${
                          isOnlyEmoji
                            ? "border-none bg-transparent p-0 shadow-none scale-125"
                            : isMine
                              ? "rounded-[20px] rounded-br-none bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)]"
                              : "rounded-[20px] rounded-bl-none border border-white/10 bg-white/[0.05] text-white/90 backdrop-blur-md"
                        }`}
                      >
                        {renderMessageContent(message.content)}
                      </div>
                    </div>

                    <span
                      className={`mb-1 px-1 text-[11px] font-semibold text-white/70 mt-1 ${
                        isMine ? "right-full  " : "left-full "
                      }`}
                    >
                      {timeLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typingUserId && typingUserId !== currentUserId && (
          <div className="flex items-center gap-3 px-2 text-[10px] font-medium tracking-wide text-white/40">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-bounce [animation-delay:0s]" />
              <div className="w-1 h-1 rounded-full bg-red-500 animate-bounce [animation-delay:0.15s]" />
              <div className="w-1 h-1 rounded-full bg-red-500 animate-bounce [animation-delay:0.3s]" />
            </div>
            <span className="italic uppercase">
              {typingUserName || "Someone"} is typing
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="group relative flex items-end gap-2"
        >
          <div className="relative flex flex-1 items-end rounded-xl border border-white/10 bg-white/[0.03] pl-2 pr-1 shadow-inner transition-all duration-500 focus-within:border-red-500/40 focus-within:bg-white/[0.06]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              rows={1}
              className="min-h-[48px] max-h-44 flex-1 resize-none overflow-y-auto overflow-x-hidden bg-transparent px-3 py-3 text-sm font-light leading-6 text-white outline-none placeholder:text-white/20 [overflow-wrap:anywhere]"
              placeholder="Say something..."
            />

            <button
              type="button"
              onClick={onToggleEmojiPicker}
              className="mb-1.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/35 transition-all hover:bg-white/10 hover:text-white/80"
            >
              <FaSmileWink size={18} />
            </button>
          </div>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                key="emoji-picker"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-full right-0 z-50 mb-4 overflow-hidden rounded-xl border border-white/10 shadow-2xl"
              >
                <CustomEmojiPicker onSelect={onEmojiSelect} />
              </motion.div>
            )}
          </AnimatePresence>

          <button className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_5px_15px_rgba(220,38,38,0.3)] transition-all hover:scale-105 hover:bg-red-500 active:scale-95">
            <IoSend size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}

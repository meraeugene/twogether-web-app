"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import { FaSmileWink } from "react-icons/fa";
import { Crown } from "lucide-react";
import { useEffect, useRef } from "react";
import CustomEmojiPicker from "@/app/(user)/messages/CustomEmojiPicker";
import { customEmojis } from "@/utils/messages/customEmoji";
import type {
  RoomMessage,
  RoomUser,
} from "../../../../types/watchPartyRoomTypes";

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
  hostUserId,
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
  hostUserId: string;
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
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 176);
    textarea.style.height = `${Math.max(nextHeight, 48)}px`;
  }, [input]);

  const handleFormSubmit = async (event: React.FormEvent) => {
    await onSubmit(event);

    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  return (
    <aside className="relative flex min-h-[520px] max-h-[72vh] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[26px] sm:min-h-[620px] sm:max-h-[78vh] sm:rounded-[28px] xl:sticky xl:top-28 xl:h-[calc(100vh-8rem)] xl:max-h-[calc(100vh-8rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_18%,rgba(0,0,0,0.08)_100%)]" />

      <div className="relative flex items-center border-b border-white/[0.08] bg-gradient-to-b from-white/[0.1] to-transparent px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/90">
            Live Discussion
          </p>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="relative min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 xl:px-6 xl:py-7"
      >
        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          const isHost = message.sender_id === hostUserId;
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
              className={`group flex w-full ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div className="flex w-full min-w-0 flex-col">
                <div
                  className={`flex items-end ${isMine ? "justify-end" : "gap-3"}`}
                >
                  {!isMine ? (
                    <Image
                      src={senderAvatar}
                      alt={message.sender?.username || "user"}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 shrink-0 rounded-full border border-white/20 object-cover shadow-sm"
                    />
                  ) : null}

                  <div
                    className={`flex min-w-0 max-w-[88%] flex-col sm:max-w-[82%] xl:max-w-[26rem] 2xl:max-w-[30rem] ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`mb-1 flex items-center gap-2 px-1 text-[10px] font-semibold text-white/70 sm:text-[11px] ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{senderName}</span>
                      {isHost ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200">
                          <Crown className="h-2.5 w-2.5" />
                          Host
                        </span>
                      ) : null}
                    </div>

                    <div
                      className={`flex min-w-0 ${
                        isMine
                          ? "justify-end text-right"
                          : "justify-start text-left"
                      }`}
                    >
                      <div
                        className={`w-fit max-w-full whitespace-pre-wrap break-words px-3 py-2.5 text-[12px] leading-6 transition-all duration-300 [overflow-wrap:anywhere] sm:px-4 sm:py-3 sm:text-[13px] sm:leading-7 ${
                          isOnlyEmoji
                            ? "border-none bg-transparent p-0 shadow-none"
                            : isMine
                              ? "rounded-[22px] rounded-br-md bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white shadow-[0_16px_36px_-16px_rgba(220,38,38,0.75)]"
                              : "rounded-[20px] rounded-bl-none border border-white/10 bg-white/[0.05] text-white/90 backdrop-blur-md"
                        }`}
                      >
                        {renderMessageContent(message.content)}
                      </div>
                    </div>

                    <span
                      className={`mt-1 block px-1 text-[10px] font-semibold text-white/60 sm:text-[11px] sm:text-white/70 ${
                        isMine
                          ? "ml-auto w-fit text-right"
                          : "mr-auto w-fit text-left"
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

      <div className="relative bg-gradient-to-t from-white/[0.08] via-white/[0.03] to-transparent p-3 sm:p-5">
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="group relative grid grid-cols-[minmax(0,1fr)_52px] items-end gap-2 sm:flex sm:items-end"
        >
          <div className="relative min-w-0 flex min-h-[52px] items-end rounded-xl border border-white/12 bg-white/[0.04] pl-2 pr-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 focus-within:border-red-500/40 focus-within:bg-white/[0.08] sm:min-h-[48px] sm:flex-1 xl:rounded-2xl">
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
              className="min-h-[48px] max-h-40 flex-1 resize-none overflow-y-auto overflow-x-hidden bg-transparent px-2.5 py-3 text-sm font-light leading-6 text-white outline-none placeholder:text-white/20 [overflow-wrap:anywhere] sm:min-h-[48px] sm:max-h-44 sm:px-3 sm:py-3"
              placeholder="Say something..."
            />

            <button
              type="button"
              onClick={onToggleEmojiPicker}
              className="mb-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/35 transition-all hover:bg-white/10 hover:text-white/80 sm:mb-1.5 sm:h-10 sm:w-10"
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

          <button
            disabled={!input.trim()}
            className="flex h-[52px] w-[52px] shrink-0 self-end cursor-pointer items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_5px_15px_rgba(220,38,38,0.3)] transition-all hover:scale-105 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 sm:h-12 sm:w-12"
          >
            <IoSend size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}

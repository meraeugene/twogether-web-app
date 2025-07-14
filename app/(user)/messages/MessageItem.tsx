import Image from "next/image";
import { getMessageBubbleClasses } from "@/utils/messages/getMessageBubbleClasses";
import { formatCenterTimestamp } from "@/utils/messages/formatCenterTimestamp";
import { formatCompactTime } from "@/utils/messages/formatCompactTime";
import { Message } from "@/types/messages";
import { customEmojis } from "@/utils/messages/customEmoji";

export function MessageItem({
  msg,
  isSender,
  isFirstOfGroup,
  isLastOfGroup,
  avatarUrl,
  showCenterTimestamp = false,
  showStatus = false,
}: {
  msg: Message;
  isSender: boolean;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  avatarUrl: string | null;
  showCenterTimestamp?: boolean;
  showStatus?: boolean;
}) {
  const time = new Date(msg.created_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const relativeTime = formatCompactTime(new Date(msg.created_at));

  const statusLabel =
    msg.status === "seen"
      ? "Seen"
      : msg.status === "delivered"
      ? "Delivered"
      : "Sent";

  function renderMessageContent(content: string) {
    return content
      .split(/(:\w+:)/g)
      .map((part, i) =>
        customEmojis[part] ? (
          <Image
            key={i}
            src={customEmojis[part]}
            alt={part}
            width={72}
            height={72}
            className="inline-block align-middle object-cover"
            draggable={false}
          />
        ) : (
          <span key={i}>{part}</span>
        )
      );
  }

  const isOnlyEmoji = msg.content
    .split(/(:\w+:)/g)
    .every((p) => customEmojis[p] || p.trim() === "");

  return (
    <div>
      {showCenterTimestamp && (
        <div className="text-center text-xs text-white/50 my-4">
          {formatCenterTimestamp(msg.created_at)}
        </div>
      )}

      <div
        className={`flex items-end gap-2 ${
          isSender ? "justify-end" : "justify-start"
        }`}
      >
        {/* Avatar */}
        {!isSender && isLastOfGroup ? (
          <Image
            width={32}
            height={32}
            src={avatarUrl || "/default-avatar.png"}
            alt="user"
            className="rounded-full"
          />
        ) : (
          !isSender && <div className="w-[32px] h-[32px]" />
        )}

        {/* Bubble + time + status */}
        <div className="max-w-[70%] flex flex-col items-end gap-1 group">
          <div className="flex items-center gap-1">
            {isSender && (
              <span className="text-[12px]  hidden lg:block   text-white/40 opacity-0 group-hover:opacity-100 transition">
                {time}
              </span>
            )}

            <div
              className={getMessageBubbleClasses({
                isSender,
                isFirstOfGroup,
                isLastOfGroup,
                isOnlyEmoji,
              })}
            >
              {renderMessageContent(msg.content)}
            </div>

            {!isSender && (
              <span className="text-[12px] hidden lg:block text-white/40 opacity-0 group-hover:opacity-100 transition">
                {time}
              </span>
            )}
          </div>

          {/* Status below bubble */}
          {isSender && showStatus && (
            <span className="text-xs text-white/30 pl-2 text-right w-full">
              {statusLabel} {relativeTime} ago
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

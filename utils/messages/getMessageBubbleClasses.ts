export function getMessageBubbleClasses({
  isSender,
  isFirstOfGroup,
  isLastOfGroup,
  isOnlyEmoji = false,
}: {
  isSender: boolean;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  isOnlyEmoji?: boolean;
}) {
  const base = isOnlyEmoji ? "text-[15px]" : "px-4 py-2 text-[15px] ";
  const color = isOnlyEmoji
    ? "bg-transparent text-white"
    : isSender
    ? "bg-red-600 text-white self-end"
    : "bg-white/10 text-white";

  const corners = (() => {
    if (isFirstOfGroup && isLastOfGroup) return "rounded-4xl";
    if (isFirstOfGroup) {
      return isSender
        ? "rounded-bl-4xl rounded-tl-4xl rounded-tr-4xl rounded-br-md"
        : "rounded-tr-4xl rounded-br-4xl rounded-tl-4xl rounded-bl-md";
    }
    if (isLastOfGroup) {
      return isSender
        ? "rounded-bl-4xl rounded-tl-4xl rounded-br-4xl rounded-tr-md"
        : "rounded-br-4xl rounded-tr-4xl rounded-tl-md rounded-bl-4xl";
    }
    return isSender
      ? "rounded-tl-4xl rounded-br-md rounded-bl-4xl rounded-tr-md"
      : "rounded-tl-md rounded-br-4xl rounded-bl-md rounded-tr-4xl";
  })();

  return `${base} ${color} ${corners}`;
}

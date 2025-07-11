export function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();

  // Match native emoji characters
  const nativeEmojiRegex =
    /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Extended_Pictographic}|\s)+$/u;

  // Match custom emoji codes like :happycat:
  const customEmojiRegex = /^(:[a-zA-Z0-9_]+:)+$/;

  return nativeEmojiRegex.test(trimmed) || customEmojiRegex.test(trimmed);
}

import type { MessageThread } from "@/types/messages";

type NotificationThread = Pick<MessageThread, "last_message_id" | "last_message_sender_id" | "unread_count">;

export function getMessageNotifications(
  threads: NotificationThread[],
  previous: ReadonlySet<string> | null,
  userId: string,
) {
  const seenMessageIds = new Set(previous);
  let shouldNotify = false;

  for (const thread of threads) {
    const id = thread.last_message_id;
    if (!id) continue;
    // The first snapshot establishes a silent baseline, including old unread messages.
    if (previous !== null && !seenMessageIds.has(id) && thread.unread_count > 0 &&
      thread.last_message_sender_id !== null && thread.last_message_sender_id !== userId) {
      shouldNotify = true;
    }
    seenMessageIds.add(id);
  }

  return { seenMessageIds, shouldNotify };
}

export type MessageThread = {
  thread_id: string;
  user1_id: string;
  user2_id: string;
  last_message_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_message_created_at: string | null;
  last_message_sender_id: string | null;
  other_user_id: string;
  other_display_name: string;
  other_username: string | null;
  other_avatar_url: string | null;
  status: "active" | "pending" | "archived" | null;
  unread_count: number;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_username: string;
  sender_avatar_url: string | null;
  receiver_id: string;
  receiver_username: string;
  receiver_avatar_url: string | null;
  content: string;
  created_at: string;
  seen: boolean;
  status: "sent" | "delivered" | "seen";
};

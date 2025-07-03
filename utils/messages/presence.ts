import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function setUserOnline(userId: string) {
  await supabase.from("user_status").upsert({
    user_id: userId,
    is_online: true,
    last_seen: new Date().toISOString(),
  });
}

export async function setUserOffline(userId: string) {
  await supabase.from("user_status").upsert({
    user_id: userId,
    is_online: false,
    last_seen: new Date().toISOString(),
  });
}

export function subscribeToUserPresence(
  onUpdate: (userId: string, isOnline: boolean) => void
) {
  const channel = supabase
    .channel("user-status")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "user_status" },
      (payload) => {
        const { user_id, is_online } = payload.new;
        onUpdate(user_id, is_online);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

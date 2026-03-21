"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { LoaderCircle } from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
  getUnreadNotificationCount,
  getUserNotifications,
  respondWatchPartyInvite,
} from "@/actions/watchPartyActions";
import useSWR from "swr";
import { NotificationItem } from "@/types/notification";
import { formatCompactTime } from "@/utils/messages/formatCompactTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAudioCue } from "@/hooks/useAudioCue";

function getInviteId(notification: NotificationItem) {
  const metadata = notification.metadata ?? {};
  const raw = metadata["invite_id"];
  if (typeof raw === "string") return raw;

  if (notification.link) {
    try {
      const base = "https://twogether.local";
      const parsed = new URL(notification.link, base);
      return parsed.searchParams.get("invite");
    } catch {
      return null;
    }
  }

  return null;
}

function NotificationRow({
  notification,
  userId,
  onResponded,
}: {
  notification: NotificationItem;
  userId: string;
  onResponded: (notification: NotificationItem) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const inviteId =
    notification.type === "watch_party_invite"
      ? getInviteId(notification)
      : null;

  const handleAccept = () => {
    if (!inviteId) return;
    const inviterName =
      notification.actor?.display_name ||
      notification.actor?.username ||
      "Your friend";

    startTransition(async () => {
      try {
        const result = await respondWatchPartyInvite({
          inviteId,
          userId,
          action: "accepted",
        });

        await markNotificationRead(notification.id, userId);
        onResponded(notification);
        toast.success(`You accepted ${inviterName}'s invite.`);

        if (result.roomId) {
          router.push(`/watch-party/${result.roomId}`);
        }
      } catch (error) {
        console.error("Failed to respond invite:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to respond to invite.",
        );
      }
    });
  };

  const titleTone =
    notification.type === "watch_party_invite_accepted"
      ? "text-emerald-400"
      : notification.type === "watch_party_invite_rejected"
        ? "text-red-400"
        : "text-white";

  return (
    <div
      className={`rounded-xl border p-3 ${
        notification.is_read
          ? "border-white/10 bg-white/[0.02]"
          : "border-white/20 bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${titleTone}`}>
          {notification.title}
        </p>
        <span className="text-[11px] text-white/45 shrink-0">
          {formatCompactTime(new Date(notification.created_at))}
        </span>
      </div>

      {notification.body && (
        <p className="mt-1 text-sm text-white/70">Title: {notification.body}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {notification.type === "watch_party_invite" &&
        inviteId &&
        !notification.is_read ? (
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="px-2.5 py-1 text-xs rounded-lg cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500 transition"
          >
            <span className="inline-flex items-center gap-1.5">
              {isPending ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept"
              )}
            </span>
          </button>
        ) : notification.link ? (
          <Link
            href={notification.link}
            onClick={async () => {
              if (!notification.is_read) {
                await markNotificationRead(notification.id, userId);
                onResponded(notification);
              }
            }}
            className="px-2.5 py-1 text-xs rounded-lg cursor-pointer bg-white/10 text-white/80 hover:bg-white/20 transition"
          >
            Open
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const previousUnreadRef = useRef<number | null>(null);
  const playNotificationSound = useAudioCue("/sounds/message.mp3", 0.5);

  const {
    data: notifications,
    mutate: mutateNotifications,
    isLoading,
  } = useSWR(
    ["notifications", userId],
    () => getUserNotifications(userId, 25),
    {
      refreshInterval: 5000,
    },
  );

  const { data: unreadCount, mutate: mutateUnread } = useSWR(
    ["notifications-unread", userId],
    () => getUnreadNotificationCount(userId),
    { refreshInterval: 5000 },
  );

  const filtered = useMemo(() => notifications ?? [], [notifications]);

  useEffect(() => {
    const nextUnread = unreadCount ?? 0;

    if (
      previousUnreadRef.current !== null &&
      nextUnread > previousUnreadRef.current
    ) {
      playNotificationSound();
    }

    previousUnreadRef.current = nextUnread;
  }, [playNotificationSound, unreadCount]);

  const refreshAll = () => {
    mutateNotifications();
    mutateUnread();
  };

  const handleInviteResponded = (notification: NotificationItem) => {
    mutateNotifications(
      (prev) =>
        (prev ?? []).map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      { revalidate: false },
    );

    mutateUnread(
      (prev) => Math.max((prev ?? 0) - (notification.is_read ? 0 : 1), 0),
      { revalidate: false },
    );

    refreshAll();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className={`group relative flex items-center justify-center w-[40px] h-[40px] rounded-[11px] text-[19px] transition-all duration-150 cursor-pointer ${
          open
            ? "bg-white/[0.12] text-white ring-1 ring-white/20"
            : "lg:text-white/50 hover:text-white hover:bg-white/[0.08]"
        }`}
      >
        <IoNotificationsOutline />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-[18px] text-center">
            {(unreadCount ?? 0) > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-20 z-[120] max-h-[min(75vh,32rem)] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0a0a0c] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:left-auto sm:w-[min(26rem,calc(100vw-2rem))] md:right-4 md:top-20 xl:absolute xl:right-0 xl:top-[calc(100%+12px)]">
          {/* Subtle Grain/Noise Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

          <div className="relative p-5">
            {/* Header Section */}
            <div className="flex items-center justify-between gap-2 mb-5 px-1">
              <div>
                <h3 className="text-[15px] font-medium tracking-tight text-white/90">
                  Notifications
                </h3>
                {(unreadCount ?? 0) > 0 && (
                  <p className="text-[10px] uppercase tracking-[0.05em] text-blue-400 font-semibold">
                    {unreadCount} New
                  </p>
                )}
              </div>

              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={async () => {
                    await markAllNotificationsRead(userId);
                    refreshAll();
                  }}
                  className="text-[12px] font-medium text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Scrollable Area */}
            <div className="max-h-[calc(min(75vh,32rem)-7rem)] space-y-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-white/30 text-xs font-medium tracking-wide">
                    Refining updates...
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-3 opacity-20">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-white"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <p className="text-white/40 text-[13px] font-medium">
                    All caught up
                  </p>
                </div>
              ) : (
                <div className="grid gap-1">
                  {filtered.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      userId={userId}
                      onResponded={handleInviteResponded}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional: Expensive Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0c] to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
}

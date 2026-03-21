"use client";

import { useCallback, useEffect, useRef, useTransition, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { IoNotificationsOutline } from "react-icons/io5";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  respondWatchPartyInvite,
} from "@/actions/watchPartyActions";
import type { NotificationItem } from "@/types/notification";
import { formatCompactTime } from "@/utils/messages/formatCompactTime";
import { useAudioCue } from "@/hooks/useAudioCue";
import { createClient } from "@/utils/supabase/client";

function getInviteId(notification: NotificationItem) {
  const metadata = notification.metadata ?? {};
  const raw = metadata["invite_id"];
  return typeof raw === "string" ? raw : null;
}

function MovieThumb({
  title,
  posterUrl,
}: {
  title: string;
  posterUrl?: string | null;
}) {
  return (
    <div className="relative min-h-[124px] w-24 shrink-0 self-stretch overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] sm:w-28">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-700/20 via-white/[0.04] to-black text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
          Movie
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  userId,
  onMutate,
}: {
  notification: NotificationItem;
  userId: string;
  onMutate: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const inviteId =
    notification.type === "watch_party_invite"
      ? getInviteId(notification)
      : null;
  const actorName =
    notification.actor?.display_name ||
    notification.actor?.username ||
    "Twogether";
  const movieTitle =
    notification.movie?.title || notification.body || "Watch Party";
  const displayTitle =
    notification.type === "watch_party_invite"
      ? `${actorName} invited you to watch ${movieTitle} together`
      : notification.title;

  const markRead = async () => {
    if (notification.is_read) return;
    await markNotificationRead(notification.id, userId);
    onMutate();
  };

  const handleAccept = () => {
    if (!inviteId) return;

    startTransition(async () => {
      try {
        const result = await respondWatchPartyInvite({
          inviteId,
          userId,
          action: "accepted",
        });
        await markRead();
        toast.success(`You accepted ${actorName}'s invite.`);
        onMutate();
        if (result.roomId) router.push(`/watch-party/${result.roomId}`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to respond to invite.";
        if (message.includes("Leave that room first")) {
          toast.info(message);
          return;
        }
        toast.error(message);
      }
    });
  };

  return (
    <div
      className={`rounded-[24px] border p-3 transition ${
        notification.is_read
          ? "border-white/10 bg-white/[0.03]"
          : "border-red-500/20 bg-linear-to-br from-red-600/[0.12] via-white/[0.05] to-transparent"
      }`}
    >
      <div className="flex items-stretch gap-3">
        <MovieThumb
          title={movieTitle}
          posterUrl={notification.movie?.poster_url}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Notification
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-white">
                {displayTitle}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-white/40">
              {formatCompactTime(new Date(notification.created_at))}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {notification.type === "watch_party_invite" &&
            inviteId &&
            !notification.is_read ? (
              <button
                onClick={handleAccept}
                disabled={isPending}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Accepting...
                  </span>
                ) : (
                  "Accept Invite"
                )}
              </button>
            ) : null}

          </div>
        </div>
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
  } = useSWR(["notifications", userId], () => getUserNotifications(userId, 25), {
    refreshInterval: 12000,
  });

  const { data: unreadCount, mutate: mutateUnread } = useSWR(
    ["notifications-unread", userId],
    () => getUnreadNotificationCount(userId),
    { refreshInterval: 12000 },
  );

  const refreshAll = useCallback(() => {
    void mutateNotifications();
    void mutateUnread();
  }, [mutateNotifications, mutateUnread]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_user_id=eq.${userId}`,
        },
        () => refreshAll(),
      );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshAll, userId]);

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

  const items = notifications ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);

          if (nextOpen) {
            refreshAll();
          }
        }}
        aria-label="Notifications"
        className={`group relative flex h-[40px] w-[40px] items-center justify-center rounded-[11px] text-[19px] transition-all duration-150 cursor-pointer ${
          open
            ? "bg-white/[0.12] text-white ring-1 ring-white/20"
            : "lg:text-white/50 hover:text-white hover:bg-white/[0.08]"
        }`}
      >
        <IoNotificationsOutline />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -right-1.5 -top-1.5 h-[18px] min-w-[18px] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-[18px] text-white">
            {(unreadCount ?? 0) > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-20 z-[120] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#09090b]/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:left-auto sm:w-[min(28rem,calc(100vw-2rem))] xl:absolute xl:right-0 xl:top-[calc(100%+12px)]">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_45%)]" />

          <div className="relative p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Notifications
              </h3>

              {(unreadCount ?? 0) > 0 ? (
                <button
                  onClick={async () => {
                    await markAllNotificationsRead(userId);
                    refreshAll();
                  }}
                  className="text-xs font-semibold text-white/45 transition hover:text-white"
                >
                  Mark all as read
                </button>
              ) : null}
            </div>

            <div className="max-h-[min(70vh,34rem)] space-y-3 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
                  <p className="mt-3 text-xs font-medium tracking-wide text-white/35">
                    Loading updates...
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
                  <p className="text-base font-semibold text-white/75">
                    No notifications yet
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/40">
                    Fresh watch party activity will show up here automatically.
                  </p>
                </div>
              ) : (
                items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    userId={userId}
                    onMutate={refreshAll}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

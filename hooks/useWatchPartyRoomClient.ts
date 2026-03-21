"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import {
  createWatchPartyInvite,
  getInviteableFriends,
  getWatchPartyMessages,
  getWatchPartyRoom,
  leaveWatchPartyRoom,
  sendWatchPartyMessage,
} from "@/actions/watchPartyActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import type {
  RoomData,
  RoomMessage,
  RoomUser,
} from "@/types/watchPartyRoomTypes";
import { useWatchPartyRealtime } from "./useWatchPartyRealtime";
import { useAudioCue } from "@/hooks/useAudioCue";

type Friend = RoomUser;

function shortRoomCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function useWatchPartyRoomClient({
  room,
  currentUserId,
}: {
  room: RoomData;
  currentUserId: string;
}) {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [isInviting, startInviting] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastTypedRef = useRef(0);
  const router = useRouter();
  const playRoomSound = useAudioCue("/sounds/message.mp3", 0.55);

  const { data: liveRoom, mutate: mutateRoom } = useSWR<RoomData | null>(
    ["watch-party-room", room.id, currentUserId],
    () => getWatchPartyRoom(room.id, currentUserId) as Promise<RoomData | null>,
    { refreshInterval: 2500 },
  );

  const currentRoom = liveRoom ?? room;
  const isHost = currentRoom.host_user_id === currentUserId;
  const privateRoomCode =
    currentRoom.access_type === "private"
      ? shortRoomCode(currentRoom.id)
      : null;

  const allKnownUsers = useMemo(() => {
    const map = new Map<string, RoomUser>();
    [currentRoom.host, currentRoom.guest, ...(currentRoom.viewers ?? [])]
      .filter(Boolean)
      .forEach((user) => {
        if (user) map.set(user.id, user);
      });
    return [...map.values()];
  }, [currentRoom.guest, currentRoom.host, currentRoom.viewers]);

  const currentUser = useMemo(
    () => allKnownUsers.find((user) => user.id === currentUserId) ?? null,
    [allKnownUsers, currentUserId],
  );

  const otherUser = useMemo(
    () =>
      [currentRoom.host, currentRoom.guest]
        .filter(Boolean)
        .find((user) => user?.id !== currentUserId) ?? null,
    [currentRoom.guest, currentRoom.host, currentUserId],
  );

  const visibleViewers = useMemo(
    () =>
      (currentRoom.viewers ?? []).filter(
        (viewer) => viewer.id !== currentUserId,
      ),
    [currentRoom.viewers, currentUserId],
  );

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    allKnownUsers.forEach((user) => {
      map.set(user.id, user.display_name || user.username);
    });
    return map;
  }, [allKnownUsers]);

  const alreadyInRoomIds = useMemo(
    () =>
      new Set(
        [currentRoom.host, currentRoom.guest, ...(currentRoom.viewers ?? [])]
          .filter(Boolean)
          .map((user) => user!.id),
      ),
    [currentRoom.guest, currentRoom.host, currentRoom.viewers],
  );

  const { data: messages = [], mutate: mutateMessages } = useSWR<RoomMessage[]>(
    ["watch-party-messages", room.id],
    () => getWatchPartyMessages(room.id, currentUserId),
    { refreshInterval: 5000 },
  );

  const {
    data: friends,
    isLoading: isLoadingFriends,
    mutate: mutateFriends,
  } = useSWR<Friend[]>(
    isInviteOpen
      ? ["watch-party-friends", currentUserId, currentRoom.id]
      : null,
    () => getInviteableFriends(currentUserId, currentRoom.id),
  );

  const filteredFriends = useMemo(() => {
    const list = friends ?? [];
    if (!inviteQuery.trim()) return list;
    const lower = inviteQuery.toLowerCase();
    return list.filter((friend) => {
      const displayName = (friend.display_name ?? "").toLowerCase();
      return (
        friend.username.toLowerCase().includes(lower) ||
        displayName.includes(lower)
      );
    });
  }, [friends, inviteQuery]);

  const handleMessageReceived = useCallback(() => {
    playRoomSound();
    mutateMessages();
  }, [mutateMessages, playRoomSound]);

  const handleTypingEvent = useCallback((userId: string) => {
    setTypingUserId(userId || null);
  }, []);

  const handleJoined = useCallback(
    (_userId: string, name: string) => {
      playRoomSound();
      toast.success(`${name} joined the room.`);
      mutateRoom();
    },
    [mutateRoom, playRoomSound],
  );

  const handleLeft = useCallback(
    (name: string) => {
      toast(`${name} left the room.`);
      mutateRoom();
    },
    [mutateRoom],
  );

  const handleHostChanged = useCallback(
    (name: string) => {
      toast(`${name} is now the host.`);
      mutateRoom();
    },
    [mutateRoom],
  );

  const handleInviteSentToast = useCallback((name: string) => {
    toast(`Invite sent to ${name}.`);
  }, []);

  const channelRef = useWatchPartyRealtime({
    roomId: room.id,
    currentUserId,
    currentUserName: currentUser?.display_name || currentUser?.username || null,
    onMessageReceived: handleMessageReceived,
    onTyping: handleTypingEvent,
    onJoined: handleJoined,
    onLeft: handleLeft,
    onHostChanged: handleHostChanged,
    onInviteSent: handleInviteSentToast,
  });

  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypedRef.current < 2000) return;
    lastTypedRef.current = now;
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId },
    });
  }, [channelRef, currentUserId]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      sendTyping();
    },
    [sendTyping],
  );

  const handleEmojiSelect = useCallback(
    (emojiCode: string) => {
      setInput((prev) => prev + " " + emojiCode + " ");
      sendTyping();
      setShowEmojiPicker(false);
    },
    [sendTyping],
  );

  const handleSend = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;

      setInput("");
      const optimistic: RoomMessage = {
        id: crypto.randomUUID(),
        room_id: room.id,
        sender_id: currentUserId,
        content: trimmed,
        created_at: new Date().toISOString(),
        sender: currentUser,
      };

      await mutateMessages(
        async (prev = []) => {
          await sendWatchPartyMessage({
            roomId: room.id,
            senderId: currentUserId,
            content: trimmed,
          });
          channelRef.current?.send({
            type: "broadcast",
            event: "new-message",
            payload: { roomId: room.id },
          });
          return [...prev, optimistic];
        },
        { revalidate: false },
      );
    },
    [channelRef, currentUser, currentUserId, input, mutateMessages, room.id],
  );

  const handleLeave = useCallback(async () => {
    if (isLeaving) return;
    setIsLeaving(true);

    try {
      channelRef.current?.send({
        type: "broadcast",
        event: "participant-left",
        payload: {
          userId: currentUserId,
          name:
            currentUser?.display_name || currentUser?.username || "A member",
        },
      });

      if (isHost && otherUser) {
        channelRef.current?.send({
          type: "broadcast",
          event: "host-changed",
          payload: {
            userId: otherUser.id,
            name: otherUser.display_name || otherUser.username || "A member",
          },
        });
      }

      await leaveWatchPartyRoom({
        roomId: currentRoom.id,
        userId: currentUserId,
      });
      router.push("/watch-party");
      router.refresh();
    } catch (error) {
      console.error("Failed to leave room:", error);
      toast.error("Failed to leave room.");
      setIsLeaving(false);
    }
  }, [
    channelRef,
    currentRoom.id,
    currentUser,
    currentUserId,
    isHost,
    isLeaving,
    otherUser,
    router,
  ]);

  const openInviteModal = useCallback(() => {
    setIsInviteOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeInviteModal = useCallback(() => {
    setIsInviteOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  const handleInvite = useCallback(() => {
    if (!selectedFriendId) return;

    const selectedFriend = (friends ?? []).find(
      (friend) => friend.id === selectedFriendId,
    );
    if (selectedFriend?.pending_invite) {
      toast.error("Invite already sent to that friend.");
      return;
    }
    const selectedFriendName =
      selectedFriend?.display_name || selectedFriend?.username || "your friend";

    startInviting(async () => {
      try {
        await createWatchPartyInvite({
          roomId: currentRoom.id,
          inviterId: currentUserId,
          inviteeId: selectedFriendId,
        });
        mutateFriends(
          (prev = []) =>
            prev.map((friend) =>
              friend.id === selectedFriendId
                ? { ...friend, pending_invite: true }
                : friend,
            ),
          { revalidate: false },
        );
        mutateRoom();
        channelRef.current?.send({
          type: "broadcast",
          event: "invite-sent",
          payload: { name: selectedFriendName },
        });
        toast.success(`Invite sent to ${selectedFriendName}.`);
        setIsInviteOpen(false);
        setSelectedFriendId(null);
        setInviteQuery("");
        document.body.style.overflow = "auto";
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to send invite.",
        );
      }
    });
  }, [
    channelRef,
    currentRoom.id,
    currentUserId,
    friends,
    mutateFriends,
    mutateRoom,
    selectedFriendId,
  ]);

  const copyRoomKey = useCallback(async () => {
    if (!privateRoomCode) return;
    await navigator.clipboard.writeText(privateRoomCode);
    toast.success("Room key copied.");
  }, [privateRoomCode]);

  return {
    alreadyInRoomIds,
    closeInviteModal,
    copyRoomKey,
    currentRoom,
    currentUser,
    filteredFriends,
    handleEmojiSelect,
    handleInputChange,
    handleInvite,
    handleLeave,
    handleSend,
    input,
    isHost,
    isInviteOpen,
    isInviting,
    isLeaving,
    isLoadingFriends,
    messages,
    messagesEndRef,
    openInviteModal,
    otherUser,
    privateRoomCode,
    selectedFriendId,
    setInviteQuery,
    setSelectedFriendId,
    setShowEmojiPicker,
    showEmojiPicker,
    typingUserId,
    typingUserName: typingUserId
      ? (userNameMap.get(typingUserId) ?? null)
      : null,
    inviteQuery,
    visibleViewers,
  };
}

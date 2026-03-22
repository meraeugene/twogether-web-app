"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { IoCheckmarkCircle, IoClose, IoSearch } from "react-icons/io5";
import { LoaderCircle } from "lucide-react";
import type { RoomUser } from "../../../../types/watchPartyRoomTypes";

export default function WatchPartyInviteModal({
  open,
  inviteQuery,
  selectedFriendId,
  friends,
  isLoadingFriends,
  isInviting,
  alreadyInRoomIds,
  onClose,
  onQueryChange,
  onSelectFriend,
  onInvite,
}: {
  open: boolean;
  inviteQuery: string;
  selectedFriendId: string | null;
  friends: RoomUser[];
  isLoadingFriends: boolean;
  isInviting: boolean;
  alreadyInRoomIds: Set<string>;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSelectFriend: (friendId: string) => void;
  onInvite: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="flex min-h-[72dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 border-b-0 bg-[#0B0B0C] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] sm:min-h-0 sm:max-h-[80vh] sm:max-w-md sm:rounded-[28px] sm:border-b"
          >
            <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-8 sm:pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Invite Friends
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-full cursor-pointer bg-white/5 p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white sm:p-2"
                >
                  <IoClose size={18} className="sm:h-5 sm:w-5" />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-white/40">
                Choose a friend to join your theater. They&apos;ll receive a
                notification instantly.
              </p>
            </div>

            <div className="mb-4 px-4 sm:px-6">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/20 transition-colors group-focus-within:text-red-500">
                  <IoSearch size={16} />
                </div>
                <input
                  value={inviteQuery}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Search friends..."
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            <div className="mx-3 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-1.5 pb-2 sm:mx-4 sm:px-2">
              {isLoadingFriends ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  <p className="text-xs font-medium uppercase tracking-widest text-white/30">
                    Finding friends...
                  </p>
                </div>
              ) : friends.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-white/30">
                    No friends active right now.
                  </p>
                </div>
              ) : (
                friends.map((friend) => {
                  const selected = selectedFriendId === friend.id;
                  const alreadyInRoom = alreadyInRoomIds.has(friend.id);
                  const inviteSent = Boolean(friend.pending_invite);
                  const disabled = alreadyInRoom || inviteSent;

                  return (
                    <button
                      key={friend.id}
                      onClick={() => {
                        if (disabled) return;
                        onSelectFriend(friend.id);
                      }}
                      disabled={disabled}
                      className={`group cursor-pointer relative flex w-full items-center gap-3 rounded-2xl p-3 transition-all duration-300 sm:gap-4 ${
                        selected
                          ? "border border-red-500/30 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.05)]"
                          : disabled
                            ? "cursor-not-allowed border border-white/5 bg-white/[0.02] opacity-55"
                            : "border border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-visible rounded-full">
                        <Image
                          src={friend.avatar_url || "/default-avatar.png"}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0B0B0C] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.75)]" />
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <p
                          className={`truncate text-sm font-bold ${selected ? "text-red-400" : "text-white"}`}
                        >
                          {friend.display_name || friend.username}
                        </p>
                        <p className="truncate text-[11px] font-medium tracking-wide text-white/60">
                          {alreadyInRoom
                            ? "Already in room"
                            : inviteSent
                              ? "Invite sent"
                              : `@${friend.username}`}
                        </p>
                      </div>

                      {inviteSent ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300">
                          Sent
                        </span>
                      ) : selected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-red-500"
                        >
                          <IoCheckmarkCircle size={24} />
                        </motion.div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className="relative mt-2 flex flex-col gap-3 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:flex-row sm:items-center sm:gap-4 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent sm:rounded-b-[28px]" />

              <button
                onClick={onClose}
                className="relative z-10 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-white/5 bg-[#141416] text-[12px] font-medium tracking-tight text-white/50 shadow-[0_1px_1px_rgba(255,255,255,0.02),0_1px_3px_rgba(0,0,0,0.5)] transition-all active:scale-[0.98] hover:text-white sm:flex-1"
              >
                Cancel
              </button>

              <button
                onClick={onInvite}
                disabled={!selectedFriendId || isInviting}
                className="relative cursor-pointer z-10 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#800000] text-[13px] font-semibold tracking-wide text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15),0_12px_24px_-10px_rgba(128,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-red-800 disabled:opacity-30 hover:bg-[#a00000] sm:flex-[2]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  {isInviting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Summoning...
                    </>
                  ) : (
                    "Summon to Party"
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

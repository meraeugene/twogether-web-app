"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FriendCard } from "./FriendCard";
import {
  getFriendsOfUser,
  getIncomingFriendRequests,
  getSentFriendRequests,
} from "@/actions/social/friendActions";
import useSWR from "swr";
import { AddFriendSearch } from "./AddFriendSearch";
import { FriendCardsSkeleton } from "@/components/PageSkeletons";

const tabs = ["Friends", "Requests", "Sent"];

export default function FriendsPage({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [activeTab, setActiveTab] = useState("Friends");

  const fetchFriends = (currentUserId: string) =>
    getFriendsOfUser(currentUserId);
  const fetchIncoming = (currentUserId: string) =>
    getIncomingFriendRequests(currentUserId);
  const fetchSent = (currentUserId: string) =>
    getSentFriendRequests(currentUserId);

  const {
    data: friends,
    mutate: refetchFriends,
    isLoading: isLoadingFriends,
  } = useSWR(
    () => (activeTab === "Friends" ? ["friends", currentUserId] : null),
    () => fetchFriends(currentUserId),
  );

  const {
    data: requests,
    mutate: refetchRequests,
    isLoading: isLoadingRequests,
  } = useSWR(
    () => (activeTab === "Requests" ? ["requests", currentUserId] : null),
    () => fetchIncoming(currentUserId),
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      refreshWhenHidden: false,
    },
  );

  const {
    data: sent,
    mutate: refetchSent,
    isLoading: isLoadingSent,
  } = useSWR(
    () => (activeTab === "Sent" ? ["sent", currentUserId] : null),
    () => fetchSent(currentUserId),
  );

  const tabButtonClass = (tab: string) =>
    `shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer sm:px-6 ${
      activeTab === tab
        ? "border-red-500 text-white"
        : "border-transparent text-white/60 hover:text-white"
    }`;

  return (
    <div className="page-gutter page-listing min-h-screen font-[family-name:var(--font-geist-sans)] bg-black text-white px-7  pt-28 pb-16 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mobile-banner mobile-bleed relative w-full aspect-[3/1] sm:aspect-[5/2] md:aspect-[16/5] lg:aspect-[16/4] xl:aspect-[16/3] max-h-[500px] xl:max-h-[200px] border border-white/10 rounded-3xl overflow-hidden shadow-xl"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('/friends.png')` }}
        />
      </motion.div>

      {/* Tabs */}
      <div className="relative z-10 mx-auto mt-6 flex w-fit max-w-full overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={tabButtonClass(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Animated Tab Content */}
      <div className=" py-8 ">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "Friends" && (
              <div className="w-full">
                <AddFriendSearch currentUserId={currentUserId} />

                {isLoadingFriends ? (
                  <FriendCardsSkeleton />
                ) : friends?.length === 0 ? (
                  <div className="text-center text-white/50  ">
                    No friends yet. Start adding some!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {friends?.map((user) => (
                      <FriendCard
                        key={user.id}
                        name={user.display_name}
                        username={user.username}
                        avatarUrl={user.avatar_url || ""}
                        status="friend"
                        mutate={refetchFriends}
                        id={user.id}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Requests" && (
              <div className="w-full">
                {isLoadingRequests ? (
                  <FriendCardsSkeleton />
                ) : requests?.length === 0 ? (
                  <div className="text-center text-white/50 ">
                    No incoming friend requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {requests?.map((user) => (
                      <FriendCard
                        key={user.id}
                        name={user.display_name}
                        username={user.username}
                        avatarUrl={user.avatar_url || ""}
                        status="request"
                        id={user.id}
                        currentUserId={currentUserId}
                        mutate={refetchRequests}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Sent" && (
              <div className="w-full">
                {isLoadingSent ? (
                  <FriendCardsSkeleton />
                ) : sent?.length === 0 ? (
                  <div className="text-center text-white/50 ">
                    No sent friend requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {sent?.map((user) => (
                      <FriendCard
                        key={user.id}
                        name={user.display_name}
                        username={user.username}
                        avatarUrl={user.avatar_url || ""}
                        status="sent"
                        id={user.id}
                        currentUserId={currentUserId}
                        mutate={refetchSent}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

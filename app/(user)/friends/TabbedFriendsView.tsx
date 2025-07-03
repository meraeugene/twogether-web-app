"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FriendCard } from "./FriendCard";
import {
  getFriendsOfUser,
  getIncomingFriendRequests,
  getSentFriendRequests,
} from "@/actions/friendActions";
import useSWR from "swr";

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
    () => fetchFriends(currentUserId)
  );

  const {
    data: requests,
    mutate: refetchRequests,
    isLoading: isLoadingRequests,
  } = useSWR(
    () => (activeTab === "Requests" ? ["requests", currentUserId] : null),
    () => fetchIncoming(currentUserId),
    {
      refreshInterval: 5000,
      refreshWhenHidden: false,
    }
  );

  const {
    data: sent,
    mutate: refetchSent,
    isLoading: isLoadingSent,
  } = useSWR(
    () => (activeTab === "Sent" ? ["sent", currentUserId] : null),
    () => fetchSent(currentUserId)
  );

  const tabButtonClass = (tab: string) =>
    `px-6 py-3 text-sm font-medium transition-all cursor-pointer ${
      activeTab === tab
        ? "border-b-2 border-red-500 text-white"
        : "text-white/60 hover:text-white"
    }`;

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black text-white px-4 sm:px-15 pt-28 pb-16">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-70 border border-gray-900 rounded-xl overflow-hidden "
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/friends.png')` }}
        />

        {/* Content pinned to bottom */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center z-10">
          <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] font-bold text-white">
            Connect, Watch, Laugh together.
          </h1>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-white/10 sticky top-0 z-20 bg-black/90">
        {tabs.map((tab) => (
          <button
            key={tab}
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
              <div className="max-w-4xl mx-auto">
                {isLoadingFriends ? (
                  <div className="flex justify-center ">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : friends?.length === 0 ? (
                  <div className="text-center text-white/50 ">
                    No friends yet. Start adding some!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <div className="max-w-4xl mx-auto">
                {isLoadingRequests ? (
                  <div className="flex justify-center ">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : requests?.length === 0 ? (
                  <div className="text-center text-white/50 ">
                    No incoming friend requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2  gap-6">
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
              <div className="max-w-4xl mx-auto">
                {isLoadingSent ? (
                  <div className="flex justify-center ">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : sent?.length === 0 ? (
                  <div className="text-center text-white/50 ">
                    No sent friend requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2  gap-6">
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

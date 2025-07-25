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
import { AddFriendSearch } from "./AddFriendSearch";

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
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black text-white px-7  pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 relative">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full aspect-[3/1] sm:aspect-[5/2] md:aspect-[16/5] lg:aspect-[16/4] xl:aspect-[16/3] max-h-[500px] xl:max-h-[200px] border border-white/10 rounded-3xl overflow-hidden shadow-xl"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('/friends.png')` }}
        />
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
                <AddFriendSearch currentUserId={currentUserId} />

                {isLoadingFriends ? (
                  <div className="flex justify-center ">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : friends?.length === 0 ? (
                  <div className="text-center text-white/50  ">
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

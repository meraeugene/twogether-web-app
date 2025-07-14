"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart,
  FaFilm,
  FaSmile,
  FaUserSecret,
  FaFileAlt,
  FaUserPlus,
  FaEnvelope,
  FaTimes,
  FaUserFriends,
  FaUser,
} from "react-icons/fa";
import Image from "next/image";
import { CurrentUser, User } from "@/types/user";
import { InfoCard } from "./InfoCard";
import { Recommendation } from "@/types/recommendation";
import FilmCard from "@/components/FilmCard";
import { FollowStats } from "@/types/follows";
import { toggleFollow } from "@/actions/followActions";
import {
  cancelFriendRequest,
  getFriendsOfUser,
  getFriendStats,
  sendFriendRequest,
} from "@/actions/friendActions";
import { FriendRequestStatus, UserPreview } from "@/types/friends";
import { IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import useSWR from "swr";
import Link from "next/link";
import { getOrCreateThread, sendMessage } from "@/actions/messageActions";
import MessageModal from "@/components/MessageModal";
import { useRouter } from "next/navigation";

const tabs = ["Profile", "Recommendations", "Watchlist", "Friends"];

export default function TabbedProfileView({
  user,
  currentUser,
  userRecommendations,
  userWatchList,
  followStats,
}: {
  user: User;
  currentUser: CurrentUser;
  userRecommendations: Recommendation[];
  userWatchList: Recommendation[];
  followStats: FollowStats;
}) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Profile");
  const [, startTransition] = useTransition();

  // FOLLOWING STATE
  const [isFollowing, setIsFollowing] = useState<boolean>(
    followStats.isFollowing
  );
  const [followers, setFollowers] = useState<number>(followStats.followers);

  // FRIENDS STATE
  const [followCooldown, setFollowCooldown] = useState(false);
  const [friendCooldown, setFriendCooldown] = useState(false);

  // MESSAGE STATE
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messagePending, startMessageTransition] = useTransition();

  const {
    data: friendStatus,
    isLoading: loadingFriendStatus,
    mutate: refetchFriendStatus,
  } = useSWR<FriendRequestStatus>(
    ["friend-status", currentUser.id, user.id],
    () => getFriendStats(currentUser.id, user.id),
    {
      refreshInterval: 5000, // re-fetch every 5 seconds
      refreshWhenHidden: false,
    }
  );

  const {
    data: userFriends,
    // isLoading: loadingUserFriends,
    // mutate: refetchUserFriends,
  } = useSWR<UserPreview[]>(
    ["friends", user.id],
    () => getFriendsOfUser(user.id),
    {
      refreshInterval: 5000, // re-fetch every 5 seconds
      refreshWhenHidden: false,
    }
  );

  const handleFollowToggle = () => {
    if (followCooldown) return;

    setIsFollowing((prev) => !prev);
    setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));

    setFollowCooldown(true);
    setTimeout(() => setFollowCooldown(false), 500);

    startTransition(() => {
      toggleFollow(currentUser.id, user.id);
    });
  };

  const [localFriendStatus, setLocalFriendStatus] =
    useState<FriendRequestStatus | null>(null);

  const effectiveFriendStatus = localFriendStatus ?? friendStatus;

  const handleAddFriendToggle = () => {
    if (!friendStatus || friendCooldown) return;

    const optimisticStatus = friendStatus === "none" ? "pending" : "none";
    setLocalFriendStatus(optimisticStatus);
    setFriendCooldown(true);
    setTimeout(() => setFriendCooldown(false), 500);

    (async () => {
      try {
        if (friendStatus === "none") {
          await sendFriendRequest(currentUser.id, user.id);
        } else if (friendStatus === "pending") {
          await cancelFriendRequest(currentUser.id, user.id);
        }

        await refetchFriendStatus();
      } catch (err) {
        setLocalFriendStatus(friendStatus);
        console.error("Friend request error:", err);
      }
    })();
  };

  const handleSendMessage = (content: string) => {
    startMessageTransition(async () => {
      if (!user.id || !currentUser.id || !content.trim()) return;

      try {
        // Step 1: Ensure thread exists
        const thread = await getOrCreateThread(currentUser.id, user.id);

        // Step 2: Send the message
        await sendMessage({
          threadId: thread.id,
          senderId: currentUser.id,
          receiverId: user.id,
          content,
        });

        // Step 3: Close the modal
        setShowMessageModal(false);

        router.push(`/messages`);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    });
  };

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col   pt-28 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 pb-16 text-white px-7
"
    >
      {/* Banner */}
      <div
        className="relative px-2  w-full rounded-md overflow-hidden bg-cover bg-center h-80 sm:h-96 md:h-[20rem] "
        style={{ backgroundImage: `url('/hero.png')` }}
      >
        <div className="absolute  inset-0 bg-black/70 backdrop-blur-sm " />
        {!loadingFriendStatus && (
          <motion.div
            className="relative  z-10 flex flex-col items-center  justify-center h-full text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={user.avatar_url || "/default-avatar.png"}
              alt="avatar"
              width={96}
              height={96}
              className="rounded-full  shadow-lg  object-cover w-21 h-21"
            />

            <h1 className="mt-4 text-2xl font-bold">{user.display_name}</h1>
            <p className="text-red-500 ">@{user.username}</p>

            <p className="text-white/60 text-sm mt-1">
              {followers} follower{followers !== 1 ? "s" : ""}
            </p>

            {/* Action buttons */}
            {currentUser?.id !== user.id && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {/* Add Friend */}
                <button
                  onClick={handleAddFriendToggle}
                  disabled={friendCooldown}
                  className={`cursor-pointer transition text-sm px-4 py-2 rounded-full flex items-center gap-2 text-white
                        ${
                          friendCooldown
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                     ${
                       effectiveFriendStatus === "pending"
                         ? "bg-red-600 hover:bg-red-700"
                         : effectiveFriendStatus === "accepted"
                         ? "bg-green-600 hover:bg-green-700"
                         : "bg-white/10 hover:bg-white/20"
                     }`}
                >
                  {effectiveFriendStatus === "pending" ? (
                    <FaTimes className="text-white" />
                  ) : effectiveFriendStatus === "accepted" ? (
                    <FaUserFriends className="text-white" />
                  ) : (
                    <FaUserPlus className="text-white" />
                  )}

                  {effectiveFriendStatus === "pending"
                    ? "Cancel Request"
                    : effectiveFriendStatus === "accepted"
                    ? "Friends"
                    : "Add Friend"}
                </button>

                {/* Follow */}
                <button
                  onClick={handleFollowToggle}
                  disabled={followCooldown}
                  className={`transition
                        ${
                          followCooldown
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }

                    cursor-pointer text-sm px-4 py-2 rounded-full flex items-center gap-2 text-white
                    ${
                      isFollowing
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-white/10 hover:bg-white/20"
                    }
                    `}
                >
                  {isFollowing ? <IoPersonRemove /> : <IoPersonAdd />}
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>

                {/* Message */}
                <button
                  onClick={() => setShowMessageModal(true)}
                  disabled={messagePending}
                  className="bg-white/10 cursor-pointer hover:bg-white/20 transition text-sm px-4 py-2 rounded-full flex items-center gap-2 text-white"
                >
                  <FaEnvelope className="text-white" />
                  Message
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center border-b border-white/10 bg-black/90 sticky top-0 z-20">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 cursor-pointer py-3 text-sm font-medium transition-all ${
              activeTab === tab
                ? "border-b-2 border-red-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Animated Tab Content */}
      {!loadingFriendStatus && (
        <div className=" py-8 ">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "Profile" && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <InfoCard
                      icon={<FaFileAlt />}
                      title="About me"
                      className="md:justify-center"
                      value={user.bio || "No bio available."}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoCard
                      icon={<FaFilm />}
                      title="Favorite Genres"
                      value={user.favorite_genres?.join(", ")}
                    />
                    <InfoCard
                      icon={<FaSmile />}
                      title="Favorite Moods"
                      value={user.favorite_moods?.join(", ")}
                    />
                    <InfoCard
                      icon={<FaHeart />}
                      title="Relationship Status"
                      value={user.relationship_status || "Alien"}
                    />
                    <InfoCard
                      icon={<FaUserSecret />}
                      title="Social Intent"
                      value={user.social_intent?.join(", ")}
                    />
                  </div>
                </div>
              )}
              {activeTab === "Recommendations" && (
                <div className="grid max-w-4xl mx-auto  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ">
                  {userRecommendations.map((item) => (
                    <FilmCard key={item.recommendation_id} item={item} />
                  ))}
                </div>
              )}
              {activeTab === "Watchlist" && (
                <div className="grid max-w-4xl mx-auto  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ">
                  {userWatchList.map((item) => (
                    <FilmCard key={item.recommendation_id} item={item} />
                  ))}
                </div>
              )}
              {activeTab === "Friends" && (
                <div className="text-white/80">
                  <div className="grid max-w-4xl mx-auto grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                    {userFriends?.map((friend) => (
                      <motion.div
                        key={friend.id}
                        className="flex flex-col items-start p-4 bg-white/5 rounded-xl border border-white/10 gap-4"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <Image
                            src={friend.avatar_url || "/default-avatar.png"}
                            alt="avatar"
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h2 className="font-semibold text-white">
                              {friend.display_name}
                            </h2>
                            <p className="text-white/50 text-sm">
                              @{friend.username}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/profile/${friend.username}/${friend.id}`}
                          className="mt-1 cursor-pointer text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
                        >
                          <FaUser className="text-xs" />
                          Profile
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <MessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={handleSendMessage}
        loading={messagePending}
      />
    </div>
  );
}

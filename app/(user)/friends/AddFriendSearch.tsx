"use client";

import {
  searchUsersByUsernamePrefix,
  getFriendStats,
} from "@/actions/friendActions";
import { useState, useTransition, useMemo } from "react";
import debounce from "lodash.debounce";
import { UserResultCard } from "./UserResultCard";
import AddFriendSkeleton from "./AddFriendSkeleton";
import { FriendRequestStatus } from "@/types/friends";

type UserWithStatus = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  status: FriendRequestStatus;
};

export function AddFriendSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserWithStatus[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const debouncedSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value.trim()) {
          setResults([]);
          setError("");
          return;
        }

        startTransition(async () => {
          try {
            const users = await searchUsersByUsernamePrefix(value.trim());
            const filtered = users.filter((u) => u.id !== currentUserId);

            const resultsWithStatus = await Promise.all(
              filtered.map(async (user) => {
                const status = await getFriendStats(currentUserId, user.id);
                return { ...user, status };
              })
            );

            setResults(resultsWithStatus);
            setError(resultsWithStatus.length === 0 ? "No users found." : "");
          } catch (err) {
            console.error("Search error", err);
            setError("Something went wrong.");
          }
        });
      }, 400),
    [currentUserId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className=" w-full lg:max-w-4xl mx-auto">
      <input
        value={query}
        onChange={handleChange}
        placeholder="Find a friend by @username"
        className="bg-black border border-white/20 text-white placeholder-white/30 px-4 py-2 w-full rounded-md outline-none transition focus:ring-1 focus:ring-red-500"
      />

      {isPending && <AddFriendSkeleton />}

      {error && <p className="text-white text-center mt-4">{error}</p>}

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((user) => (
          <UserResultCard
            key={user.id}
            user={user}
            currentUserId={currentUserId}
            status={user.status}
          />
        ))}
      </div>
    </div>
  );
}

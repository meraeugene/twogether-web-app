"use client";

import useSWR from "swr";
import { getWatchingNowRooms } from "@/actions/watchPartyActions";
import Image from "next/image";
import Link from "next/link";
import { Globe2, Lock } from "lucide-react";
import { toast } from "sonner";
import GlowingOutlineButton from "@/components/ui/GlowingOutlineButton";

export default function WatchingNow({
  limit = 4,
  currentUserId,
}: {
  limit?: number;
  currentUserId?: string;
}) {
  const { data, isLoading } = useSWR(
    ["watching-now", limit, currentUserId],
    () => getWatchingNowRooms(limit, currentUserId),
    {
      refreshInterval: 15000,
    },
  );

  const liveRooms = data ?? [];

  return (
    <section className="relative overflow-hidden bg-[#020202] py-14 sm:py-20">
      {/* Ambilight */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[80%] h-[50%] bg-red-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="z-10 mb-10 flex flex-col gap-6 sm:gap-8 md:mb-14 md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)] md:items-end md:gap-10 xl:mb-16 xl:flex xl:flex-row xl:justify-between">
          <h2 className="max-w-3xl text-4xl font-medium leading-[0.95] tracking-tighter text-white sm:text-5xl md:text-4xl 2xl:text-7xl">
            Live now,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              watching together.
            </span>
          </h2>

          <p className="max-w-md border-l border-white/10 pl-5 text-sm font-light md:text-base text-neutral-400 sm:text-base md:pl-6 md:text-[15px] lg:text-lg">
            Public rooms are open to all. Private rooms are visible, but only
            friends can join. Log in, pick a movie, and start your party
            instantly.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: Math.min(limit, 4) }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-3xl bg-neutral-900/50 border border-white/5 animate-pulse"
              />
            ))
          ) : liveRooms.length === 0 ? (
            <div className="col-span-full py-16 px-6 border border-dashed border-white/10 rounded-[2.5rem] text-center bg-white/[0.02]">
              <p className="text-xl text-white font-medium">
                No live rooms yet.
              </p>
              <p className="text-neutral-400 font-light text-sm md:text-base mt-3 max-w-xl mx-auto leading-relaxed">
                Login, Pick a movie, press{" "}
                <span className="text-white">Watch Together</span>, and start
                the first party. Your room will appear here for others right
                away.
              </p>
              <GlowingOutlineButton
                href="/browse"
                className="mt-6"
                contentClassName="gap-2 px-5 py-2.5"
                textClassName="normal-case"
              >
                Browse movies
              </GlowingOutlineButton>
            </div>
          ) : (
            liveRooms.map((room) => (
              <Link
                key={room.room_id}
                href={`/watch-party/${room.room_id}`}
                onClick={(event) => {
                  if (room.is_accessible) return;
                  event.preventDefault();
                  toast.error(
                    "This private room is locked. Only the host's friends can open it.",
                  );
                }}
                className="group relative flex aspect-[2/3] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <Image
                  src={room.poster_url || "/placeholder.jpg"}
                  alt={room.movie_title}
                  fill
                  unoptimized
                  className={`object-cover transition-transform duration-700  group-hover:scale-110 group-hover:rotate-[1.5deg] opacity-85`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 m-4 rounded-[1.6rem] border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:bg-white/[0.12] group-hover:border-white/20">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-300">
                        {room.watching_count} Active
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${
                        room.access_type === "public"
                          ? "bg-emerald-500 text-white"
                          : "border border-white/10 bg-black/30 text-white/75"
                      }`}
                    >
                      {room.access_type === "public" ? (
                        <Globe2 className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {room.access_type === "private" ? "Private" : "Public"}
                    </span>
                  </div>

                  <h3 className="mb-4  text-xl font-black uppercase leading-[1.2] tracking-[0.04em] text-white [text-wrap:balance] italic ">
                    {room.movie_title}
                  </h3>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex -space-x-2">
                      {room.watching_users.slice(0, 3).map((user) => (
                        <div
                          key={user.id}
                          className="h-8 w-8 overflow-hidden rounded-full border border-white/15 shadow-[0_8px_18px_-12px_rgba(0,0,0,0.95)]"
                        >
                          <Image
                            src={user.avatar_url || "/default-avatar.png"}
                            alt={user.username}
                            width={32}
                            height={32}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                      ))}
                      {room.watching_count > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-black/55 text-[8px] font-bold text-white">
                          +{room.watching_count - 3}
                        </div>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      {room.access_type === "private"
                        ? "Friends only"
                        : "Join room"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

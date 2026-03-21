"use client";

import { useEffect, useState, useTransition } from "react";
import { joinWatchPartyByCode } from "@/actions/watchPartyActions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import WatchingNow from "@/sections/WatchingNow";
import { LoaderCircle } from "lucide-react";

export default function WatchPartyJoinClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "private-room") {
      toast.error("You are not allowed to enter that private watch party.");
      router.replace("/watch-party");
    }
  }, [router, searchParams]);

  const handleJoin = () => {
    const normalized = code.trim();
    if (!normalized) {
      toast.error("Enter a room code.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await joinWatchPartyByCode({
          userId: currentUserId,
          code: normalized,
        });
        router.push(`/watch-party/${result.roomId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to join room.";
        if (message.includes("Leave that room first")) {
          toast.info(message);
          return;
        }
        toast.error(message);
      }
    });
  };

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-32 text-white sm:px-6  lg:px-24 xl:px-32 md:pt-36 2xl:px-26">
      <div className="max-w-7xl mx-auto pb-16">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80%] h-[50%] bg-red-900/20 blur-[150px] rounded-full" />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.26em] text-red-300/80">
            Watch Party Lobby
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                Join a private room or jump into a public one.
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/60 md:text-base">
                Use a private room code from a friend, or join one of the live
                public rooms below.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 sm:flex-row sm:items-center">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleJoin();
                    }
                  }}
                  placeholder="Paste private room code"
                  className="w-full bg-transparent px-3 py-3 text-sm uppercase tracking-[0.16em] outline-none placeholder:text-white/30"
                />
                <button
                  onClick={handleJoin}
                  disabled={isPending}
                  className="shrink-0 cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[132px]"
                >
                  <span className="inline-flex items-center gap-2">
                    {isPending ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join"
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WatchingNow limit={8} currentUserId={currentUserId} />
    </main>
  );
}

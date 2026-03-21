"use client";

import { useEffect, useState, useTransition } from "react";
import { createWatchPartyRoom } from "@/actions/watchPartyActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Globe2, LoaderCircle, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LuPartyPopper } from "react-icons/lu";
import { IoClose } from "react-icons/io5";

export default function WatchTogetherButton({
  currentUserId,
  movieTmdbId,
  movieTitle,
  movieType,
  streamUrl,
  posterUrl = null,
}: {
  currentUserId: string;
  movieTmdbId: number;
  movieTitle: string;
  movieType: "movie" | "tv";
  streamUrl: string;
  posterUrl?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingAccessType, setPendingAccessType] = useState<
    "public" | "private" | null
  >(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleCreateRoom = (accessType: "public" | "private") => {
    startTransition(async () => {
      setPendingAccessType(accessType);

      try {
        const result = await createWatchPartyRoom({
          hostUserId: currentUserId,
          movieTmdbId,
          movieTitle,
          movieType,
          streamUrl,
          posterUrl,
          accessType,
        });

        setOpen(false);
        router.push(`/watch-party/${result.roomId}`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to start the watch party.";
        if (message.includes("Leave that room first")) {
          toast.info(message);
          return;
        }
        toast.error(
          message.includes("Server Components render")
            ? "Unable to start the watch party right now. Please try again."
            : message,
        );
      } finally {
        setPendingAccessType(null);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.1] md:w-fit"
      >
        <LuPartyPopper className="w-4 h-4" />
        Watch Together
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 40, rotateX: 15 }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="relative flex h-screen w-full flex-col overflow-hidden border-0 bg-[#060607] shadow-[0_0_100px_rgba(0,0,0,1)] perspective-1000 sm:h-auto sm:max-h-[86vh] sm:max-w-2xl sm:rounded-[40px] sm:border sm:border-white/10"
            >
              {/* Cinematic Lighting Overlays */}
              <div className="absolute -top-[10%] -left-[10%] w-[300px] h-[300px] bg-red-600/15 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute -bottom-[5%] -right-[5%] w-[200px] h-[200px] bg-blue-500/5 blur-[100px] rounded-full" />

              <div className="relative z-10 min-h-0 overflow-y-auto p-5 sm:p-8 md:p-10">
                {/* HEADER SECTION */}
                <div className="mb-8 flex items-start justify-between sm:mb-12">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="h-1 w-6 rounded-full bg-red-600" />
                        <div className="h-1 w-2 rounded-full bg-white/10" />
                      </div>
                      <span className=" uppercase  leading-relaxed font-black text-xs tracking-[0.14em] text-white/55">
                        Set up your room
                      </span>
                    </div>
                    <h3 className="uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black italic tracking-tighter text-transparent sm:text-4xl">
                      START WATCH PARTY
                    </h3>
                    <p className="mt-3 max-w-md text-[11px] font-medium leading-relaxed tracking-[0.14em] text-white/55 sm:mt-4 sm:text-xs">
                      Pick how you want people to join. Go public and meet
                      others, or keep it private with friends.
                    </p>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="group rounded-2xl border border-white/5 bg-white/[0.03] cursor-pointer p-3 text-white/20 transition-all duration-500 hover:border-red-600/50 hover:bg-red-600/20 hover:text-white active:scale-90 sm:p-4"
                  >
                    <IoClose size={20} className="sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* OPTIONS GRID */}
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {/* PUBLIC OPTION */}
                  <button
                    onClick={() => handleCreateRoom("public")}
                    disabled={isPending}
                    className="group relative cursor-pointer rounded-[28px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-6 text-left transition-all duration-700 hover:border-red-600/40 hover:from-red-600/[0.05] hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.2)] sm:rounded-[35px] sm:p-8"
                  >
                    <div className="flex flex-col h-full space-y-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Globe2 className="h-8 w-8" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className=" uppercase text-2xl  mb-2   bg-gradient-to-b from-white to-white/60 bg-clip-text font-black  tracking-tighter text-transparent">
                          Public
                        </h4>
                        <p className="text-xs  group-hover:text-white/60 transition-colors leading-relaxed font-medium tracking-tight text-white/40">
                          Anyone can find and join your party. Great if you want
                          to watch with new people.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 opacity-100 transition-all duration-500 sm:-translate-x-4 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
                        {isPending && pendingAccessType === "public" ? (
                          <>
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            Start Party <ArrowRight size={14} strokeWidth={3} />
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* PRIVATE OPTION */}
                  <button
                    onClick={() => handleCreateRoom("private")}
                    disabled={isPending}
                    className="group relative cursor-pointer rounded-[28px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-6 text-left transition-all duration-700 hover:border-white/20 hover:from-white/[0.05] sm:rounded-[35px] sm:p-8"
                  >
                    <div className="flex flex-col h-full space-y-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/[0.05] border border-white/10 text-white/40 group-hover:text-white group-hover:border-white/40 transition-all duration-500">
                        <Lock className="h-8 w-8" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className=" uppercase text-2xl  mb-2   bg-gradient-to-b from-white to-white/60 bg-clip-text font-black  tracking-tighter text-transparent">
                          Private
                        </h4>
                        <p className="text-xs  group-hover:text-white/60 transition-colors leading-relaxed font-medium tracking-tight text-white/40">
                          Only people you invite can join. Perfect for watching
                          with friends.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white opacity-100 transition-all duration-500 sm:-translate-x-4 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
                        {isPending && pendingAccessType === "private" ? (
                          <>
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            Invite Friends
                            <ArrowRight size={14} strokeWidth={3} />
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* FOOTER SECTION */}
                <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.03] pt-6 sm:mt-12 sm:flex-row sm:items-end sm:justify-between sm:pt-10">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wide text-red-600/90">
                      Playing Now
                    </span>
                    <div className="max-w-[18rem] break-words text-xl italic leading-tight uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text font-black tracking-tighter text-transparent">
                      {movieTitle}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/70 mb-1">
                      Step 01 <span className="text-white/70">/ 02</span>
                    </div>
                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "50%" }}
                        className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] -rotate-45 translate-x-16 -translate-y-16" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

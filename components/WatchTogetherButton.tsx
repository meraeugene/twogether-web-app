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
        <span className="sm:hidden">Start Party</span>
        <span className="hidden sm:inline">Watch Together</span>
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
              className="relative flex  w-full flex-col overflow-hidden border-0 bg-[#060607] shadow-[0_0_100px_rgba(0,0,0,1)] perspective-1000 sm:h-auto sm:max-h-[86vh] sm:max-w-2xl rounded-t-[40px] sm:rounded-[40px]  sm:border sm:border-white/10"
            >
              {/* Cinematic Lighting Overlays */}
              <div className="absolute -top-[10%] -left-[10%] w-[300px] h-[300px] bg-red-600/15 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute -bottom-[5%] -right-[5%] w-[200px] h-[200px] bg-blue-500/5 blur-[100px] rounded-full" />

              <div className="relative z-10 min-h-0 overflow-y-auto p-4 pb-6 sm:p-8 md:p-10">
                {/* HEADER SECTION */}
                <div className="mb-6 flex items-start justify-between gap-4 sm:mb-12">
                  <div className="space-y-2 pr-2">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="h-1 w-6 rounded-full bg-red-600" />
                        <div className="h-1 w-2 rounded-full bg-white/10" />
                      </div>
                      <span className="uppercase leading-relaxed font-black text-[10px] tracking-[0.14em] text-white/55 sm:text-xs">
                        Quick setup
                      </span>
                    </div>
                    <h3 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl font-black italic uppercase tracking-tighter text-transparent sm:text-4xl">
                      Start a party
                    </h3>
                    <p className="mt-2 max-w-md text-[11px] font-medium leading-relaxed tracking-[0.08em] text-white/55 sm:mt-4 sm:text-xs sm:tracking-[0.14em]">
                      Choose who can join this room.
                    </p>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="group shrink-0 rounded-2xl border border-white/5 bg-white/[0.03] cursor-pointer p-3 text-white/20 transition-all duration-500 hover:border-red-600/50 hover:bg-red-600/20 hover:text-white active:scale-90 sm:p-4"
                  >
                    <IoClose size={20} className="sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* OPTIONS GRID */}
                <div className="grid gap-3 sm:gap-6 md:grid-cols-2">
                  {/* PUBLIC OPTION */}
                  <button
                    onClick={() => handleCreateRoom("public")}
                    disabled={isPending}
                    className="group relative cursor-pointer rounded-[24px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-5 text-left transition-all duration-700 hover:border-red-600/40 hover:from-red-600/[0.05] hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.2)] sm:rounded-[35px] sm:p-8"
                  >
                    <div className="flex h-full flex-col space-y-4 sm:space-y-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-16 sm:w-16 sm:rounded-[22px]">
                        <Globe2
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <h4 className="mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-xl font-black uppercase tracking-tighter text-transparent sm:text-2xl">
                          Go Public
                        </h4>
                        <p className="text-[11px] font-medium leading-relaxed tracking-tight text-white/40 transition-colors group-hover:text-white/60 sm:text-xs">
                          Open room. Anyone can join.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[10px] font-black uppercase tracking-widest text-red-500 opacity-100 transition-all duration-500 sm:pt-2 sm:-translate-x-4 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
                        {isPending && pendingAccessType === "public" ? (
                          <>
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            Start Now <ArrowRight size={14} strokeWidth={3} />
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* PRIVATE OPTION */}
                  <button
                    onClick={() => handleCreateRoom("private")}
                    disabled={isPending}
                    className="group relative cursor-pointer rounded-[24px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-5 text-left transition-all duration-700 hover:border-white/20 hover:from-white/[0.05] sm:rounded-[35px] sm:p-8"
                  >
                    <div className="flex h-full flex-col space-y-4 sm:space-y-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] text-white/40 transition-all duration-500 group-hover:border-white/40 group-hover:text-white sm:h-16 sm:w-16 sm:rounded-[22px]">
                        <Lock
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <h4 className="mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-xl font-black uppercase tracking-tighter text-transparent sm:text-2xl">
                          Private Link
                        </h4>
                        <p className="text-[11px] font-medium leading-relaxed tracking-tight text-white/40 transition-colors group-hover:text-white/60 sm:text-xs">
                          Invite only. Friends can join.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[10px] font-black uppercase tracking-widest text-white opacity-100 transition-all duration-500 sm:pt-2 sm:-translate-x-4 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
                        {isPending && pendingAccessType === "private" ? (
                          <>
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            Get Link
                            <ArrowRight size={14} strokeWidth={3} />
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* FOOTER SECTION */}
                <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.03] pt-5 sm:mt-12 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pt-10">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wide text-red-600/90">
                      Watching
                    </span>
                    <div className="max-w-[16rem] break-words bg-gradient-to-b from-white to-white/60 bg-clip-text text-lg font-black italic leading-tight uppercase tracking-tighter text-transparent sm:max-w-[18rem] sm:text-xl">
                      {movieTitle}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-white/70">
                      Step 1 <span className="text-white/70">/ 2</span>
                    </div>
                    <div className="h-1 w-full max-w-32 overflow-hidden rounded-full bg-white/5">
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

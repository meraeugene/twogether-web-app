/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import { motion } from "framer-motion";
import { FLOATING_DATA } from "@/data/floatingData";
import { createClient } from "@/utils/supabase/client";

export default function TwogetherHero() {
  const router = useRouter();

  const { data: movieCovers } = useSWR<string[]>("/api/tmdb/popular", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 86400000,
  });

  const handleClick = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Please sign in to start TWOGETHER.");
      return;
    }

    router.push("/recos");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-red-500/30">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute hidden md:block inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#fb2c36_0.8px,transparent_0.8px)] bg-size-[32px_32px]" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 md:w-175 md:h-100 xl:w-250 xl:h-150 bg-red-900/10 blur-[160px] rounded-full" />
      </div>

      {/* FLOATING UI */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {FLOATING_DATA.map((el, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: el.type === "poster" ? 0.2 : 0.25,
              scale: 1,
              y: [0, -25, 0],
            }}
            transition={{
              opacity: { duration: 1 },
              y: {
                duration: 5 + (idx % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: el.delay,
              },
            }}
            style={{ top: el.top, left: el.left, rotate: el.rotate }}
            className={`absolute ${
              el.type === "poster" ? "block" : "hidden xl:block"
            }`}
          >
            {/* POSTER */}
            {el.type === "poster" && movieCovers?.[idx] && (
              <div className="w-15 h-22.5 sm:w-[75px] sm:h-[110px] md:w-[110px] md:h-[160px] xl:w-[140px] xl:h-[200px] rounded-xl md:rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] bg-neutral-900">
                <img
                  src={movieCovers[idx]}
                  alt=""
                  className="w-full h-full object-cover  "
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            {/* USER */}
            {el.type === "user" && (
              <div className="flex items-center gap-3 p-2 pr-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <img
                  src={el.content}
                  className="w-9 h-9 rounded-full border border-red-500/40 object-cover"
                  alt=""
                />
                <div className="flex flex-col gap-1">
                  <div className="w-10 h-1.5 bg-red-500/30 rounded-full" />
                  <div className="w-6 h-1 bg-white/10 rounded-full" />
                </div>
              </div>
            )}

            {/* STATUS */}
            {el.type === "status" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/5 border border-red-500/20 backdrop-blur-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.15em]">
                  {el.content}
                </span>
              </div>
            )}

            {/* BADGE */}
            {el.type === "badge" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 backdrop-blur-md">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-yellow-500 font-black text-xs uppercase italic">
                  {el.content}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-30 text-center px-6 sm:px-8 md:px-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 md:mb-10 rounded-full border border-red-500/30 bg-red-500/5 backdrop-blur-md"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            Watch Movies Anytime
          </span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[100px] font-medium tracking-tighter text-white mb-6 md:mb-8 leading-[0.9]">
          Watch Shows <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Wherever You Are.
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-xl md:max-w-2xl mx-auto mb-10 md:mb-14 font-light leading-relaxed">
          Skip the endless scrolling. Join users worldwide and
          <br className="hidden md:block" />
          watch{" "}
          <span className="text-red-400 font-medium">10,000+ titles.</span>
        </p>

        {/* BUTTON */}
        <div
          onClick={handleClick}
          className="group relative inline-flex items-center justify-center cursor-pointer"
        >
          <div className="absolute inset-0 bg-red-500/25 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <button className="relative cursor-pointer p-[1px] inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-300">
            <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#fb2c36_85%,transparent_100%)]" />

            <div className="relative flex items-center gap-2 md:gap-3 px-6 py-3 md:px-10 md:py-4 bg-black/60 rounded-full text-white backdrop-blur-2xl border border-white/5">
              <span className="text-sm uppercase md:text-base font-bold text-red-400">
                START TWOGETHER
              </span>

              <ChevronRight
                size={18}
                className="text-red-400 group-hover:translate-x-1 transition-transform"
              />

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            </div>
          </button>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="absolute hidden md:block bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-red-500/50 to-transparent z-30" />
    </div>
  );
}

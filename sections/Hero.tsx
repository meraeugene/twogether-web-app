/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronRight, Star } from "lucide-react";
import { CurrentUser } from "@/types/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import { motion } from "framer-motion";

interface TwogetherHeroProps {
  user: CurrentUser | null;
}

// 1. Define the Diverse Floating Types
type FloatingType = "poster" | "user" | "status" | "badge";

interface FloatingElement {
  type: FloatingType;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  content?: string;
  size?: string;
}

const FLOATING_DATA: FloatingElement[] = [
  // --- LEFT SIDE POSTERS ---
  { type: "poster", top: "5%", left: "2%", rotate: -15, delay: 0 },
  { type: "poster", top: "25%", left: "8%", rotate: 10, delay: 0.8 },
  { type: "poster", top: "50%", left: "4%", rotate: -8, delay: 1.5 },
  { type: "poster", top: "75%", left: "7%", rotate: 12, delay: 0.3 },
  { type: "poster", top: "90%", left: "15%", rotate: -5, delay: 2.1 },

  // --- RIGHT SIDE POSTERS ---
  { type: "poster", top: "8%", left: "85%", rotate: 12, delay: 0.5 },
  { type: "poster", top: "30%", left: "90%", rotate: -10, delay: 1.2 },
  { type: "poster", top: "55%", left: "82%", rotate: 15, delay: 1.9 },
  { type: "poster", top: "80%", left: "88%", rotate: -12, delay: 0.7 },
  { type: "poster", top: "15%", left: "75%", rotate: 5, delay: 2.5 },

  // --- TOP/BOTTOM FILLER POSTERS ---
  { type: "poster", top: "-5%", left: "30%", rotate: 20, delay: 1.4 },
  { type: "poster", top: "95%", left: "60%", rotate: -15, delay: 0.9 },

  // --- USER AVATARS ---
  {
    type: "user",
    top: "20%",
    left: "18%",
    rotate: -8,
    delay: 0.8,
    content: "https://i.pravatar.cc/150?u=1",
  },
  {
    type: "user",
    top: "65%",
    left: "15%",
    rotate: 10,
    delay: 1.2,
    content: "https://i.pravatar.cc/150?u=2",
  },
  {
    type: "user",
    top: "45%",
    left: "88%",
    rotate: -15,
    delay: 2.1,
    content: "https://i.pravatar.cc/150?u=3",
  },
  {
    type: "user",
    top: "82%",
    left: "80%",
    rotate: 5,
    delay: 1.1,
    content: "https://i.pravatar.cc/150?u=4",
  },

  // --- STATUS PILLS ---
  {
    type: "status",
    top: "58%",
    left: "75%",
    rotate: 2,
    delay: 0.3,
    content: "Watching Interstellar",
  },
  {
    type: "status",
    top: "12%",
    left: "65%",
    rotate: -4,
    delay: 1.7,
    content: "Live: 2.4k active",
  },
  {
    type: "status",
    top: "40%",
    left: "12%",
    rotate: 4,
    delay: 2.2,
    content: "Friends Online",
  },
  {
    type: "status",
    top: "92%",
    left: "40%",
    rotate: 0,
    delay: 1.1,
    content: "New Episodes Daily",
  },

  // --- BADGES ---
  {
    type: "badge",
    top: "85%",
    left: "25%",
    rotate: 15,
    delay: 0.5,
    content: "9.8",
  },
  {
    type: "badge",
    top: "5%",
    left: "45%",
    rotate: -10,
    delay: 2.5,
    content: "Trending",
  },
  {
    type: "badge",
    top: "35%",
    left: "2%",
    rotate: -20,
    delay: 1.8,
    content: "Top 10",
  },
];

export default function TwogetherHero({ user }: TwogetherHeroProps) {
  const router = useRouter();
  const { data: movieCovers } = useSWR<string[]>("/api/tmdb/popular", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 86400000,
  });

  const handleClick = () => {
    if (!user) {
      toast.error("Please sign in to start TWOGETHER.");
      return;
    }
    router.push("/recos");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-red-500/30">
      {/* --- 1. BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#fb2c36_0.8px,transparent_0.8px)] [background-size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-red-900/10 blur-[160px] rounded-full" />
      </div>

      {/* --- 2. MULTI-COMPONENT FLOATING LAYER --- */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {FLOATING_DATA.map((el, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 0.25,
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
            className="absolute hidden lg:block"
          >
            {/* Movie Poster UI */}
            {el.type === "poster" && movieCovers?.[idx] && (
              <div className="w-[140px] h-[200px] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] bg-neutral-900">
                <img
                  src={movieCovers[idx]}
                  alt=""
                  className="w-full h-full object-cover grayscale-[30%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            {/* User Activity UI */}
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

            {/* Status Pill UI */}
            {el.type === "status" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/5 border border-red-500/20 backdrop-blur-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.15em]">
                  {el.content}
                </span>
              </div>
            )}

            {/* Badge UI */}
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

      {/* --- 3. MAIN HERO CONTENT --- */}
      <div className="relative z-30 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-red-500/30 bg-red-500/5 backdrop-blur-md"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            Watch Movies Anytime
          </span>
        </motion.div>

        <h1 className="text-6xl md:text-[100px] font-medium tracking-tighter text-white mb-8 leading-[0.9]">
          Watch Shows <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Wherever You Are.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-14 font-light leading-relaxed">
          Skip the endless scrolling. Join users worldwide and{" "}
          <br className="hidden md:block" />
          watch{" "}
          <span className="text-red-400 font-medium">10,000+ titles.</span>{" "}
        </p>

        {/* --- 4. THE ACTION BUTTON --- */}
        <div
          onClick={handleClick}
          className="group relative inline-flex items-center justify-center cursor-pointer"
        >
          <div className="absolute inset-0 bg-red-500/25 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <button className="relative cursor-pointer  p-[1px] inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-300">
            <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#fb2c36_85%,transparent_100%)]" />

            <div className="relative flex items-center gap-3 px-10 py-4 bg-black/60 rounded-full text-white backdrop-blur-2xl border border-white/5">
              <span className="text-base font-semibold tracking-tight text-red-400">
                Start TWOGETHER
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

      {/* Decorative center-line light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-red-500/50 to-transparent z-30" />
    </div>
  );
}

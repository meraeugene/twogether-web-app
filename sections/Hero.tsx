"use client";

import { useRouter } from "next/navigation";
import { FaPlayCircle } from "react-icons/fa";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AnimatedTextCycle } from "@/components/ui/AnimatedTextCycle";
import { SiPlayerdotme } from "react-icons/si";

interface HeroProps {
  user?: {
    avatar_url: string;
    email: string | null;
    full_name: string;
  } | null;
}

const Hero = ({ user }: HeroProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      toast.error("Please sign in to start TWOGETHER.");
      return;
    }
    router.push("/browse");
  };

  return (
    <section className="py-26  px-6 md:px-12 md:pt-28 lg:px-24 relative min-h-screen flex items-center justify-center overflow-hidden ">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220, 38, 38, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="container mx-auto grid grid-cols-1 xl:grid-cols-2  gap-4 md:gap-12  relative z-10 ">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.h1
            className="text-5xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Watch{" "}
            <span className="text-red-500">
              <AnimatedTextCycle
                words={["Movies", "Shows"]}
                className="text-red-500   "
                interval={3000}
              />
            </span>
            <br />
            Wherever You Are
          </motion.h1>

          <motion.p
            className="text-lg text-gray-300 max-w-lg xl:text-2xl  "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            Discover, watch, and bond over movies and shows with others. Built
            for connection, built for fun.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={handleClick}
              className="bg-red-600 mb-4 hover:bg-red-700 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all cursor-pointer duration-300 font-[family-name:var(--font-geist-mono)]"
            >
              <FaPlayCircle className="text-xl" />
              Start TWOGETHER
            </button>
          </motion.div>
        </motion.div>

        {/* Right Content - Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
            {/* Browser Header */}
            <div className="bg-gray-800 px-4 py-3 flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs md:text-lg text-gray-300">
                https://twogether-live.vercel.app/
              </div>
            </div>

            {/* Browser Content */}
            <div className="aspect-video bg-gradient-to-br from-red-900/30 to-black p-8 flex items-center justify-center">
              <div className="text-center space-y-4">
                <button className="w-16 mx-auto h-16 rounded-full bg-white backdrop-blur-sm flex items-center justify-center hover:bg-red-600 transition">
                  <SiPlayerdotme className="-rotate-90 text-red-500 text-4xl" />
                </button>

                <h3 className="text-2xl font-bold uppercase font-[family-name:var(--font-geist-mono)]">
                  <span className="text-red-500">Two</span>gether
                </h3>
                <p className="text-gray-400 font-[family-name:var(--font-geist-sans)]">
                  Social Movie Streaming
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

"use client";

import { useRouter } from "next/navigation";
import { FaPlayCircle } from "react-icons/fa";
import { toast } from "sonner";
import { AnimatedTextCycle } from "@/components/ui/AnimatedTextCycle";
import { SiPlayerdotme } from "react-icons/si";
import { HeroScrollPreview } from "@/components/ui/HeroScrollPreview";
import Image from "next/image";

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
    router.push("/recos");
  };

  return (
    <section className="px-6 md:px-12  pt-28 pb-16 md:pb-0 md:pt-8 lg:pt-28 lg:pb-20 xl:pt-48 xl:pb-44 2xl:pt-60 2xl:pb-44 lg:px-24 relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <HeroScrollPreview
        titleComponent={
          <>
            {/* Headline + Button */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Watch{" "}
                <span className="text-red-500">
                  <AnimatedTextCycle
                    words={["Movies", "Shows"]}
                    className="text-red-500"
                    interval={3000}
                  />
                </span>
                <br />
                Wherever You Are
              </h1>

              <p className="text-base md:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto font-[family-name:var(--font-geist-mono)]">
                Discover, and watch over movies and shows with others. Built for
                connection, built for fun.
              </p>

              <div>
                <button
                  onClick={handleClick}
                  className="bg-red-600 hover:bg-red-700 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center gap-3 justify-center cursor-pointer transition-all duration-300 mx-auto font-[family-name:var(--font-geist-mono)]"
                >
                  <FaPlayCircle className="text-xl" />
                  Start TWOGETHER
                </button>
              </div>
            </div>
          </>
        }
      >
        {/* IMAGE BACKGROUND WITH OVERLAY */}
        <div className="relative w-full h-full">
          <Image
            src="/hero.webp"
            alt="hero"
            unoptimized
            fill
            className="object-cover rounded-2xl"
            draggable={false}
            priority
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70 rounded-2xl z-10" />

          {/* Foreground Content */}
          <div className="relative z-20 flex items-center justify-center h-full p-8">
            <div className="text-center space-y-4">
              <button className="group cursor-pointer w-14 h-14 rounded-full bg-white backdrop-blur-sm flex items-center justify-center transition mx-auto hover:bg-red-600">
                <SiPlayerdotme className="-rotate-90 text-red-500 group-hover:text-white text-4xl transition-colors duration-300" />
              </button>

              <h3 className="text-2xl font-bold uppercase font-[family-name:var(--font-geist-mono)]">
                <span className="text-red-500">Two</span>gether
              </h3>
              <p className="text-gray-300 font-[family-name:var(--font-geist-sans)]">
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
      </HeroScrollPreview>
    </section>
  );
};

export default Hero;

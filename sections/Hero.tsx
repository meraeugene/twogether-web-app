/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { CurrentUser } from "@/types/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import Link from "next/link";

interface TwogetherHeroProps {
  user: CurrentUser | null;
  totalActiveUsers: number;
}

export default function TwogetherHero({
  user,
  totalActiveUsers,
}: TwogetherHeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const router = useRouter();

  const { data: movieCovers } = useSWR<string[]>("/api/tmdb/popular", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 86400000, // 24 hours
  });

  useEffect(() => {
    const handleMouseMove = (e: { clientX: number; clientY: number }) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleClick = () => {
    if (!user) {
      toast.error("Please sign in to start TWOGETHER.");
      return;
    }
    router.push("/recos");
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden py-20 lg:py-0">
      {/* Animated Movie Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 grid-rows-4 gap-4 p-4 w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        >
          {movieCovers?.map((cover, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-lg transform transition-all duration-700"
              style={{
                animation: `float ${3 + (idx % 3)}s ease-in-out infinite`,
                animationDelay: `${idx * 0.2}s`,
              }}
            >
              <img
                src={cover}
                alt=""
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80 z-10"></div>
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl z-10 hidden md:block"></div>

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-screen px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl  lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Watch Shows
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-600 via-red-400 to-red-300 bg-clip-text text-transparent animate-gradient">
              Wherever You Are
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover and watch over{" "}
            <span className="text-red-400 font-semibold">
              movies and shows with others
            </span>
            . Built for connection, built for fun.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col cursor-pointer sm:flex-row gap-4 justify-center items-center mb-8 lg:mb-14 2xl:mb-16">
            <button
              onClick={handleClick}
              className="group relative px-10 py-5 bg-gradient-to-r from-red-600 to-red-800 rounded-full text-white text-lg cursor-pointer font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-600/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Play size={24} fill="white" />
                Start TWOGETHER
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <Link
              href="#demo"
              className="px-10 cursor-pointer py-5 bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-full text-white text-lg font-bold hover:bg-white/10 hover:border-white/40 transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-5 md:gap-12 text-center">
            <div className="group cursor-default">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                10K+
              </div>
              <div className="text-gray-400 text-sm  uppercase tracking-wider">
                Movies & Shows
              </div>
            </div>
            <div className="group cursor-default">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {totalActiveUsers}+
              </div>
              <div className="text-gray-400 text-sm  uppercase tracking-wider">
                Active Users
              </div>
            </div>
            <div className="group cursor-default">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                4.9★
              </div>
              <div className="text-gray-400 text-sm  uppercase tracking-wider">
                User Rating
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-2 hidden lg:block  md:bottom-4  2xl:bottom-8  left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/60 text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

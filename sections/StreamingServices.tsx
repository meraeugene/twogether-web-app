/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { streamingServices } from "@/data/streamingServices";
import { Play } from "lucide-react"; // Optional: adding icons for depth

export default function StreamingServices() {
  // Split data for the different sections
  const featuredServices = streamingServices.slice(0, 6);

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto ">
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                Streaming Services
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-white leading-[0.9]">
              Every platform, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                seamlessly integrated.
              </span>
            </h2>
          </div>

          <p className="text-neutral-400 font-light text-lg max-w-xs ">
            All your favorite streaming services, all in one place. Just pure,
            uninterrupted entertainment.
          </p>
        </div>

        {/* --- GRID SYSTEM --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 1. THE HERO CARD (8 Columns) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="md:col-span-8 relative group overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/10 p-8 md:p-12 flex flex-col justify-between min-h-[450px]"
          >
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                <Play className="text-red-500 fill-red-500" size={20} />
              </div>
              <h3 className="text-3xl md:text-4xl font-medium text-white mb-4">
                Native 4K HDR <br /> Streaming Engine
              </h3>
              <p className="text-neutral-400 text-lg font-light leading-relaxed">
                Our proprietary integration bypasses standard browser
                limitations to deliver raw, uncompressed bitrates from every
                major provider.
              </p>
            </div>

            <div className="relative z-10 flex gap-4 mt-8">
              <div className=" px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white">
                Ultra Low Latency
              </div>
              <div className=" px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white">
                Secure Sync
              </div>
            </div>
          </motion.div>

          {/* 2. THE LOGO STACK (4 Columns) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            {featuredServices.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-square rounded-3xl bg-white border border-white/5 flex items-center justify-center p-6   transition-all duration-500"
              >
                {/* Logo */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain  "
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { features } from "@/data/features";
import { Shield, Zap, Users, Globe, Tv, Sparkles } from "lucide-react";

const icons = [Zap, Users, Shield, Globe, Tv, Sparkles];

const Features = () => {
  return (
    <section
      id="features"
      className="relative py-32 bg-[#030303] overflow-hidden border-t border-white/5 px-7 md:px-12 lg:px-24"
    >
      {/* --- AMBIENT DEPTH --- */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* --- HEADER (UNTOUCHED TEXT) --- */}
        <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
              <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                Our Features
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-white leading-[0.85] mb-10">
              6 Reasons to Join <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 ">
                in the Ecosystem.
              </span>
            </h2>

            <p className="text-neutral-400 text-lg font-light max-w-md">
              6 reasons why our ecosystem is the new standard for modern
              cinephiles. Built for speed, social, and visual fidelity.
            </p>
          </motion.div>
        </div>

        {/* --- NEW LAYOUT: THE CINEMATIC STRIPS --- */}
        <div className="flex flex-col gap-px bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden">
          {features.map((feature, index) => {
            const Icon = icons[index % icons.length];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-[#050505] hover:bg-[#080808] transition-colors duration-700"
              >
                {/* Horizontal Hover Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                {/* Left: Identity */}
                <div className="flex items-center gap-8 z-10 w-full md:w-auto mb-6 md:mb-0">
                  <span className="text-xs font-mono text-neutral-600 group-hover:text-red-500 transition-colors">
                    /0{index + 1}
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon
                      className="text-white group-hover:text-red-500 transition-colors relative"
                      size={28}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tighter">
                    {feature.title}
                  </h3>
                </div>

                {/* Right: Description */}
                <div className="relative z-10 w-full md:w-1/3">
                  <p className="text-neutral-400 text-sm md:text-base leading-relaxed group-hover:text-neutral-200 transition-colors duration-500">
                    {feature.description}
                  </p>
                </div>

                {/* Background Text Effect (Subtle) */}
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[12rem] font-black text-white/[0.02] pointer-events-none select-none group-hover:text-red-600/[0.03] transition-colors">
                  {index + 1}
                </span>

                {/* Subtle Interactive Light Bar */}
                <div className="absolute bottom-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-red-500/50 transition-all duration-700" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

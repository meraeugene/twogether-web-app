"use client";

import { motion } from "framer-motion";
import { features } from "@/data/features";
import { Shield, Zap, Users, Globe, Tv, Sparkles } from "lucide-react";

const icons = [Zap, Users, Shield, Globe, Tv, Sparkles];

const Features = () => {
  return (
    <section
      id="features"
      className="relative py-20 md:py-24 lg:py-28 bg-[#030303] overflow-hidden border-t border-white/5 px-6 sm:px-8 md:px-12 lg:px-20"
    >
      {/* AMBIENT DEPTH */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto sm:px-8">
        {/* HEADER */}
        <div className="mb-16 md:mb-20 lg:mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
              <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                Our Features
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tighter text-white leading-[0.9] mb-6 md:mb-10">
              6 Reasons to Join <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                in the Ecosystem.
              </span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base md:text-lg font-light max-w-md">
              6 reasons why our ecosystem is the new standard for modern
              cinephiles. Built for speed, social, and visual fidelity.
            </p>
          </motion.div>
        </div>

        {/* FEATURE STRIPS */}
        <div className="flex flex-col gap-px bg-white/5 border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden">
          {features.map((feature, index) => {
            const Icon = icons[index % icons.length];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 p-6 sm:p-8 md:p-10 lg:p-12 bg-[#050505] hover:bg-[#080808] transition-colors duration-700"
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-5 md:gap-8 z-10">
                  <span className="text-xs font-mono text-red-500 md:text-neutral-600 group-hover:text-red-500 transition-colors">
                    /0{index + 1}
                  </span>

                  <div className="relative">
                    <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon
                      className="md:text-white text-red-500 group-hover:text-red-500 transition-colors relative"
                      size={26}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white uppercase tracking-tight">
                    {feature.title}
                  </h3>
                </div>

                {/* DESCRIPTION */}
                <div className="relative z-10 md:max-w-md lg:max-w-lg">
                  <p className="text-neutral-400 text-sm sm:text-base leading-relaxed group-hover:text-neutral-200 transition-colors duration-500">
                    {feature.description}
                  </p>
                </div>

                {/* BACKGROUND NUMBER */}
                <span className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[12rem] font-black text-white/[0.02] pointer-events-none select-none group-hover:text-red-600/[0.03] transition-colors">
                  {index + 1}
                </span>

                {/* LEFT ACCENT BAR */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                {/* BOTTOM LIGHT BAR */}
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

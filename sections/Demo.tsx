/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { data } from "@/data/demo";

const Demo = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % data.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-[#030303] overflow-hidden border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fb2c36_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[500px] lg:w-[600px] h-[400px] md:h-[500px] lg:h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="mb-8 md:mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6"
              >
                <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                  Demo Guide
                </span>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tighter text-white leading-[0.9]">
                Guide on <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                  How to Reco.
                </span>
              </h2>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3">
              {data.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`relative group p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl transition-all duration-500 text-left border ${
                    activeTab === idx
                      ? "bg-white/[0.03] border-white/10"
                      : "border-transparent hover:bg-white/[0.01] opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className="relative z-10 flex items-start gap-4 md:gap-6">
                    <span
                      className={`font-mono text-xs md:text-sm ${
                        activeTab === idx ? "text-red-500" : "text-neutral-500"
                      }`}
                    >
                      0{idx + 1}
                    </span>

                    <div>
                      <h3 className="text-base md:text-lg lg:text-xl font-medium text-white mb-1">
                        {step.title}
                      </h3>

                      <AnimatePresence>
                        {activeTab === idx && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-neutral-400 text-sm md:text-base font-light overflow-hidden leading-relaxed"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {activeTab === idx && (
                    <motion.div
                      layoutId="tab-highlight"
                      className="absolute inset-0 border-l-2 border-red-600 bg-gradient-to-r from-red-600/5 to-transparent rounded-xl md:rounded-2xl pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE (PHONE) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-[340px] group">
              {/* Phone */}
              <div className="relative aspect-[9/19.5] rounded-[3rem] border-[6px] md:border-[8px] border-[#1a1a1a] bg-black shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden z-10">
                {/* Dynamic island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 md:w-16 h-3 md:h-4 bg-black rounded-full z-50 border border-white/5" />

                <div className="relative w-full h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={data[activeTab].image}
                        alt={data[activeTab].title}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Hardware buttons */}
              <div className="absolute -left-1.5 top-[20%] w-[4px] h-10 bg-neutral-800 rounded-l-sm" />
              <div className="absolute -left-1.5 top-[28%] w-[4px] h-16 bg-neutral-800 rounded-l-sm" />
              <div className="absolute -right-1.5 top-[25%] w-[4px] h-20 bg-neutral-800 rounded-r-sm" />

              {/* Glow */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-16 md:h-20 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;

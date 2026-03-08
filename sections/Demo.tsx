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
    <section className="relative border-t border-white/5 bg-[#030303] py-24 px-7 md:px-12 lg:px-24 min-h-screen flex items-center justify-center overflow-hidden">
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fb2c36_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl  w-full">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-0  items-center">
          {/* --- LEFT: STEP NAVIGATION --- */}
          <div className="lg:col-span-5 space-y-4">
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6"
              >
                <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                  Demo Guide
                </span>
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-white leading-[0.85]">
                Guide on <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                  How to Reco.{" "}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {data.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`relative cursor-pointer group p-6 rounded-2xl transition-all duration-500 text-left border ${
                    activeTab === idx
                      ? "bg-white/[0.03] border-white/10"
                      : "border-transparent hover:bg-white/[0.01] opacity-40 hover:opacity-100"
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-6">
                    <span
                      className={`font-mono text-sm ${activeTab === idx ? "text-red-500" : "text-neutral-500"}`}
                    >
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className=" md:text-xl font-medium text-white mb-1">
                        {step.title}
                      </h3>
                      <AnimatePresence>
                        {activeTab === idx && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-neutral-400 text-sm md:text-base  font-light max-w-xs overflow-hidden leading-relaxed"
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
                      className="absolute inset-0 border-l-2 border-red-600 bg-gradient-to-r from-red-600/5 to-transparent rounded-2xl pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: IPHONE PORTRAIT STAGE --- */}
          <div className="lg:col-span-7 relative flex justify-end">
            <div className="relative w-full max-w-[340px] group">
              {/* IPHONE CHASSIS */}
              <div className="relative aspect-[9/19.5] rounded-[3.5rem] border-[8px] border-[#1a1a1a] bg-black shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden z-10">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-50 border border-white/5" />

                {/* SCREEN CONTENT */}
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
                      {/* High-End Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Hardware Buttons */}
              <div className="absolute -left-1.5 top-[20%] w-[4px] h-10 bg-neutral-800 rounded-l-sm z-0" />
              <div className="absolute -left-1.5 top-[28%] w-[4px] h-16 bg-neutral-800 rounded-l-sm z-0" />
              <div className="absolute -right-1.5 top-[25%] w-[4px] h-20 bg-neutral-800 rounded-r-sm z-0" />

              {/* Reflection / Floor Shadow */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-20 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;

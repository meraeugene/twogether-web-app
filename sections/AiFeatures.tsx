"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const AiFeatures = () => {
  const images = [
    "/demo/ai1.png",
    "/demo/ai2.png",
    "/demo/ai3.png",
    "/demo/ai4.png",
  ];

  return (
    <section
      id="features"
      className="relative py-20 md:py-28 lg:py-32 bg-[#030303] overflow-hidden border-t border-white/5"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fb2c36_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[500px] lg:w-[600px] h-[400px] md:h-[500px] lg:h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 md:mb-20 lg:mb-24">
          <div className="w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6"
            >
              <span className="text-[10px] font-bold tracking-[0.3em] text-red-400 uppercase">
                Intelligence
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tighter text-white leading-[0.9]"
            >
              Ai Reco <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Watch Gemini.
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-neutral-400 text-sm sm:text-base md:text-lg font-light max-w-md lg:max-w-lg leading-relaxed"
          >
            Experience the future of social streaming with features designed for
            deep connection and cinematic quality.
          </motion.p>
        </div>

        {/* PHONE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                type: "spring",
                stiffness: 40,
              }}
              viewport={{ once: true }}
              className={`relative flex justify-center ${
                i % 2 === 0 ? "lg:translate-y-16" : ""
              }`}
            >
              {/* DEVICE */}
              <div className="relative w-full max-w-[240px] sm:max-w-[260px] md:max-w-[280px] lg:max-w-[300px] aspect-[9/19.5] rounded-[3rem] md:rounded-[3.5rem] border-[5px] md:border-[6px] border-[#1a1a1a] bg-[#000] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 overflow-hidden">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 md:w-14 h-3 bg-black rounded-full z-40 border border-white/5" />

                {/* SCREEN */}
                <div className="relative w-full h-full z-10">
                  <Image
                    src={src}
                    alt={`AI Feature Showcase ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />

                  <div className="absolute top-0 left-0 right-0 h-16 md:h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_0_2px_1px_rgba(255,255,255,0.1)] pointer-events-none z-30" />
              </div>

              {/* HARDWARE BUTTONS */}
              <div className="absolute hidden md:block -left-1 top-[22%] w-[3px] h-8 bg-neutral-800 rounded-l-sm" />
              <div className="absolute hidden md:block -left-1 top-[30%] w-[3px] h-14 bg-neutral-800 rounded-l-sm" />
              <div className="absolute hidden md:block -right-1 top-[28%] w-[3px] h-16 bg-neutral-800 rounded-r-sm" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AiFeatures;

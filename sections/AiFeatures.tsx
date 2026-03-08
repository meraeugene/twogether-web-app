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
      className="relative pt-24 pb-64 px-7 border-t border-white/5 md:px-12 lg:px-24 overflow-hidden bg-[#030303]"
    >
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fb2c36_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* --- HEADER (UNTOUCHED) --- */}
        <div className=" flex flex-col md:flex-row items-end justify-between gap-8 mb-24">
          <div className="w-full">
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
              className="text-5xl md:text-7xl font-medium tracking-tighter text-white leading-[0.85] "
            >
              Ai Reco <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Watch Gemini.
              </span>
            </motion.h2>
          </div>

          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-neutral-400 text-lg  font-light max-w-lg leading-relaxed"
            >
              Experience the future of social streaming with features designed
              for deep connection and cinematic quality.
            </motion.p>
          </div>
        </div>

        {/* --- IPHONE 17 PRO MAX GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
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
              className={`relative flex justify-center ${i % 2 === 0 ? "lg:translate-y-16" : ""}`}
            >
              {/* THE DEVICE: 19.5:9 Aspect Ratio */}
              <div className="relative w-full max-w-[320px] aspect-[9/19.5] rounded-[3.5rem] border-[6px] border-[#1a1a1a] bg-[#000] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 overflow-hidden">
                {/* Dynamic Island (Thinner/Refined) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-black rounded-full z-40 border border-white/5" />

                {/* SCREEN CONTAINER */}
                <div className="relative w-full h-full z-10">
                  <Image
                    src={src}
                    alt={`AI Feature Showcase ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  {/* High-End Glass Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />

                  {/* Subtle Top Ambient Light */}
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Titanium Hardware Shadow/Depth */}
                <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_0_2px_1px_rgba(255,255,255,0.1)] pointer-events-none z-30" />
              </div>

              {/* External Buttons (Floating outside the chassis) */}
              <div className="absolute -left-1 top-[22%] w-[3px] h-8 bg-neutral-800 rounded-l-sm z-0" />
              <div className="absolute -left-1 top-[30%] w-[3px] h-14 bg-neutral-800 rounded-l-sm z-0" />
              <div className="absolute -right-1 top-[28%] w-[3px] h-16 bg-neutral-800 rounded-r-sm z-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AiFeatures;

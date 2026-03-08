"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

const Faqs = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="relative py-32 bg-[#030303] overflow-hidden px-7 md:px-12 lg:px-24 border-t border-white/5"
    >
      {/* --- BACKGROUND DEPTH --- */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* --- LEFT SIDE: THE FIXED INTEL --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
                <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase font-mono">
                  Intelligence Support
                </span>
              </div>

              <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-white leading-[0.85] mb-10">
                Frequently Asked <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 ">
                  Questions.
                </span>
              </h2>

              <p className="text-neutral-400 text-lg font-light max-w-sm leading-relaxed">
                Find clarity on our ecosystem and how we&lsquo;re redefining the
                cinephile experience through cinematic intelligence.
              </p>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: THE DATA MODULES --- */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl border transition-all duration-700 ${
                    isOpen
                      ? "bg-neutral-900/40 border-red-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      : "bg-[#080808] border-white/5 hover:border-white/10"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full cursor-pointer hover:bg-neutral-900/10 transition-all duration-300 ease-in-out text-left p-8  flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-8">
                      {/* Index with Scanline Effect */}
                      <div className="relative hidden sm:block">
                        <span
                          className={`text-xs font-mono transition-colors duration-500 ${
                            isOpen ? "text-red-500" : "text-neutral-700"
                          }`}
                        >
                          {index + 1 < 10 ? `0${index + 1}` : index + 1}
                        </span>
                        {isOpen && (
                          <motion.div
                            layoutId="scan"
                            className="absolute -left-2 top-0 bottom-0 w-[1px] bg-red-500 shadow-[0_0_8px_red]"
                          />
                        )}
                      </div>

                      <h3
                        className={`text-xl md:text-2xl font-medium tracking-tight transition-all duration-500 ${
                          isOpen
                            ? "text-white"
                            : "text-neutral-400 group-hover:text-white"
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-10 h-10 rounded-full border border-white/5 flex items-center justify-center transition-all duration-500 ${
                        isOpen
                          ? "bg-red-600 border-red-600 rotate-90"
                          : "bg-neutral-900 group-hover:bg-neutral-800"
                      }`}
                    >
                      <ChevronRight className="text-white w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <div className="px-8 md:px-10 pb-10 ">
                          <div className="space-y-6">
                            <p className="text-lg text-neutral-400 font-light leading-relaxed max-w-xl">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faqs;

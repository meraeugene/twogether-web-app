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
      className="relative py-20 md:py-24 lg:py-32 bg-[#030303] overflow-hidden px-6 sm:px-8 md:px-12 lg:px-20 border-t border-white/5"
    >
      {/* BACKGROUND */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] md:w-[400px] lg:w-[500px] h-[300px] md:h-[400px] lg:h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl sm:px-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 lg:gap-24">
          {/* LEFT SIDE */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 h-fit">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6 md:mb-8">
                <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase font-mono">
                  Intelligence Support
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-medium tracking-tighter text-white leading-[0.9] mb-6 md:mb-10">
                Frequently Asked <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                  Questions.
                </span>
              </h2>

              <p className="text-neutral-400 text-sm sm:text-base md:text-lg font-light max-w-sm leading-relaxed">
                Find clarity on our ecosystem and how we&apos;re redefining the
                cinephile experience through cinematic intelligence.
              </p>
            </motion.div>
          </div>

          {/* FAQ LIST */}
          <div className="lg:col-span-6 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl md:rounded-3xl border transition-all duration-700 ${
                    isOpen
                      ? "bg-neutral-900/40 border-red-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      : "bg-[#080808] border-white/5 hover:border-white/10"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 sm:p-6 md:p-8 flex items-center justify-between gap-4 sm:gap-6"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                      {/* INDEX */}
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
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-tight transition-all duration-500 ${
                          isOpen
                            ? "text-white"
                            : "text-neutral-400 group-hover:text-white"
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/5 flex items-center justify-center transition-all duration-500 ${
                        isOpen
                          ? "bg-red-600 border-red-600 rotate-90"
                          : "bg-neutral-900 hover:bg-neutral-800"
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
                        transition={{
                          duration: 0.45,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      >
                        <div className="px-5 sm:px-6 md:px-10 pb-6 md:pb-10">
                          <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-light leading-relaxed max-w-xl">
                            {faq.answer}
                          </p>
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

"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.23, 0.86, 0.39, 0.96] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const Faqs = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faqs" className="pb-20 pt-16 relative px-7 md:px-12 lg:px-48">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220, 38, 38, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div className="text-center  mb-10" variants={fadeInUp}>
          <h2 className="text-4xl xl:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Frequently Asked <span className="text-red-500">Questions</span>
            </span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm"
              variants={fadeInUp}
            >
              <button
                className="w-full cursor-pointer px-4 py-6 md:py-5 text-left flex gap-4 items-center justify-between hover:bg-white/[0.05] transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="text-base font-semibold text-white font-[family-name:var(--font-geist-sans)] xl:text-xl">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 xl:text-xl bg-white/5 backdrop-blur-3xl font-[family-name:var(--font-geist-mono)] pb-6 text-gray-400 leading-relaxed border-t border-white/10 pt-6">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Faqs;

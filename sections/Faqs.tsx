"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";
import { ChevronDown } from "lucide-react";

const Faqs = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faqs" className="pb-20 pt-16 relative px-7 md:px-12 lg:px-48">
      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl xl:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Frequently Asked <span className="text-red-500">Questions</span>
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={index}
                className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm transition-colors"
              >
                <button
                  className="w-full cursor-pointer px-4 py-6 md:py-5 text-left flex items-center justify-between hover:bg-white/[0.05] transition"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${index}`}
                >
                  <span className="text-base font-semibold text-white font-[family-name:var(--font-geist-sans)] xl:text-xl">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`faq-content-${index}`}
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "max-h-[500px] opacity-100 pt-4 pb-6"
                      : "max-h-0 opacity-0"
                  } px-4 xl:text-xl bg-black/50 backdrop-blur-3xl font-[family-name:var(--font-geist-mono)] text-gray-300 leading-relaxed border-t border-white/10`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faqs;

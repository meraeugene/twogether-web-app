"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { submitFeedback } from "@/actions/feedbackActions";
import { mutate } from "swr";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { motion } from "framer-motion";

const FeedbackForm = () => {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("text", text.trim());

    startTransition(async () => {
      const result = await submitFeedback(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        mutate("/api/testimonials");
        toast.success("Feedback recorded!");
        setName("");
        setText("");
      }
    });
  };

  return (
    <section
      id="feedback"
      className="relative py-20 md:py-24 lg:py-32 bg-[#030303] overflow-hidden px-6 sm:px-8 md:px-12 lg:px-20 border-t border-white/5"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#fb2c36_0.8px,transparent_0.8px)] [background-size:32px_32px]" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[800px] h-[400px] md:h-[500px] lg:h-[600px] bg-red-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto sm:px-8">
        {/* HEADER */}
        <div className="mb-16 md:mb-24 lg:mb-32 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6 md:mb-8">
              <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase font-mono">
                Feedback Uplink
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-medium tracking-tighter text-white leading-[0.9] mb-6 md:mb-10">
              Voice Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                Experience.
              </span>
            </h2>
          </motion.div>
        </div>

        {/* FORM */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full lg:w-3/5 relative">
            {/* Vertical accent line (desktop only) */}
            <div className="hidden lg:block absolute -left-16 top-0 bottom-0 w-px bg-gradient-to-b from-red-600 via-red-600/20 to-transparent" />

            <form
              onSubmit={handleSubmit}
              className="space-y-10 md:space-y-14 lg:space-y-20 relative"
            >
              {/* NAME */}
              <div className="relative group">
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-3 font-mono">
                  Sender Identity
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 px-0 py-3 md:py-4 text-base sm:text-lg md:text-xl text-white font-mono placeholder-white/30 focus:outline-none focus:border-red-600 transition-all"
                  placeholder="Joe Goldberg"
                />
              </div>

              {/* MESSAGE */}
              <div className="relative group">
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-3 font-mono">
                  Message
                </label>

                <textarea
                  rows={1}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  className="w-full bg-transparent border-b border-white/10 px-0 py-3 md:py-4 text-base sm:text-lg md:text-xl text-white font-mono placeholder-white/30 focus:outline-none focus:border-red-600 transition-all resize-none overflow-hidden"
                  placeholder="Your thoughts and suggestions."
                />
              </div>

              {/* ACTION AREA */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12 pt-4 md:pt-6">
                <p className="text-neutral-500 text-xs max-w-[280px] leading-relaxed">
                  Your data helps us calibrate the future. Suggestions or
                  thoughts—we process it all.
                </p>

                <button
                  type="submit"
                  disabled={isPending}
                  className="group cursor-pointer relative flex items-center justify-center p-1 bg-neutral-900 rounded-full border border-white/10 transition-all duration-500 hover:border-red-600/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 md:gap-4 bg-[#080808] rounded-full py-2.5 md:py-3 px-6 md:px-8 transition-colors group-hover:bg-black">
                    {/* Recording dot */}
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        isPending
                          ? "bg-red-600 animate-pulse"
                          : "bg-neutral-700 group-hover:bg-red-600 group-hover:shadow-[0_0_10px_#dc2626]"
                      }`}
                    />

                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
                      {isPending ? "Recording" : "Start Record"}
                    </span>

                    <div className="ml-2 w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
                      <HiOutlineChatBubbleLeftRight
                        size={16}
                        className="text-neutral-500 group-hover:text-white"
                      />
                    </div>
                  </div>

                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="48%"
                      className="fill-none stroke-red-600 stroke-[1px] [stroke-dasharray:20_180] animate-[spin_4s_linear_infinite]"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackForm;

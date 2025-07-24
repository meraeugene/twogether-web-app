"use client";

import React from "react";
import { motion } from "framer-motion";

export const FeedbackColumn = (props: {
  className?: string;
  testimonials: {
    text: string;
    name: string;
    is_new: boolean;
  }[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, name, is_new: isNew }, i) => {
              return (
                <div
                  key={i}
                  className="relative p-6 border border-red-500/20 hover:border-red-500/50 rounded-3xl transition-transform duration-300 hover:scale-[1.015] max-w-xs w-full"
                >
                  {isNew && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow">
                      NEW
                    </span>
                  )}
                  <div className="text-white  font-medium  text-base leading-relaxed tracking-wide italic">
                    “{text}”
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex flex-col">
                      <div className="font-sans text-base text-neutral-300 tracking-tight md:text-lg">
                        — {name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

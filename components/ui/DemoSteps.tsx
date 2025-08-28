"use client";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const DemoSteps = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full  bg-black text-white font-sans  md:px-10"
      ref={containerRef}
    >
      <div className="max-w-4xl mx-auto pt-16 md:pt-20 pb-4 px-7  md:px-8 lg:px-10">
        <h2 className="text-3xl font-bold md:text-4xl  font-[family-name:var(--font-geist-sans)] mb-4 text-black dark:text-white max-w-4xl">
          <span className="text-red-500">How to recommend</span> a movie or show
        </h2>
        <p className="text-gray-300  text-sm md:text-base lg:text-lg leading-relaxed font-[family-name:var(--font-geist-mono)] max-w-xl">
          Follow this quick step-by-step guide to recommend movies and shows you
          love — it only takes a few taps to share something meaningful.
        </p>
      </div>

      <div ref={ref} className="relative max-w-4xl mx-auto pb-16">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-20  md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-8  w-8 absolute left-3 md:left-3 rounded-full bg-white flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-black border border-white p-2" />
              </div>

              <h3 className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold  text-red-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20  pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold  font-[family-name:var(--font-geist-sans)]  text-red-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-8 md:left-8 top-0 overflow-hidden w-[2px] 
    bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] 
    from-transparent from-[0%] via-neutral-800 to-transparent to-[99%]
    [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[3px]
    bg-gradient-to-b from-white via-red-500 to-red-700
    rounded-full animate-pulse
    shadow-[0_0_12px_rgba(255,0,0,0.5)]"
          />
        </div>
      </div>
    </div>
  );
};

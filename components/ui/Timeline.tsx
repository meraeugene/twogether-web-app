"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  order: number;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full  font-sans " ref={containerRef}>
      <div ref={ref} className="relative max-w-3xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-16  md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-7  w-7 absolute left-3 md:left-3 rounded-full bg-white flex items-center justify-center">
                <div className="h-4 w-4 rounded-full  bg-gray-900 p-2" />
              </div>

              <div className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold  ">
                <h1 className="text-red-500 text-5xl font-sans font-extrabold  mb-2">
                  {item.order < 10 ? `0${item.order}` : item.order}
                </h1>
                {item.title}
              </div>
            </div>

            <div className="relative pl-20 md:pl-12 w-full">
              <h2 className="text-red-500 text-5xl font-sans font-extrabold md:hidden mb-2">
                {item.order < 10 ? `0${item.order}` : item.order}
              </h2>

              <h3 className="md:hidden  block text-2xl mb-4 text-left font-[family-name:var(--font-geist-sans)]  font-semibold">
                {item.title}
              </h3>
              <div className="font-[family-name:var(--font-geist-mono)] ">
                {item.content}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] 
    bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] 
    from-transparent via-neutral-500 to-transparent 
    [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] 
      bg-gradient-to-t from-red-600 via-white to-transparent 
      from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const previews = [
  {
    src: "/demo/ai1.png",
    title: "Find your next watch",
    description: "Start with a mood, a genre, or something you already love.",
  },
  {
    src: "/demo/ai2.png",
    title: "Discover your AI picks",
    description: "Explore recommendations that match what you have in mind.",
  },
  {
    src: "/demo/ai3.png",
    title: "Press play",
    description: "Go from a recommendation straight to your next episode.",
  },
  {
    src: "/demo/ai4.png",
    title: "Watch with Gemini",
    description: "Ask questions and explore the story as you watch.",
  },
];

const AiFeatures = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const showImage = (index: number) => {
    const carousel = carouselRef.current;
    const slide = carousel?.children[index] as HTMLElement | undefined;
    const firstSlide = carousel?.firstElementChild as HTMLElement | null;
    if (!carousel || !slide || !firstSlide) return;

    carousel.scrollTo({
      left: slide.offsetLeft - firstSlide.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden border-t border-white/5 bg-[#030303] py-20 md:py-28 lg:py-32"
    >
      <div className="page-gutter page-width relative grid gap-10 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">
              Intelligence
            </span>
          </div>

          <h2 className="text-3xl font-medium leading-[0.95] tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Ai Reco <br />
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              Watch Gemini.
            </span>
          </h2>

          <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-neutral-400 sm:text-base md:text-lg">
            Discover your next favorite, press play, and explore the story with
            Gemini. Take a look at how it works.
          </p>

          <div className="mt-8 hidden border-t border-white/10 pt-6 lg:block">
            <p className="font-mono text-xs tracking-widest text-red-400">
              {String(activeIndex + 1).padStart(2, "0")} / 04
            </p>
            <h3 className="mt-3 text-2xl font-medium text-white">
              {previews[activeIndex].title}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
              {previews[activeIndex].description}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div
            ref={carouselRef}
            id="intelligence-showcase"
            role="region"
            aria-label="AI feature screenshots"
            aria-roledescription="carousel"
            tabIndex={0}
            onScroll={(event) => {
              const carousel = event.currentTarget;
              const first = carousel.children[0] as HTMLElement;
              const second = carousel.children[1] as HTMLElement;
              const step = second.offsetLeft - first.offsetLeft;
              if (step > 0) {
                setActiveIndex(
                  Math.max(
                    0,
                    Math.min(previews.length - 1, Math.round(carousel.scrollLeft / step)),
                  ),
                );
              }
            }}
            className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-red-500 [&::-webkit-scrollbar]:hidden"
          >
            {previews.map((preview, index) => (
              <figure
                key={preview.src}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${previews.length}: ${preview.title}`}
                className="m-0 flex w-full shrink-0 snap-center flex-col items-center"
              >
                <Image
                  src={preview.src}
                  alt={preview.title}
                  width={750}
                  height={1648}
                  unoptimized
                  draggable={false}
                  className="block h-auto w-full max-w-[300px] sm:max-w-[320px]"
                />
                <figcaption className="mt-5 max-w-sm text-center lg:sr-only">
                  <h3 className="text-lg font-medium text-white">{preview.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {preview.description}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              aria-controls="intelligence-showcase"
              disabled={activeIndex === 0}
              onClick={() => showImage(activeIndex - 1)}
              className="min-h-11 cursor-pointer text-xs text-neutral-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-default disabled:opacity-25"
            >
              Previous
            </button>
            <div className="flex items-center" role="group" aria-label="Choose a screenshot">
              {previews.map((preview, index) => (
                <button
                  key={preview.src}
                  type="button"
                  aria-label={`Show screenshot ${index + 1}: ${preview.title}`}
                  aria-controls="intelligence-showcase"
                  aria-current={activeIndex === index ? "true" : undefined}
                  onClick={() => showImage(index)}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-red-500"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                      activeIndex === index ? "w-6 bg-red-500" : "w-1.5 bg-white/25"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-controls="intelligence-showcase"
              disabled={activeIndex === previews.length - 1}
              onClick={() => showImage(activeIndex + 1)}
              className="min-h-11 cursor-pointer text-xs text-neutral-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-default disabled:opacity-25"
            >
              Next
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-neutral-500">Swipe to explore</p>
        </div>
      </div>
    </section>
  );
};

export default AiFeatures;

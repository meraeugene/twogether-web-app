"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  [
    { src: "/demo/ai1.png", alt: "Find your next watch" },
    { src: "/demo/ai2.png", alt: "Discover your AI picks" },
  ],
  [
    { src: "/demo/ai3.png", alt: "Press play" },
    { src: "/demo/ai4.png", alt: "Watch with Gemini" },
  ],
];

const AiFeatures = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const showSlide = useCallback((index: number) => {
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
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const carousel = carouselRef.current;
      const gallery = carousel?.parentElement;
      if (!carousel || !gallery || document.hidden) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (
        (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
          gallery.matches(":hover")) ||
        gallery.querySelector(":focus-visible")
      ) {
        return;
      }

      const bounds = carousel.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

      showSlide((activeIndex + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeIndex, showSlide]);

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
                    Math.min(slides.length - 1, Math.round(carousel.scrollLeft / step)),
                  ),
                );
              }
            }}
            className="relative flex min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-red-500 [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((slide, index) => (
              <div
                key={slide[0].src}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
                className="grid w-full shrink-0 snap-center grid-cols-2 items-start gap-3 sm:gap-6"
              >
                {slide.map((image) => (
                  <Image
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    width={750}
                    height={1648}
                    unoptimized
                    draggable={false}
                    className="mx-auto block h-auto w-full max-w-[320px] rounded-lg border border-white/15"
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center" role="group" aria-label="Choose a slide">
            {slides.map((slide, index) => (
              <button
                key={slide[0].src}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-controls="intelligence-showcase"
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => showSlide(index)}
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
        </div>
      </div>
    </section>
  );
};

export default AiFeatures;

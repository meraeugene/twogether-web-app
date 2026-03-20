"use client";

import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type PixelPoint = {
  x: number;
  y: number;
  r: number;
  color: string;
};

type RawPixel = {
  x: number;
  y: number;
  color: [number, number, number, number];
};

export type SearchSuggestion = {
  id: number;
  label: string;
  subtitle?: string;
  image_url?: string | null;
  category?: "movie" | "tv" | "person" | string;
};

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  onSelectSuggestion,
  autocompleteEndpoint = "/api/tmdb/search/suggestions",
  enableAutocomplete = true,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>, value?: string) => void;
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  autocompleteEndpoint?: string;
  enableAutocomplete?: boolean;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<PixelPoint[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange, startAnimation]);

  useEffect(() => {
    if (!enableAutocomplete) return;

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const res = await fetch(
          `${autocompleteEndpoint}?query=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as { results?: SearchSuggestion[] };
        setSuggestions(data.results || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggestionsLoading(false);
        setActiveIndex(-1);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [autocompleteEndpoint, enableAutocomplete, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const draw = useCallback(
    (text = value) => {
      if (!inputRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 800;
      ctx.clearRect(0, 0, 800, 800);
      const computedStyles = getComputedStyle(inputRef.current);

      const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
      ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
      ctx.fillStyle = "#FFF";
      ctx.fillText(text, 16, 40);

      const imageData = ctx.getImageData(0, 0, 800, 800);
      const pixelData = imageData.data;
      const newData: RawPixel[] = [];

      for (let t = 0; t < 800; t++) {
        const i = 4 * t * 800;
        for (let n = 0; n < 800; n++) {
          const e = i + 4 * n;
          if (
            pixelData[e] !== 0 &&
            pixelData[e + 1] !== 0 &&
            pixelData[e + 2] !== 0
          ) {
            newData.push({
              x: n,
              y: t,
              color: [
                pixelData[e],
                pixelData[e + 1],
                pixelData[e + 2],
                pixelData[e + 3],
              ],
            });
          }
        }
      }

      newDataRef.current = newData.map(({ x, y, color }) => ({
        x,
        y,
        r: 1,
        color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
      }));
    },
    [value],
  );

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((point) => {
            const { x, y, r, color } = point;
            if (x > pos) {
              ctx.beginPath();
              ctx.rect(x, y, r, r);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const emitChange = (nextValue: string) => {
    const syntheticEvent = {
      target: { value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const submitValue = (nextValue: string) => {
    const trimmed = nextValue.trim();
    if (!trimmed) return;
    onSubmit(undefined, trimmed);
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    const selectedLabel = suggestion.label;
    setValue(selectedLabel);
    emitChange(selectedLabel);
    setShowSuggestions(false);

    vanishAndSubmit(selectedLabel);

    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
      return;
    }

    submitValue(selectedLabel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const canNavigate =
      showSuggestions && (suggestions.length > 0 || isSuggestionsLoading);

    if (canNavigate && e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
      return;
    }

    if (canNavigate && e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
      return;
    }

    if (e.key === "Enter" && !animating) {
      e.preventDefault();

      if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex]);
        return;
      }

      vanishAndSubmit(value);
      submitValue(value);
    }
  };

  const vanishAndSubmit = (text?: string) => {
    setAnimating(true);
    draw(text ?? value);

    const currentValue = text ?? (inputRef.current?.value || "");
    if (currentValue && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0,
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit(value);
    submitValue(value);
  };

  const showAutocompletePanel =
    enableAutocomplete && showSuggestions && value.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative w-full max-w-xl mx-auto">
      <form
        className={cn(
          "w-full relative bg-zinc-800 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
          value && "bg-zinc-700",
        )}
        onSubmit={handleSubmit}
      >
        <canvas
          className={cn(
            "absolute pointer-events-none  text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert-0 pr-20",
            !animating ? "opacity-0" : "opacity-100",
          )}
          ref={canvasRef}
        />
        <input
          onChange={(e) => {
            if (!animating) {
              const nextValue = e.target.value;
              setValue(nextValue);
              onChange(e);
              setShowSuggestions(true);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          value={value}
          type="text"
          className={cn(
            "w-full relative text-sm sm:text-base z-50 border-none text-white bg-transparent  h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
            animating && "text-transparent ",
          )}
        />

        <button
          disabled={!value}
          type="submit"
          className="absolute   cursor-pointer  right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full  bg-zinc-900 disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300 h-4 w-4"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <motion.path
              d="M5 12l14 0"
              initial={{
                strokeDasharray: "50%",
                strokeDashoffset: "50%",
              }}
              animate={{
                strokeDashoffset: value ? 0 : "50%",
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
            />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
          </motion.svg>
        </button>

        <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
          <AnimatePresence mode="wait">
            {!value && (
              <motion.p
                initial={{
                  y: 5,
                  opacity: 0,
                }}
                key={`current-placeholder-${currentPlaceholder}`}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: -15,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "linear",
                }}
                className="text-zinc-500 text-sm sm:text-base font-normal  pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
              >
                {placeholders[currentPlaceholder]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>

      {showAutocompletePanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-[120] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]/fb backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
          {isSuggestionsLoading ? (
            <div className="p-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
                    <div className="h-2 w-1/5 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-white/40">
                No matches found
              </p>
            </div>
          ) : (
            <div className="max-h-[440px] overflow-y-auto scrollbar-hide py-2">
              {/* Optional: Add a "Quick Results" header */}
              <div className="px-4 py-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                  Top Results
                </span>
              </div>

              <ul className="px-2">
                {suggestions.map((suggestion, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={`${suggestion.category}-${suggestion.id}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={cn(
                          "group cursor-pointer relative flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                          isActive
                            ? "bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                            : "hover:bg-white/5",
                        )}
                      >
                        {/* Left Accent for Active Item */}
                        {isActive && (
                          <div className="absolute left-0 h-6 w-1 rounded-r-full bg-red-500" />
                        )}

                        {/* Image/Icon Logic */}
                        <div className="relative shrink-0">
                          {suggestion.image_url ? (
                            <Image
                              src={suggestion.image_url}
                              alt=""
                              width={40}
                              height={40}
                              className={cn(
                                "h-10 w-10 object-cover ring-1 ring-white/10 transition-all duration-300",
                                suggestion.category === "person"
                                  ? "rounded-full"
                                  : "rounded-md",
                                isActive
                                  ? "scale-110 ring-white/30"
                                  : "grayscale-[0.4]",
                              )}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-white/40 ring-1 ring-white/10">
                              {suggestion.category?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                "truncate text-sm font-medium transition-colors",
                                isActive ? "text-white" : "text-white/80",
                              )}
                            >
                              {suggestion.label}
                            </p>
                            {isActive && (
                              <span className="text-[10px] font-mono text-white/20">
                                ENTER
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500/80">
                              {suggestion.category}
                            </span>
                            {suggestion.subtitle && (
                              <>
                                <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                                <p className="truncate text-xs text-white/40">
                                  {suggestion.subtitle}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

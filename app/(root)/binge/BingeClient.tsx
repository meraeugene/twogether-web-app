"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowRight, Play, Search, X } from "lucide-react";
import { BINGE_GENRES } from "@/constants/genre";
import CollectionPage from "./CollectionPage";

export default function BingeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get("genre") || "Action";
  const initialSearchQuery = searchParams.get("query") || "";
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeSearchQuery, setActiveSearchQuery] = useState(
    initialSearchQuery.trim(),
  );
  const [heroBackdrops, setHeroBackdrops] = useState<string[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroLoading, setHeroLoading] = useState(true);
  const heroBackdrop = heroBackdrops[heroIndex] || null;

  const handleHeroBackdropsChange = useCallback((backdrops: string[]) => {
    setHeroBackdrops((current) =>
      current.length === backdrops.length &&
      current.every((backdrop, index) => backdrop === backdrops[index])
        ? current
        : backdrops,
    );
  }, []);

  useEffect(() => {
    setHeroIndex(0);
    setHeroLoading(true);
  }, [heroBackdrops]);

  useEffect(() => {
    if (heroBackdrops.length < 2) return;

    const timer = window.setTimeout(() => {
      const nextIndex = (heroIndex + 1) % heroBackdrops.length;
      const nextBackdrop = heroBackdrops[nextIndex];
      setHeroLoading(true);

      const preloader = new window.Image();
      const showNextBackdrop = () => setHeroIndex(nextIndex);
      preloader.onload = showNextBackdrop;
      preloader.onerror = showNextBackdrop;
      preloader.src = nextBackdrop;
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [heroBackdrops, heroIndex]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery("");
    setActiveSearchQuery("");
    setHeroBackdrops([]);
    setHeroLoading(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("genre", genre);
    newParams.delete("query");
    router.replace(`?${newParams.toString()}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setActiveSearchQuery(trimmed);
      setHeroBackdrops([]);
      setHeroLoading(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("genre", selectedGenre);
      newParams.set("query", trimmed);
      router.replace(`?${newParams.toString()}`, { scroll: false });
      requestAnimationFrame(scrollToCollections);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setHeroBackdrops([]);
    setHeroLoading(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("query");
    newParams.set("genre", selectedGenre);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const scrollToCollections = () => {
    document
      .getElementById("binge-collections")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-(family-name:--font-geist-sans)">
      <section className="relative isolate min-h-[650px] overflow-hidden px-5 pb-12 pt-32 sm:px-8 lg:px-14 xl:px-20 2xl:px-24">
        {heroBackdrop ? (
          <Image
            key={heroBackdrop}
            src={heroBackdrop}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            onLoad={() => setHeroLoading(false)}
            onError={() => setHeroLoading(false)}
            className={`-z-30 object-cover object-center transition-opacity duration-700 lg:object-[70%_center] ${
              heroLoading ? "opacity-80" : "opacity-100"
            }`}
          />
        ) : (
          <div className="absolute inset-0 -z-30 animate-pulse bg-zinc-900" />
        )}
        <div className="absolute inset-0 -z-20 bg-black/45 lg:hidden" />
        <div className="absolute inset-0 -z-20 hidden bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,.98)_28%,rgba(5,5,5,.72)_55%,rgba(5,5,5,.2)_82%)] lg:block" />
        <div className="absolute inset-0 -z-10 hidden bg-[linear-gradient(0deg,#050505_0%,transparent_36%,rgba(5,5,5,.2)_100%)] lg:block" />

        <div className="mx-auto flex min-h-[500px] max-w-[1500px] items-center">
          <div className="w-full max-w-[790px]">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-sm">
              Binge-worthy collection
            </p>
            <h1 className="max-w-[760px] text-[clamp(3rem,6.4vw,6.2rem)] font-black leading-[0.92] tracking-[-0.055em] text-white">
              Every story.
              <br />
              In the right order.
            </h1>
            <p className="mt-6 max-w-[660px] text-base leading-7 text-white/65 sm:text-lg lg:text-xl">
              Find a movie franchise or collection, see the correct watch order,
              and start a marathon with your people.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex max-w-[760px] items-center gap-2 rounded-2xl border border-white/20 bg-black/65 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl focus-within:border-white/40"
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-white/70 sm:h-6 sm:w-6" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search movie collections"
                placeholder="Search franchises, collections, or universes"
                className="h-12 min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-45 sm:px-6 sm:text-base"
              >
                <Play className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">Find a marathon</span>
                <span className="sm:hidden">Find</span>
              </button>
            </form>

            <div className="mt-7 flex flex-wrap gap-2 pb-2">
              {BINGE_GENRES.map((genre) => {
                const active = genre === selectedGenre;
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreChange(genre)}
                    aria-pressed={active}
                    className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition sm:px-5 ${
                      active
                        ? "border-red-400 bg-red-500 text-white shadow-lg shadow-red-950/50"
                        : "border-white/15 bg-black/45 text-white/75 backdrop-blur-md hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToCollections}
          className="absolute bottom-7 right-6 hidden cursor-pointer items-center gap-2 text-sm text-white/55 transition hover:text-white lg:flex xl:right-20"
        >
          View all <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section
        id="binge-collections"
        className="scroll-mt-24 px-5 pb-20 sm:px-8 lg:px-14 xl:px-20 2xl:px-24"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-6 flex items-end justify-between gap-4 pt-8 sm:pt-10">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-400">
                {activeSearchQuery
                  ? "Collection search"
                  : "Curated for your next movie night"}
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {activeSearchQuery
                  ? `Results for “${activeSearchQuery}”`
                  : `Popular ${selectedGenre} sagas`}
              </h2>
            </div>
            {activeSearchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear search</span>
              </button>
            )}
          </div>
          <CollectionPage
            genre={selectedGenre}
            searchQuery={activeSearchQuery}
            onHeroBackdropsChange={handleHeroBackdropsChange}
          />
        </div>
      </section>
    </main>
  );
}

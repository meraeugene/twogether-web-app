"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { BINGE_GENRES } from "@/constants/genre";
import CollectionPage from "./CollectionPage";

export default function BingeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get("genre") || "Action";
  const initialSearchQuery = searchParams.get("query") || "";
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeSearchQuery, setActiveSearchQuery] = useState(initialSearchQuery.trim());

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery("");
    setActiveSearchQuery("");
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("genre", genre);
    newParams.delete("query");
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setActiveSearchQuery(trimmed);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("genre", selectedGenre);
    newParams.set("query", trimmed);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("query");
    newParams.set("genre", selectedGenre);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <main className="page-gutter page-listing min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-8 font-(family-name:--font-geist-sans)">
      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Binge collections</h1>
        <form onSubmit={handleSubmit} role="search" aria-label="Search collections"
          className="flex w-full items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] p-1.5 focus-within:border-white/35 lg:max-w-xl">
          <Search className="ml-2 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search movie collections" placeholder="Search franchises or collections"
            className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/35" />
          <button type="submit" disabled={!searchQuery.trim()}
            className="h-10 shrink-0 cursor-pointer rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-45">
            Search
          </button>
        </form>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Collection genres">
        {BINGE_GENRES.map((genre) => (
          <button key={genre} type="button" onClick={() => handleGenreChange(genre)} aria-pressed={genre === selectedGenre}
            className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${genre === selectedGenre
              ? "border-red-400/30 bg-red-500/15 text-red-300"
              : "border-white/10 bg-transparent text-white/60 hover:border-white/25 hover:text-white"}`}>
            {genre}
          </button>
        ))}
      </div>

      <section id="binge-collections" aria-labelledby="binge-results-heading" className="mt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="binge-results-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {activeSearchQuery ? `Results for "${activeSearchQuery}"` : `Popular ${selectedGenre} sagas`}
          </h2>
          {activeSearchQuery && (
            <button type="button" onClick={clearSearch} aria-label="Clear collection search"
              className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 text-sm text-white/65 transition hover:border-white/30 hover:text-white">
              <X className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Clear search</span>
            </button>
          )}
        </div>
        <CollectionPage genre={selectedGenre} searchQuery={activeSearchQuery} />
      </section>
    </main>
  );
}

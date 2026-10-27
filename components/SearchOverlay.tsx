"use client";

/* eslint-disable @next/next/no-img-element -- Suggestions use small images directly from the TMDB CDN. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiFilm, FiSearch, FiUser } from "react-icons/fi";
import { Clock3, X } from "lucide-react";
import SearchDiscovery from "./SearchDiscovery";
import { readRecentSearches, saveRecentSearch, clearRecentSearches, type RecentSearch } from "@/utils/recentSearches";
import type { SearchKind, SearchSuggestion } from "@/types/search";
import { cachedSuggestions, loadSearchSuggestions, searchCacheKey, suggestionHref } from "@/utils/searchAutocomplete";
import styles from "./SearchOverlay.module.css";

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [kind, setKind] = useState<SearchKind>("all");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [response, setResponse] = useState<{ key: string; items: SearchSuggestion[]; failed?: boolean } | null>(null);
  const trimmed = query.trim();
  const key = searchCacheKey(trimmed, kind);
  const matchingResponse = response?.key === key ? response : null;
  const cached = trimmed.length >= 2 ? cachedSuggestions(trimmed, kind) : undefined;
  const suggestions = matchingResponse?.items ?? cached ?? [];
  const loading = trimmed.length >= 2 && !matchingResponse && !cached;
  const failed = matchingResponse?.failed;

  useEffect(() => {
    setRecentSearches(readRecentSearches());
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (trimmed.length < 2 || cachedSuggestions(trimmed, kind)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const items = await loadSearchSuggestions(trimmed, kind, controller.signal);
        if (!controller.signal.aborted) setResponse({ key, items });
      } catch {
        if (!controller.signal.aborted) setResponse({ key, items: [], failed: true });
      }
    }, 100);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [trimmed, kind, key]);

  useEffect(() => {
    if (activeIndex >= 0) document.getElementById(`header-search-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const searchAll = () => {
    if (!trimmed) return;
    saveRecentSearch(trimmed, kind);
    onClose();
    router.push(`/search/${encodeURIComponent(trimmed)}${kind === "all" ? "" : `?kind=${kind}`}`);
  };
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    saveRecentSearch(suggestion.label, suggestion.category === "person" ? "artists" : "titles");
    onClose();
    router.push(suggestionHref(suggestion));
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-label="Search movies, shows, and artists"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className={styles.panel}>
        <div className={styles.topbar}>
          <span className={styles.brand}><span>t<span>.</span></span>Discover</span>
          <button type="button" onClick={onClose} className={styles.close} aria-label="Close search"><X aria-hidden="true" /><span>Close</span><kbd>Esc</kbd></button>
        </div>
        <div className={styles.heading}>
          <p>YOUR NEXT GREAT WATCH</p>
          <h2>Find something worth watching.</h2>
        </div>
        <form className={styles.form} role="search" onSubmit={(event) => {
          event.preventDefault();
          if (activeIndex >= 0 && suggestions[activeIndex]) selectSuggestion(suggestions[activeIndex]);
          else searchAll();
        }}>
          <FiSearch aria-hidden="true" />
          <input ref={inputRef} type="text" role="combobox" aria-label={kind === "artists" ? "Search actors, directors, and artists" : "Search movies, shows, and artists"}
            aria-autocomplete="list" aria-expanded={suggestions.length > 0} aria-controls={suggestions.length ? "header-search-results" : undefined}
            aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex] ? `header-search-option-${activeIndex}` : undefined}
            autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={200}
            placeholder={kind === "artists" ? "Search artists…" : kind === "titles" ? "Search movies and shows…" : "Search anything…"} value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); }}
            onKeyDown={(event) => {
              if (!suggestions.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
              event.preventDefault();
              setActiveIndex((index) => event.key === "ArrowDown" ? (index + 1) % suggestions.length
                : index <= 0 ? suggestions.length - 1 : index - 1);
            }} />
          <button type="submit" className={styles.submit} disabled={!trimmed} aria-label="Search all results"><FiArrowRight aria-hidden="true" /></button>
        </form>
        <div className={styles.filters} role="group" aria-label="Search category">
          {([{ id: "all", label: "All" }, { id: "titles", label: "Movies & TV" }, { id: "artists", label: "Artists" }] as const).map((filter) => (
            <button key={filter.id} type="button" aria-pressed={kind === filter.id} onClick={() => {
              setKind(filter.id); setActiveIndex(-1); inputRef.current?.focus();
            }}>{filter.label}</button>
          ))}
        </div>
        <div className={styles.results} aria-busy={loading}>
          {trimmed.length < 2 && <>
            {recentSearches.length > 0 && <section className={styles.recent}>
              <div className={styles.sectionHeading}><h3>Pick up your search</h3><button type="button" onClick={() => { clearRecentSearches(); setRecentSearches([]); }}>Clear recent</button></div>
              <div className={styles.chips}>{recentSearches.map(item => <button key={`${item.kind}-${item.query}`} type="button" onClick={() => { setQuery(item.query); setKind(item.kind); setActiveIndex(-1); inputRef.current?.focus(); }}><Clock3 aria-hidden="true" />{item.query}</button>)}</div>
            </section>}
            <SearchDiscovery kind={kind}
              onQuery={(value, selectedKind) => { setQuery(value); setKind(selectedKind); setActiveIndex(-1); inputRef.current?.focus(); }}
              onNavigate={onClose} onTitle={(title) => { saveRecentSearch(title, "titles"); onClose(); }} />
          </>}
          {loading && <>
            <span className="sr-only" role="status">Searching</span>
            <div className={styles.skeletonList} aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeletonRow}>
                <span className={`${styles.skeletonImage} skeleton-shimmer ${kind === "artists" ? styles.skeletonArtist : ""}`} />
                <span className={styles.skeletonCopy}><span className="skeleton-shimmer" /><span className="skeleton-shimmer" /></span>
              </div>)}
            </div>
          </>}
          {suggestions.length ? (
              <ul id="header-search-results" role="listbox" aria-label="Search suggestions">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.category}-${suggestion.id}`} role="presentation">
                    <button id={`header-search-option-${index}`} type="button" role="option" aria-selected={activeIndex === index}
                      tabIndex={-1} className={styles.result} onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)} onClick={() => selectSuggestion(suggestion)}>
                      {suggestion.image_url ? <img className={suggestion.category === "person" ? styles.artistImage : undefined} src={suggestion.image_url} alt="" width={44} height={60} decoding="async" />
                        : <span className={`${styles.imageFallback} ${suggestion.category === "person" ? styles.artistImage : ""}`}>{suggestion.category === "person" ? <FiUser /> : <FiFilm />}</span>}
                      <span className={styles.resultCopy}><strong>{suggestion.label}</strong><span>{suggestion.category === "movie" ? "Movie" : suggestion.category === "tv" ? "TV show" : "Artist"}{suggestion.subtitle ? ` · ${suggestion.subtitle}` : ""}</span></span>
                      <FiArrowRight className={styles.resultArrow} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : !loading && trimmed.length >= 2 ? <p className={styles.message} role="status">{failed ? "Suggestions are unavailable. Press Enter to search." : kind === "artists" ? "No artists found. Try another name." : "No matches yet. Try another search."}</p> : null}
        </div>
        {trimmed && <div className={styles.footer}>
          <span className="hidden md:inline">Arrow keys to choose · Enter to open</span>
          {trimmed && <button type="button" onClick={searchAll}>{kind === "artists" ? "See all artists" : "See all results"} <FiArrowRight aria-hidden="true" /></button>}
        </div>}
      </div>
    </dialog>
  );
}

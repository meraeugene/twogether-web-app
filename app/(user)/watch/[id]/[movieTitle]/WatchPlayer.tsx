"use client";

import { TbPlayerPlayFilled } from "react-icons/tb";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { saveRecentWatch } from "@/utils/recentWatch";

type ResumeTracking = {
  tmdbId: number;
  title: string;
  href: string;
  posterUrl?: string;
  synopsis?: string;
  type: "movie" | "tv";
  year?: string;
};

export default function WatchPlayer({
  urls,
  type,
  episodeTitlesPerSeason,
  showServerSelector = true,
  isEpisodeMetadataLoading = false,
  resumeTracking,
}: {
  urls: string[];
  type?: string;
  episodeTitlesPerSeason?: Record<number, string[]>;
  showServerSelector?: boolean;
  isEpisodeMetadataLoading?: boolean;
  resumeTracking?: ResumeTracking;
}) {
  const searchParams = useSearchParams();
  const requestedServerIndex = Number(searchParams.get("server") ?? "0");
  const requestedSeason = Number(searchParams.get("season") ?? "1");
  const requestedEpisode = Number(searchParams.get("episode") ?? "1");

  const [currentUrlIndex, setCurrentUrlIndex] = useState(
    Number.isFinite(requestedServerIndex) && requestedServerIndex >= 0
      ? requestedServerIndex
      : 0,
  );
  const [selectedSeason, setSelectedSeason] = useState(
    Number.isFinite(requestedSeason) && requestedSeason > 0
      ? requestedSeason
      : 1,
  );
  const [selectedEpisode, setSelectedEpisode] = useState(
    Number.isFinite(requestedEpisode) && requestedEpisode > 0
      ? requestedEpisode
      : 1,
  );
  const safeUrls = urls.filter(Boolean);
  const hasPlayableUrl = safeUrls.length > 0;
  const availableSeasons = useMemo(
    () =>
      Object.keys(episodeTitlesPerSeason ?? {})
        .map(Number)
        .filter((season) => Number.isFinite(season))
        .sort((a, b) => a - b),
    [episodeTitlesPerSeason],
  );
  const activeUrlIndex = Math.min(currentUrlIndex, Math.max(safeUrls.length - 1, 0));
  const currentUrl = safeUrls[activeUrlIndex] ?? null;

  useEffect(() => {
    if (!availableSeasons.length) return;

    if (!availableSeasons.includes(selectedSeason)) {
      setSelectedSeason(availableSeasons[0]);
      setSelectedEpisode(1);
    }
  }, [availableSeasons, selectedSeason]);

  useEffect(() => {
    const episodeCount = episodeTitlesPerSeason?.[selectedSeason]?.length ?? 0;
    if (episodeCount > 0 && selectedEpisode > episodeCount) {
      setSelectedEpisode(1);
    }
  }, [episodeTitlesPerSeason, selectedEpisode, selectedSeason]);

  useEffect(() => {
    if (!resumeTracking || !hasPlayableUrl) return;

    const params = new URLSearchParams();
    if (activeUrlIndex > 0) {
      params.set("server", String(activeUrlIndex));
    }

    if (resumeTracking.type === "tv") {
      params.set("season", String(selectedSeason));
      params.set("episode", String(selectedEpisode));
    }

    const href = params.toString()
      ? `${resumeTracking.href}?${params.toString()}`
      : resumeTracking.href;

    saveRecentWatch({
      tmdbId: resumeTracking.tmdbId,
      title: resumeTracking.title,
      href,
      posterUrl: resumeTracking.posterUrl,
      synopsis: resumeTracking.synopsis,
      type: resumeTracking.type,
      year: resumeTracking.year,
      season: resumeTracking.type === "tv" ? selectedSeason : undefined,
      episode: resumeTracking.type === "tv" ? selectedEpisode : undefined,
      serverIndex: activeUrlIndex,
      updatedAt: new Date().toISOString(),
    });
  }, [
    activeUrlIndex,
    hasPlayableUrl,
    resumeTracking,
    selectedEpisode,
    selectedSeason,
  ]);

  const streamSrc =
    !currentUrl
      ? null
      : type === "tv"
        ? currentUrl.replace(/\/tv\/\d+\/\d+\/\d+/, (match) => {
            const parts = match.split("/");
            return `/tv/${parts[2]}/${selectedSeason}/${selectedEpisode}`;
          })
        : currentUrl;
  const hasEpisodeTitles =
    availableSeasons.length > 0 &&
    Boolean(episodeTitlesPerSeason?.[selectedSeason]?.length);
  const episodeControlsMessage = isEpisodeMetadataLoading
    ? "Loading season and episode controls..."
    : "Season and episode controls are unavailable for this title.";
  const supportMessage = showServerSelector
    ? "Having issues? Try switching servers or episodes."
    : "Having issues? Try switching episodes.";

  if (!hasPlayableUrl || !streamSrc) {
    return (
      <div className="watch-player space-y-6 font-[family-name:var(--font-geist-mono)]">
        <div className="watch-screen mobile-bleed flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-center text-sm text-white/60">
          This stream is unavailable right now. Please try another title later.
        </div>
      </div>
    );
  }

  return (
    <div className="watch-player space-y-4 md:space-y-8 font-[family-name:var(--font-geist-sans)]">
      {/* Video Player */}
      <div className="watch-screen mobile-bleed aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
        <iframe
          key={streamSrc}
          src={streamSrc}
          title="Movie and TV player"
          className="h-full w-full overflow-hidden"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Server Selector */}
      {showServerSelector && safeUrls.length > 1 ? (
        <div className="watch-servers grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Streaming servers">
          {safeUrls.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={activeUrlIndex === index}
              onClick={() => setCurrentUrlIndex(index)}
              className={`glass-control flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition sm:w-auto
              ${
                activeUrlIndex === index
                  ? "bg-red-600 text-white font-semibold"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              <TbPlayerPlayFilled className="text-lg" />
              Server {index + 1}
            </button>
          ))}
        </div>
      ) : null}

      {/* TV Controls */}
      {type === "tv" && (
        <div className="space-y-6 border-t border-white/10 pt-6 font-[family-name:var(--font-geist-sans)]">
          {hasEpisodeTitles ? (
            <>
              {/* Season Selector */}
              <div className="watch-seasons grid grid-cols-3 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Seasons">
                {availableSeasons.map((season) => {
                  const isActive = selectedSeason === season;
                  return (
                    <button
                      key={season}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setSelectedSeason(season);
                        setSelectedEpisode(1);
                      }}
                      className={`glass-control w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition sm:w-auto sm:px-4
                        ${
                          isActive
                            ? "bg-red-600 text-white font-semibold"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                    >
                      Season {season}
                    </button>
                  );
                })}
              </div>

              {/* Episode Selector */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {episodeTitlesPerSeason?.[selectedSeason]?.map((title, i) => {
                  const ep = i + 1;
                  const isActive = selectedEpisode === ep;
                  return (
                    <button
                      key={ep}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={`Episode ${ep}: ${title}`}
                      title={`Episode ${ep}: ${title}`}
                      onClick={() => setSelectedEpisode(ep)}
                      className={`glass-control flex h-20 min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-4 text-left text-sm leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                        ${
                          isActive
                            ? "bg-red-600 text-white font-semibold"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                    >
                      <TbPlayerPlayFilled aria-hidden="true" className="shrink-0 text-base" />
                      <span className="shrink-0 whitespace-nowrap">
                        Ep {ep}
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 break-words">
                        {title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-white/55">{episodeControlsMessage}</p>
          )}
        </div>
      )}

      {/* Info Note */}
      <p className="mt-4 text-left text-xs text-white/40 sm:text-sm">
        {supportMessage}
      </p>
    </div>
  );
}

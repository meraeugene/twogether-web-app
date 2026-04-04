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
  prioritizeMobileSize = false,
}: {
  urls: string[];
  type?: string;
  episodeTitlesPerSeason?: Record<number, string[]>;
  showServerSelector?: boolean;
  isEpisodeMetadataLoading?: boolean;
  resumeTracking?: ResumeTracking;
  prioritizeMobileSize?: boolean;
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
  const playerShellClassName = prioritizeMobileSize
    ? "aspect-[5/4] min-h-[18rem] rounded-2xl bg-white/[0.03] p-2 sm:aspect-video sm:min-h-0 sm:bg-transparent sm:p-0"
    : "aspect-video rounded-2xl";

  if (!hasPlayableUrl || !streamSrc) {
    return (
      <div className="space-y-6 font-[family-name:var(--font-geist-mono)]">
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-center text-sm text-white/60">
          This stream is unavailable right now. Please try another title later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[family-name:var(--font-geist-mono)]">
      {/* Video Player */}
      <div
        className={`${playerShellClassName} overflow-hidden border border-white/10 shadow-xl`}
      >
        <iframe
          key={streamSrc}
          src={streamSrc}
          className="h-full w-full"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Server Selector */}
      {showServerSelector && safeUrls.length > 1 ? (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {safeUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentUrlIndex(index)}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition sm:w-auto
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
        <div className="space-y-6 border-t border-white/10 pt-6">
          {hasEpisodeTitles ? (
            <>
              {/* Season Selector */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                {availableSeasons.map((season) => {
                  const isActive = selectedSeason === season;
                  return (
                    <button
                      key={season}
                      onClick={() => {
                        setSelectedSeason(season);
                        setSelectedEpisode(1);
                      }}
                      className={`w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition sm:w-auto sm:px-4
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
                      onClick={() => setSelectedEpisode(ep)}
                      className={`flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-xs transition sm:text-sm
                        ${
                          isActive
                            ? "bg-red-600 text-white font-semibold"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                    >
                      <TbPlayerPlayFilled className="shrink-0 text-base" />
                      <span className="shrink-0 whitespace-nowrap">
                        Ep {ep}
                      </span>
                      <span className="min-w-0 flex-1 text-left md:whitespace-normal">
                        - {title}
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

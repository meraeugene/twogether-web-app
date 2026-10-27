"use client";

/* eslint-disable @next/next/no-img-element -- Full-bleed TMDB artwork uses the source CDN. */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import FilmCard from "@/components/FilmCard";
import { FiInfo, FiPlay, FiVolume2, FiVolumeX } from "react-icons/fi";
import type { TMDBFeaturedResult } from "@/types/tmdb";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { loadYouTubeIframeApi, type YouTubePlayer } from "@/utils/youtubeIframeApi";
import { shuffleMovies } from "@/utils/shuffleMovies";
import { TRAILER_PREVIEW_OPEN_EVENT } from "@/constants/trailerPreview";
import styles from "./browse.module.css";
import { BrowseHeroSkeleton } from "@/components/DiscoverySkeletons";

const NO_MOVIES: TMDBFeaturedResult[] = [];

export default function BrowseHero({ movies = NO_MOVIES, isLoading = false }: { movies?: TMDBFeaturedResult[]; isLoading?: boolean }) {
  const [playlist, setPlaylist] = useState<{ movies: TMDBFeaturedResult[]; index: number }>({ movies: [], index: 0 });
  const mutedPreference = useRef(false);
  const handleMutedChange = useCallback((muted: boolean) => { mutedPreference.current = muted; }, []);

  useEffect(() => {
    const playable = movies.filter((movie) => movie.trailer_key && movie.backdrop_url);
    setPlaylist((current) => {
      // Revalidating the shelf must not interrupt a trailer that is still available.
      if (current.movies.length === playable.length && current.movies.every((movie) => playable.some((item) => item.id === movie.id))) return current;
      return { movies: shuffleMovies(playable), index: 0 };
    });
  }, [movies]);

  const nextMovie = useCallback(() => {
    setPlaylist((current) => {
      if (current.movies.length < 2) return current;
      if (current.index + 1 < current.movies.length) return { ...current, index: current.index + 1 };
      return { movies: shuffleMovies(current.movies, current.movies[current.index]?.id), index: 0 };
    });
  }, []);
  const movie = playlist.movies[playlist.index];
  if (isLoading) return <BrowseHeroSkeleton />;
  return <BrowseHeroContent key={movie ? `${movie.id}-${movie.trailer_key}` : "no-trailer"} movie={movie}
    onNext={nextMovie} canAutoAdvance={playlist.movies.length > 1} initialMuted={mutedPreference.current}
    onMutedChange={handleMutedChange} />;
}

function BrowseHeroContent({ movie, onNext, canAutoAdvance, initialMuted, onMutedChange }: {
  movie?: TMDBFeaturedResult;
  onNext: () => void;
  canAutoAdvance: boolean;
  initialMuted: boolean;
  onMutedChange: (muted: boolean) => void;
}) {
  const player = useRef<YouTubePlayer | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const videoContainer = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const startingMuted = useRef(initialMuted);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const trailerKey = movie?.trailer_key;
  const title = movie?.title;

  const runPlayer = (command: (current: YouTubePlayer) => void) => {
    if (!player.current) return;
    try {
      command(player.current);
    } catch {
      const current = player.current;
      player.current = null;
      try { current?.destroy(); } catch { /* The iframe may already be gone. */ }
      setFailed(true);
      setPlaying(false);
    }
  };

  useEffect(() => {
    const host = videoContainer.current;
    if (!host || !trailerKey) return;
    let cancelled = false;
    let unavailable = false;
    let advancing = false;
    let triedMutedAutoplay = startingMuted.current;
    let currentPlayer: YouTubePlayer | undefined;
    const fail = () => {
      if (cancelled || unavailable) return;
      unavailable = true;
      window.clearTimeout(timeout);
      player.current = null;
      try { currentPlayer?.destroy(); } catch { /* The iframe may already be gone. */ }
      host.replaceChildren();
      setFailed(true);
      setPlaying(false);
    };
    // A blocked script or an iframe that never becomes ready must not break Browse.
    const timeout = window.setTimeout(fail, 20000);

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || unavailable) return;
      const mount = document.createElement("div");
      host.replaceChildren(mount);
      currentPlayer = new api.Player(mount, {
        videoId: trailerKey,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1, mute: startingMuted.current ? 1 : 0, controls: 0, playsinline: 1, rel: 0,
          loop: canAutoAdvance ? 0 : 1, playlist: trailerKey, disablekb: 1, origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            if (cancelled || unavailable) return;
            window.clearTimeout(timeout);
            player.current = target;
            try {
              target.getIframe().title = `${title ?? "Featured film"} official trailer`;
              if (startingMuted.current) target.mute();
              else target.unMute();
              target.playVideo();
              setReady(true);
            } catch {
              fail();
            }
          },
          onStateChange: ({ data }) => {
            if (cancelled || unavailable) return;
            setPlaying(data === 1);
            if (data === 1) {
              setHasPlayed(true);
              setBlocked(false);
            }
            if (data === 0 && canAutoAdvance && !advancing) {
              advancing = true;
              onNext();
            }
          },
          onAutoplayBlocked: () => {
            if (cancelled || unavailable) return;
            // Browsers often block autoplay with sound, including the next trailer.
            if (!triedMutedAutoplay && currentPlayer) {
              triedMutedAutoplay = true;
              try {
                currentPlayer.mute();
                setMuted(true);
                onMutedChange(true);
                currentPlayer.playVideo();
                return;
              } catch {
                fail();
                return;
              }
            }
            setBlocked(true);
            setPlaying(false);
          },
          onError: fail,
        },
      });
    }).catch(fail);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      player.current = null;
      // YouTube owns only the imperatively inserted child, never a React-owned node.
      try { currentPlayer?.destroy(); } catch { /* The iframe may already be gone. */ }
      host.replaceChildren();
    };
  }, [trailerKey, title, canAutoAdvance, onNext, onMutedChange]);

  useEffect(() => {
    if (!failed || !canAutoAdvance) return;
    // Skip unavailable trailers automatically as well as advancing after playback.
    const timeout = window.setTimeout(onNext, 1500);
    return () => window.clearTimeout(timeout);
  }, [failed, canAutoAdvance, onNext]);

  useEffect(() => {
    if (!ready || hasPlayed || failed) return;
    // Also covers older players that do not emit onAutoplayBlocked.
    const timeout = window.setTimeout(() => setBlocked(true), 7000);
    return () => window.clearTimeout(timeout);
  }, [ready, hasPlayed, failed]);

  useEffect(() => {
    if (!ready || !player.current) return;
    const currentPlayer = player.current;
    const pause = () => {
      try { currentPlayer.pauseVideo(); } catch { /* The player may be unloading. */ }
    };
    const onVisibilityChange = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener(TRAILER_PREVIEW_OPEN_EVENT, pause);
    // A card preview may open before the hero's iframe finishes initializing.
    if (document.querySelector("[data-trailer-preview]")) pause();
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) pause();
    }, { threshold: 0.1 });
    if (container.current) observer?.observe(container.current);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener(TRAILER_PREVIEW_OPEN_EVENT, pause);
      observer?.disconnect();
    };
  }, [ready]);

  const playTrailer = () => {
    runPlayer((current) => {
      if (muted) current.mute();
      else current.unMute();
      current.playVideo();
    });
  };
  const href = movie ? `/tmdb/watch/${movie.type}/${movie.id}/${getSlugFromTitle(movie.title)}` : "/browse/movies";

  return (
    <div ref={container} className={styles.heroMedia}>
      <div className={styles.heroVisual}>
        {movie?.backdrop_url && <img className={styles.backdrop} src={movie.backdrop_url} alt="" fetchPriority="high" />}
        {trailerKey && <div ref={videoContainer} className={`${styles.video} ${playing && !failed ? styles.videoPlaying : ""}`} />}
        <div className={styles.shade} />
      </div>
      {movie && (
        <div className={styles.feature}>
          <Link href={href} className={styles.featureTitle}>
            {movie.logo_url ? <img src={movie.logo_url} alt={movie.title} width={500} height={140} /> : <span>{movie.title}</span>}
          </Link>
          <p className={styles.featureMeta}><span>{movie.year}</span>{movie.genres.slice(0, 2).map((genre) => <span key={genre}>{genre === "Science Fiction" ? "Sci-Fi" : genre}</span>)}</p>
          {movie.synopsis?.trim() && <p className={styles.synopsis}>{movie.synopsis}</p>}
          <div className={styles.heroActions}>
            <Link className={styles.heroPlay} href={href} aria-label={`Play ${movie.title}`}>
              <FiPlay aria-hidden="true" />
              <span>Play</span>
            </Link>
            <FilmCard item={adaptTMDBToRecommendation(movie)} renderTrigger={(openPreview) => (
              <button className={styles.heroInfo} type="button" onClick={openPreview} aria-haspopup="dialog">
                <FiInfo aria-hidden="true" /><span>More Info</span>
              </button>
            )} />
          </div>
          <p className={styles.playbackHint} role="status">{failed ? canAutoAdvance ? "Loading the next trailer…" : "Trailer unavailable." : blocked ? (
            <button type="button" className="cursor-pointer underline underline-offset-4" onClick={playTrailer}>Start trailer</button>
          ) : ""}</p>
        </div>
      )}
      {movie && <button className={styles.soundControl} type="button" disabled={!ready || failed}
        aria-label={muted ? "Unmute trailer" : "Mute trailer"} aria-pressed={muted}
        title={muted ? "Unmute" : "Mute"} onClick={() => {
          runPlayer((current) => muted ? current.unMute() : current.mute());
          setMuted(!muted);
          onMutedChange(!muted);
        }}>{muted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}</button>}
    </div>
  );
}

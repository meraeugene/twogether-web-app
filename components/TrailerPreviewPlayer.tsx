"use client";

/* eslint-disable @next/next/no-img-element -- Preview artwork uses the source CDN. */

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Play, Volume2, VolumeX } from "lucide-react";
import { loadYouTubeIframeApi, type YouTubePlayer } from "@/utils/youtubeIframeApi";

type Playback = "loading" | "playing" | "paused" | "blocked" | "error";

export default function TrailerPreviewPlayer({ videoId, title, posterUrl }: {
  videoId: string;
  title: string;
  posterUrl?: string | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const [playback, setPlayback] = useState<Playback>("loading");
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    let unavailable = false;
    let currentPlayer: YouTubePlayer | undefined;
    const fail = () => {
      if (cancelled || unavailable) return;
      unavailable = true;
      window.clearTimeout(timeout);
      player.current = null;
      try { currentPlayer?.destroy(); } catch { /* The iframe may already be gone. */ }
      container.replaceChildren();
      setReady(false);
      setPlayback("error");
    };
    const timeout = window.setTimeout(fail, 30000);

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || unavailable) return;
      const mount = document.createElement("div");
      container.replaceChildren(mount);
      currentPlayer = new api.Player(mount, {
        videoId, width: "100%", height: "100%",
        playerVars: {
          // Detail fetching and iframe initialization can outlast the original tap.
          // Start muted so playback doesn't depend on that transient activation.
          autoplay: 1, mute: 1, controls: 0, playsinline: 1, rel: 0,
          loop: 1, playlist: videoId, origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            if (cancelled || unavailable) return;
            window.clearTimeout(timeout);
            player.current = target;
            try {
              target.getIframe().title = `${title} trailer`;
              target.mute();
              if (document.hidden) target.pauseVideo();
              else target.playVideo();
              setReady(true);
            } catch { fail(); }
          },
          onStateChange: ({ data }) => {
            if (cancelled || unavailable) return;
            if (data === 1) setPlayback("playing");
            else if (data === 2) setPlayback("paused");
            else if (data === 3) setPlayback("loading");
          },
          onAutoplayBlocked: () => {
            if (!cancelled && !unavailable) setPlayback("blocked");
          },
          onError: fail,
        },
      });
    }).catch(fail);

    const onVisibilityChange = () => {
      if (document.hidden) {
        try { player.current?.pauseVideo(); } catch { /* The player may be unloading. */ }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      player.current = null;
      // Let YouTube own its inserted child instead of replacing a React-owned node.
      try { currentPlayer?.destroy(); } catch { /* The iframe may already be gone. */ }
      container.replaceChildren();
    };
  }, [videoId, title]);

  useEffect(() => {
    if (!ready || playback !== "loading") return;
    // Older embeds may never emit onAutoplayBlocked. Keep a usable play control.
    const timeout = window.setTimeout(() => setPlayback("blocked"), 7000);
    return () => window.clearTimeout(timeout);
  }, [ready, playback]);

  const control = (command: (current: YouTubePlayer) => void) => {
    if (!player.current) return;
    try { command(player.current); }
    catch {
      try { player.current.destroy(); } catch { /* The iframe may already be gone. */ }
      player.current = null;
      setReady(false);
      setPlayback("error");
    }
  };

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {posterUrl && <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover brightness-50" />}
        <div ref={host} className="absolute inset-0 [&_iframe]:h-[120%] [&_iframe]:w-full [&_iframe]:-translate-y-[8%] [&_iframe]:scale-[1.1]" />
      </div>
      {playback !== "playing" && <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-6">
        {playback === "error" ? <p role="status" className="max-w-xs rounded-xl bg-black/80 px-5 py-4 text-center text-sm text-white/80">Trailer unavailable. You can still watch this title below.</p>
          : playback === "blocked" || playback === "paused" ? (
            <button type="button" className="pointer-events-auto flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/80 px-5 py-3 text-sm font-semibold text-white"
              onClick={() => control((current) => {
                if (muted) current.mute(); else current.unMute();
                current.playVideo();
                setPlayback("loading");
              })}>
              <Play size={18} aria-hidden="true" />Play trailer
            </button>
          ) : <span role="status" className="flex items-center rounded-full bg-black/70 p-3 text-white/80"><LoaderCircle className="animate-spin motion-reduce:animate-none" size={18} aria-hidden="true" /><span className="sr-only">Loading trailer</span></span>}
      </div>}
      {ready && <button type="button" aria-label={muted ? "Unmute trailer" : "Mute trailer"} aria-pressed={!muted}
        className="absolute left-4 top-4 z-40 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-medium text-white"
        onClick={() => control((current) => {
          if (muted) { current.unMute(); current.playVideo(); } else current.mute();
          setMuted(!muted);
        })}>
        {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        {muted ? "Unmute" : "Sound on"}
      </button>}
    </>
  );
}

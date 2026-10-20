export type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  unMute: () => void;
  mute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getIframe: () => HTMLIFrameElement;
  destroy: () => void;
};

type PlayerEvent = { target: YouTubePlayer };
export type YouTubeIframeApi = {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    width: string;
    height: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: PlayerEvent) => void;
      onStateChange: (event: PlayerEvent & { data: number }) => void;
      onAutoplayBlocked: () => void;
      onError: () => void;
    };
  }) => YouTubePlayer;
};

type YouTubeWindow = Window & {
  YT?: YouTubeIframeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let loadingApi: Promise<YouTubeIframeApi> | undefined;

export function loadYouTubeIframeApi(): Promise<YouTubeIframeApi> {
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (loadingApi) return loadingApi;

  loadingApi = new Promise<YouTubeIframeApi>((resolve, reject) => {
    const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const script = existingScript ?? document.createElement("script");
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener("error", onError);
      if (youtubeWindow.onYouTubeIframeAPIReady === onReady) {
        youtubeWindow.onYouTubeIframeAPIReady = previousReady;
      }
    };
    const onError = () => {
      cleanup();
      if (!existingScript) script.remove();
      reject(new Error("The trailer player could not load."));
    };
    const onReady = () => {
      cleanup();
      try {
        previousReady?.();
      } finally {
        if (youtubeWindow.YT?.Player) resolve(youtubeWindow.YT);
        else reject(new Error("The trailer player is unavailable."));
      }
    };
    const timeout = window.setTimeout(onError, 15000);
    youtubeWindow.onYouTubeIframeAPIReady = onReady;
    script.addEventListener("error", onError, { once: true });
    if (!existingScript) {
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    loadingApi = undefined;
    throw error;
  });
  return loadingApi;
}

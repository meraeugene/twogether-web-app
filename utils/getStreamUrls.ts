type StreamType = "movie" | "tv";

export function getStreamUrls(tmdbId: string | number, type: StreamType) {
  if (type === "tv") {
    return [
      `https://vidlink.pro/tv/${tmdbId}/1/1`,
      `https://111movies.net/tv/${tmdbId}/1/1`,
      `https://player.videasy.net/tv/${tmdbId}/1/1`,
      `https://player.vidzee.wtf/embed/tv/${tmdbId}/1/1`,
      `https://vidsrc-embed.ru/embed/tv/${tmdbId}/1/1`,
      `https://vidsrc.to/embed/tv/${tmdbId}/1/1`,
      `https://vidrock.ru/tv/${tmdbId}/1/1`,

      // not working temp
      `https://www.vidking.net/embed/tv/${tmdbId}/1/1`,
    ];
  }

  return [
    `https://vidlink.pro/movie/${tmdbId}`,
    `https://111movies.net/movie/${tmdbId}`,
    `https://player.videasy.net/movie/${tmdbId}`,
    `https://player.vidzee.wtf/embed/movie/${tmdbId}`,
    `https://vidsrc-embed.ru/embed/movie/${tmdbId}`,
    `https://vidsrc.to/embed/movie/${tmdbId}`,
    `https://vidrock.ru/movie/${tmdbId}`,

    // not working temp
    `https://www.vidking.net/embed/movie/${tmdbId}`,

  ];
}

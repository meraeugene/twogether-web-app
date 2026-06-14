type StreamType = "movie" | "tv";

export function getStreamUrls(tmdbId: string | number, type: StreamType) {
  if (type === "tv") {
    return [
     `https://streamimdb.ru/embed/tv/${tmdbId}/1/1`,
`https://player.videasy.net/tv/${tmdbId}/1/1`, 
      `https://vidlink.pro/tv/${tmdbId}/1/1`,
      `https://111movies.net/tv/${tmdbId}/1/1`,
 
`https://cinesrc.st/embed/tv/${tmdbId}/1/1`
    
      //`https://vidrock.ru/tv/${tmdbId}/1/1`,
    
      // too many ads
      // `https://player.vidzee.wtf/embed/tv/${tmdbId}/1/1`,

      // not working temp
      // `https://vidsrc-embed.ru/embed/tv/${tmdbId}/1/1`,
      // `https://vidsrc.to/embed/tv/${tmdbId}/1/1`,
      // `https://www.vidking.net/embed/tv/${tmdbId}/1/1`,
    ];
  }

  return [
`https://streamimdb.ru/embed/movie/${tmdbId}`,

`https://player.videasy.net/movie/${tmdbId}`,

    `https://vidlink.pro/movie/${tmdbId}`,
    `https://111movies.net/movie/${tmdbId}`,
    
`https://cinesrc.st/embed/movie/${tmdbId}`

    //`https://vidrock.ru/movie/${tmdbId}`,
    
    // too many ads
    // `https://player.vidzee.wtf/embed/movie/${tmdbId}`,

    // not working temp
    // `https://vidsrc.to/embed/movie/${tmdbId}`,
    // `https://vidsrc-embed.ru/embed/movie/${tmdbId}`,
    // `https://www.vidking.net/embed/movie/${tmdbId}`,

  ];
}

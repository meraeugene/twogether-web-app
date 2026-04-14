import type { Recommendation } from "@/types/recommendation";
import type { EpisodeTitle, TMDBSeasonResponse } from "@/types/tmdb";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

async function getEpisodeTitlesPerSeason(
  tmdbId: number,
  seasons: number[],
): Promise<Record<number, EpisodeTitle[]>> {
  const seasonEntries = await Promise.all(
    seasons.map(async (season) => {
      const seasonRes = await fetch(
        `${BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${API_KEY}`,
        { next: { revalidate: 86400 } },
      );

      if (!seasonRes.ok) return null;

      const seasonData: TMDBSeasonResponse = await seasonRes.json();
      return [
        season,
        seasonData.episodes.map((ep) => ({
          episode_number: ep.episode_number,
          title: ep.name,
        })),
      ] as const;
    }),
  );

  const validSeasons = seasonEntries.filter(
    (season): season is readonly [number, EpisodeTitle[]] => season !== null,
  );

  return Object.fromEntries(validSeasons);
}

export async function getTMDBWatchRecommendation(
  tmdbId: string | number,
  type: "movie" | "tv",
): Promise<Recommendation | null> {
  const apiUrl = `${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}&append_to_response=credits,videos`;
  const res = await fetch(apiUrl, { next: { revalidate: 86400 } });

  if (!res.ok) return null;

  const details = await res.json();

  const trailer =
    details.videos?.results?.find(
      (video: {
        key: string;
        site: string;
        type: string;
        official?: boolean;
      }) =>
        video.site === "YouTube" && video.type === "Trailer" && video.official,
    ) ||
    details.videos?.results?.find(
      (video: { key: string; site: string; type: string }) =>
        video.site === "YouTube" && video.type === "Trailer",
    ) ||
    details.videos?.results?.find(
      (video: { key: string; site: string; type: string }) =>
        video.site === "YouTube",
    );

  let episodeTitlesPerSeason: Record<number, EpisodeTitle[]> | undefined;
  if (type === "tv") {
    const seasonNumbers =
      details.seasons
        ?.map((season: { season_number: number }) => season.season_number)
        .filter((season: number) => season > 0) ?? [];

    episodeTitlesPerSeason = await getEpisodeTitlesPerSeason(
      details.id,
      seasonNumbers,
    );
  }

  return {
    id: String(details.id),
    recommendation_id: `tmdb-${type}-${details.id}`,
    tmdb_id: details.id,
    type,
    title: details.title || details.name,
    poster_url: details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : undefined,
    year:
      details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4),
    synopsis: details.overview ?? "",
    trailer_key: trailer?.key ?? null,
    stream_url:
      type === "tv"
        ? [
            `https://vidsrc-embed.ru/embed/tv/${details.id}/1/1`,
            `https://vidsrc.cc/v2/embed/tv/${details.id}/1/1?autoPlay=false&poster=true`,
            `https://vidsrc.to/embed/tv/${details.id}/1/1`,
          ]
        : [
            `https://vidsrc-embed.ru/embed/movie/${details.id}`,
            `https://vidsrc.cc/v2/embed/movie/${details.id}?autoPlay=false&poster=true`,
            `https://vidsrc.to/embed/movie/${details.id}`,
          ],
    genres:
      details.genres?.map((g: { id: number; name: string }) => g.name) || [],
    duration: details.runtime ?? details.episode_run_time?.[0] ?? undefined,
    seasons: type === "tv" ? details.number_of_seasons : undefined,
    episodes: type === "tv" ? details.number_of_episodes : undefined,
    episode_titles_per_season: episodeTitlesPerSeason,
    visibility: "public",
    comment: "",
    is_tmdb_recommendation: true,
    created_at: new Date().toISOString(),
    recommended_by: { id: "tmdb", username: "", avatar_url: "" },
  };
}

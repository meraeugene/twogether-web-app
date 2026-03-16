import {
  EnrichedCollection,
  EnrichedMovie,
  TMDBCollection,
  TMDBMovieDetails,
} from "@/types/binge";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function getBingeCollectionsByQuery(
  query: string,
): Promise<EnrichedCollection[]> {
  const collectionsMap: Record<number, EnrichedCollection> = {};

  // 🔍 Search directly for collections matching the query
  const collectionSearchUrl = `${BASE_URL}/search/collection?query=${encodeURIComponent(
    query,
  )}&api_key=${API_KEY}&language=en-US`;

  const collectionRes = await fetch(collectionSearchUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
  const collectionSearchData = await collectionRes.json();

  for (const col of collectionSearchData.results || []) {
    if (collectionsMap[col.id]) continue;

    const colRes = await fetch(
      `${BASE_URL}/collection/${col.id}?api_key=${API_KEY}`,
      {
        cache: "force-cache",
        next: { revalidate: 86400 },
      },
    );
    const colData: TMDBCollection = await colRes.json();

    const parts: EnrichedMovie[] = [];

    for (const part of colData.parts || []) {
      const partDetailsRes = await fetch(
        `${BASE_URL}/movie/${part.id}?api_key=${API_KEY}&append_to_response=videos`,
        {
          cache: "force-cache",
          next: { revalidate: 86400 },
        },
      );
      const partDetails: TMDBMovieDetails = await partDetailsRes.json();

      const trailer =
        partDetails.videos?.results?.find(
          (video: {
            key: string;
            site: string;
            type: string;
            official?: boolean;
          }) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official,
        ) ||
        partDetails.videos?.results?.find(
          (video: { key: string; site: string; type: string }) =>
            video.site === "YouTube" && video.type === "Trailer",
        ) ||
        partDetails.videos?.results?.find(
          (video: { key: string; site: string; type: string }) =>
            video.site === "YouTube",
        );

      if (!partDetails.runtime || partDetails.runtime === 0) continue;

      parts.push({
        id: part.id,
        tmdb_id: part.id,
        title: part.title,
        poster_url: part.poster_path
          ? `https://image.tmdb.org/t/p/w500${part.poster_path}`
          : null,
        year: part.release_date?.slice(0, 4),
        release_date: partDetails.release_date || "",
        type: "movie",
        genres: partDetails.genres?.map((g) => g.name) || [],
        duration: partDetails.runtime,
        synopsis: partDetails.overview || "",
        trailer_key: trailer?.key || null,
      });
    }

    if (parts.length > 0) {
      collectionsMap[col.id] = {
        collection_id: col.id,
        collection_name: col.name,
        movies: parts.sort((a, b) =>
          (a.year || "").localeCompare(b.year || ""),
        ),
      };
    }
  }

  return Object.values(collectionsMap);
}

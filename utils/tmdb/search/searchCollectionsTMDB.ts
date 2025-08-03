import {
  EnrichedCollection,
  EnrichedMovie,
  TMDBCollection,
  TMDBMovieDetails,
} from "@/types/binge";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function getBingeCollectionsByQuery(
  query: string
): Promise<EnrichedCollection[]> {
  const searchUrl = `${BASE_URL}/search/movie?query=${encodeURIComponent(
    query
  )}&api_key=${API_KEY}&include_adult=false&language=en-US&region=US`;

  const res = await fetch(searchUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  const data = await res.json();
  const collectionsMap: Record<number, EnrichedCollection> = {};

  await Promise.all(
    (data.results || []).map(async (movie: any) => {
      const detailsRes = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`,
        {
          cache: "force-cache",
          next: { revalidate: 86400 },
        }
      );
      const details: TMDBMovieDetails = await detailsRes.json();

      const collection = details.belongs_to_collection;
      if (
        !collection ||
        collectionsMap[collection.id] ||
        !collection.name.toLowerCase().includes(query.toLowerCase())
      ) {
        return;
      }

      const colRes = await fetch(
        `${BASE_URL}/collection/${collection.id}?api_key=${API_KEY}`,
        {
          cache: "force-cache",
          next: { revalidate: 86400 },
        }
      );
      const colData: TMDBCollection = await colRes.json();

      const parts: EnrichedMovie[] = [];

      for (const part of colData.parts || []) {
        const partDetailsRes = await fetch(
          `${BASE_URL}/movie/${part.id}?api_key=${API_KEY}`,
          {
            cache: "force-cache",
            next: { revalidate: 86400 },
          }
        );

        const partDetails: TMDBMovieDetails = await partDetailsRes.json();

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
          media_type: "movie",
          genres: partDetails.genres?.map((g) => g.name) || [],
          duration: partDetails.runtime,
          synopsis: partDetails.overview || "",
        });
      }

      if (parts.length > 0) {
        collectionsMap[collection.id] = {
          collection_id: collection.id,
          collection_name: collection.name,
          movies: parts.sort((a, b) =>
            (a.year || "").localeCompare(b.year || "")
          ),
        };
      }
    })
  );

  return Object.values(collectionsMap);
}

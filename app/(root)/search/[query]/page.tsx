import type { Metadata } from "next";
import SearchClient from "./SearchClient";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { searchTMDB } from "@/utils/tmdb/search/searchTMDB";
import { buildMetadata } from "@/app/seo";
import { searchArtistFilmographyTMDB } from "@/utils/tmdb/search/searchArtistFilmographyTMDB";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>;
}): Promise<Metadata> {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);

  return buildMetadata({
    title: `Search results for ${decodedQuery}`,
    description: `Browse movie and TV search results for ${decodedQuery} on Twogether.`,
    path: `/search/${encodeURIComponent(decodedQuery)}`,
  });
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);

  const [results, artistSearch] = await Promise.all([
    searchTMDB(decodedQuery),
    searchArtistFilmographyTMDB(decodedQuery),
  ]);

  const adaptedResults = results.map((item) => adaptTMDBToRecommendation(item));
  const normalize = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const normalizedQuery = normalize(decodedQuery);

  const hasExactMovieOrTvMatch = adaptedResults.some(
    (item) => normalize(item.title) === normalizedQuery,
  );
  const isStrongArtistMatch = artistSearch.artist
    ? (() => {
        const normalizedArtistName = normalize(artistSearch.artist.name);
        return (
          normalizedArtistName === normalizedQuery ||
          normalizedArtistName.includes(normalizedQuery) ||
          normalizedQuery.includes(normalizedArtistName)
        );
      })()
    : false;

  const shouldShowArtist =
    Boolean(artistSearch.artist) &&
    artistSearch.movies.length > 0 &&
    isStrongArtistMatch &&
    !hasExactMovieOrTvMatch;

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white relative font-(family-name:--font-geist-sans)">
      <SearchClient
        query={decodedQuery}
        results={adaptedResults}
        artist={shouldShowArtist ? artistSearch.artist : null}
        artistMovies={shouldShowArtist ? artistSearch.movies : []}
      />
    </main>
  );
}

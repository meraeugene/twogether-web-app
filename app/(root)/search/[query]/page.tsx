import type { Metadata } from "next";
import SearchClient from "./SearchClient";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { searchTMDB } from "@/utils/tmdb/search/searchTMDB";
import { buildMetadata } from "@/app/seo";

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

  const results: TMDBEnrichedResult[] = await searchTMDB(decodedQuery);

  const adaptedResults = results.map((item) => adaptTMDBToRecommendation(item));

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white relative font-(family-name:--font-geist-sans)">
      <SearchClient query={decodedQuery} results={adaptedResults} />
    </main>
  );
}

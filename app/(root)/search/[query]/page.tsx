import SearchClient from "./SearchClient";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { searchTMDB } from "@/utils/tmdb/search/searchTMDB";

export default async function SearchPage({
  params,
}: {
  params: { query: string };
}) {
  const decodedQuery = decodeURIComponent(params.query);

  const results: TMDBEnrichedResult[] = await searchTMDB(decodedQuery);

  const adaptedResults = results.map((item) => adaptTMDBToRecommendation(item));

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white relative font-[family-name:var(--font-geist-sans)]">
      <SearchClient query={decodedQuery} results={adaptedResults} />
    </main>
  );
}

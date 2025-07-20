import FilmCard from "@/components/FilmCard";
import { EnrichedCollection } from "@/types/binge";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { getBingeCollectionsByQuery } from "@/utils/tmdb/search/searchCollectionsTMDB";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BingeSearchPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const query = (await params).query;
  const decodedQuery = decodeURIComponent(query);
  const results: EnrichedCollection[] = await getBingeCollectionsByQuery(
    decodedQuery
  );

  const sortedResults = [...results].sort((a, b) => {
    const latestA = Math.max(
      ...a.movies.map((m) => new Date(m.release_date ?? "1970-01-01").getTime())
    );
    const latestB = Math.max(
      ...b.movies.map((m) => new Date(m.release_date ?? "1970-01-01").getTime())
    );
    return latestB - latestA;
  });

  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      <Link
        href="/binge"
        className="inline-flex lg:hidden items-center justify-center py-2 px-4 rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} />
      </Link>

      {sortedResults.length === 0 ? (
        <p className="text-white/60 text-sm md:text-base lg:text-lg text-center lg:text-left">
          No results found.
        </p>
      ) : (
        <div className="space-y-10">
          {sortedResults.map((collection) => (
            <section key={collection.collection_id}>
              <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-white">
                {collection.collection_name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-6">
                {collection.movies.map((movie) => {
                  const adapted = adaptTMDBToRecommendation(movie);
                  return <FilmCard key={adapted.id} item={adapted} />;
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

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
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white relative font-[family-name:var(--font-geist-sans)]">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      <Link
        href="/binge"
        className="inline-flex lg:hidden items-center justify-center py-2 px-4 rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} />
      </Link>

      {sortedResults.length === 0 ? (
        <div className="text-left text-sm md:text-base lg:text-lg text-white/70  space-y-2">
          <p>
            No results found for{" "}
            <span className="text-white font-semibold italic">
              "{decodedQuery}"
            </span>
            .
          </p>
          <p>This might be due to a typo or the collection may not exist.</p>
          <p>Try refining your search or using different keywords.</p>
        </div>
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

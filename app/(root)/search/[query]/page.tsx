import FilmCard from "@/components/FilmCard";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { adaptTMDBToRecommendation } from "@/utils/adaptTMDBToRecommendation";
import { searchTMDB } from "@/utils/tmdb/search/searchTMDB";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const query = (await params).query;
  const decodedQuery = decodeURIComponent(query);
  const results: TMDBEnrichedResult[] = await searchTMDB(decodedQuery);

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
        href="/browse"
        className="inline-flex lg:hidden items-center justify-center py-2 px-4 rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} />
      </Link>

      <h1 className="text-xl md:text-3xl lg:text-3xl font-bold mb-6">
        Search results for: <span className="text-red-500">{decodedQuery}</span>
      </h1>

      {results.length === 0 ? (
        <p className="text-white/60 text-sm md:text-base lg:text-lg text-center lg:text-left">
          No results found.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
          {results.map((item) => {
            const adapted = adaptTMDBToRecommendation(item);
            return <FilmCard key={adapted.id} item={adapted} />;
          })}
        </div>
      )}
    </main>
  );
}

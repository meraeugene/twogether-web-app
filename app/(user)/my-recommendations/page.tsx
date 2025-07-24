"use client";

import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import FilmCard from "@/components/FilmCard";
import ErrorMessage from "@/components/ErrorMessage";
import { Recommendation } from "@/types/recommendation";
import { CurrentUser } from "@/types/user";
import Link from "next/link";
import { Section } from "./Section";

type MyRecosResponse = {
  user: CurrentUser;
  public: Recommendation[];
  private: Recommendation[];
};

export default function MyRecommendationsPage() {
  const { data, error } = useSWR<MyRecosResponse>("/api/my-recos", fetcher);

  if (!data && !error)
    return (
      <main className="min-h-screen px-7  pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 bg-black text-white">
        <div className="mb-6">
          <div className="h-7 w-1/3 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-4 w-1/4 bg-white/5 rounded mb-7 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white/10 rounded-lg overflow-hidden aspect-[2/3]"
            >
              <div className="w-full h-full bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    );

  if (error || !data?.user) return <ErrorMessage />;

  const { user, public: publicRecs, private: privateRecs } = data;

  if (publicRecs.length === 0 && privateRecs.length === 0) {
    return (
      <main className="min-h-screen bg-black px-7  pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
        <h1 className="text-2xl font-bold mb-4">
          Your Movie/Show Recommendations are Empty
        </h1>
        <p className="text-gray-600  mb-6 font-[family-name:var(--font-geist-mono)]">
          You haven&apos;t recommended anything yet. Start{" "}
          <Link href="/browse" className="text-white underline">
            browsing
          </Link>{" "}
          to find something worth sharing!
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-black px-7 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
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

      <h1 className="text-2xl font-bold mb-2">Your Recommendations</h1>
      <p className="text-gray-600 mb-8 font-[family-name:var(--font-geist-mono)]">
        Here are the movies and shows you&apos;ve recommended.
      </p>

      {publicRecs.length > 0 && (
        <Section title="Public">
          {publicRecs.map((item) => (
            <FilmCard
              key={item.recommendation_id}
              item={item}
              userId={user.id}
              isDeleteRecommendation
            />
          ))}
        </Section>
      )}

      {privateRecs.length > 0 && (
        <Section title="Private">
          {privateRecs.map((item) => (
            <FilmCard
              key={item.recommendation_id}
              item={item}
              userId={user.id}
              isDeleteRecommendation
            />
          ))}
        </Section>
      )}
    </main>
  );
}

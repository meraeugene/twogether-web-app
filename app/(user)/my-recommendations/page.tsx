"use client";

import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import FilmCard from "@/components/FilmCard";
import ErrorMessage from "@/components/ErrorMessage";
import { Recommendation } from "@/types/recommendation";
import { CurrentUser } from "@/types/user";
import Link from "next/link";
import { Section } from "./Section";
import FilmGridSkeleton from "@/components/FilmGridSkeleton";

type MyRecosResponse = {
  user: CurrentUser;
  public: Recommendation[];
  private: Recommendation[];
};

export default function MyRecommendationsPage() {
  const { data, error, isLoading } = useSWR<MyRecosResponse>(
    "/api/my-recos",
    fetcher
  );

  if (isLoading)
    return (
      <main className="min-h-screen relative bg-black px-7 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />
        <div className="space-y-12">
          <FilmGridSkeleton
            titleWidth="w-56"
            count={6}
            showDescription
          />
          <FilmGridSkeleton titleWidth="w-32" count={6} />
          <FilmGridSkeleton titleWidth="w-32" count={6} />
        </div>
      </main>
    );

  if (error || !data?.user) return <ErrorMessage />;

  const { user, public: publicRecs, private: privateRecs } = data;
  const hasNoRecs = publicRecs.length === 0 && privateRecs.length === 0;

  if (hasNoRecs) {
    return (
      <main className="min-h-screen bg-black px-7  pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
        <h1 className="text-2xl font-bold mb-4">
          Your Movie/Show Recommendations are Empty
        </h1>
        <p className="text-gray-400 mb-6 font-[family-name:var(--font-geist-mono)]">
          You haven&apos;t recommended anything yet. Start{" "}
          <Link prefetch href="/browse" className="text-white underline">
            browsing
          </Link>{" "}
          to find something worth sharing!
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-black px-7 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

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

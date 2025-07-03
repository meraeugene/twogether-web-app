"use client";

import useSWR from "swr";
import Link from "next/link";
import FilmCard from "@/components/FilmCard";
import { getUserRecommendationsById } from "@/actions/recommendationActions";
import ErrorMessage from "@/components/ErrorMessage";
import MyRecommendationSkeleton from "./MyRecommendationSkeleton";

export default function MyRecommendationsClient({
  userId,
}: {
  userId: string;
}) {
  const {
    data: myRecommendations,
    error,
    isLoading,
  } = useSWR(["myRecommendations", userId], () =>
    getUserRecommendationsById(userId)
  );

  if (isLoading) {
    return <MyRecommendationSkeleton />;
  }

  if (error || !myRecommendations) {
    return (
      <ErrorMessage
        title="Failed to Load Recommendations"
        message="Unable to fetch your recommendations."
        hint="Please try again later."
      />
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-15 pt-28 pb-16 text-white">
      {myRecommendations.length === 0 ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Your Movie/Shows Recommendations is Empty
          </h1>
          <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
            You haven&apos;t recommended any Movies/Shows yet. Start{" "}
            <Link href="/browse" className="text-white hover:underline">
              browsing
            </Link>{" "}
            to recommend some!
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Your Movies/Shows Recommendations
          </h1>
          <p className="text-gray-600 mb-6 font-[family-name:var(--font-geist-mono)]">
            Here are the Movies/Shows you&apos;ve recommended.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-6">
            {myRecommendations.map((item) => (
              <FilmCard
                key={item.recommendation_id}
                item={item}
                userId={userId}
                isDeleteRecommendation
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

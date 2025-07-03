"use client";

import useSWR from "swr";
import { getRecommendations } from "@/actions/recommendationActions";
import LatestRecoRow from "./LatestRecoRow";
import GenreRecoRow from "./GenreRecoRow";
import RowSkeleton from "./RowSkeleton";
import ErrorMessage from "@/components/ErrorMessage";

export default function BrowsePage() {
  const {
    data: allData,
    isLoading,
    error,
  } = useSWR("all-recommendations", () => getRecommendations());

  if (isLoading) {
    return (
      <main className="pt-28 min-h-screen px-15 bg-black pb-16 space-y-6">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </main>
    );
  }

  if (!allData || error) {
    return (
      <ErrorMessage
        title="Failed to load recommendations."
        message="Please try again later or contact support if the issue persists."
      />
    );
  }

  const genres = [...new Set(allData.flatMap((r) => r.genres || []))].sort();
  const getByGenre = (genre: string) =>
    allData.filter((r) => r.genres?.includes(genre));

  return (
    <main className="pt-28 min-h-screen px-15 bg-black pb-16 space-y-6">
      <LatestRecoRow items={allData} />
      {genres.map((genre) => {
        const items = getByGenre(genre);
        return items.length > 0 ? (
          <GenreRecoRow key={genre} genre={genre} items={items} />
        ) : null;
      })}
    </main>
  );
}

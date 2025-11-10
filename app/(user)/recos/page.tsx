"use client";

import LatestRecoRow from "./LatestRecoRow";
import GenreRecoRow from "./GenreRecoRow";
import RecommendButton from "./RecommendButton";
import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import RowSkeleton from "./RowSkeleton";
import ErrorMessage from "@/components/ErrorMessage";
import { Recommendation } from "@/types/recommendation";

export default function RecosPage() {
  const {
    data: recos,
    error,
    isLoading,
  } = useSWR<Recommendation[]>("/api/recos", fetcher);

  if (isLoading || !recos) {
    return (
      <main className="pb-16 overflow-hidden pt-28  lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 min-h-screen space-y-6 bg-black px-7 ">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </main>
    );
  }

  if (error) {
    return <ErrorMessage />;
  }

  const genres = [...new Set(recos?.flatMap((r) => r.genres || []))].sort();
  const getByGenre = (genre: string) =>
    recos?.filter((r) => r.genres?.includes(genre));

  return (
    <main className=" overflow-hidden  min-h-screen  bg-black pb-16  pt-28 px-7 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />
      <LatestRecoRow items={recos || []} />

      {genres.map((genre) => {
        const items = getByGenre(genre) ?? [];
        return items.length > 0 ? (
          <GenreRecoRow key={genre} genre={genre} items={items} />
        ) : null;
      })}

      <RecommendButton />
    </main>
  );
}

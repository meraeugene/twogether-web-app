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

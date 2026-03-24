"use client";

import LatestRecoRow from "./LatestRecoRow";
import GenreRecoRow from "./GenreRecoRow";
import RecommendButton from "./RecommendButton";
import { Recommendation } from "@/types/recommendation";

export default function RecosClient({
  recos,
}: {
  recos: Recommendation[];
}) {
  const genres = [...new Set(recos.flatMap((r) => r.genres || []))].sort();
  const getByGenre = (genre: string) =>
    recos.filter((r) => r.genres?.includes(genre));

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-7 pb-16 pt-28 lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <LatestRecoRow items={recos} />

      {genres.map((genre) => {
        const items = getByGenre(genre);
        return items.length > 0 ? (
          <GenreRecoRow key={genre} genre={genre} items={items} />
        ) : null;
      })}

      <RecommendButton />
    </main>
  );
}

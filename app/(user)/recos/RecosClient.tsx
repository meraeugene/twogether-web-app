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
    <main className="page-gutter page-listing relative min-h-screen overflow-hidden bg-black px-7 pb-16 pt-28 font-[family-name:var(--font-geist-sans)] text-white">
      <div className="pointer-events-none absolute inset-0 page-ambient" />
      <h1 className="sr-only">Recommendations</h1>
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

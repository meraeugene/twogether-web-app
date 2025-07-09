import { getRecommendations } from "@/actions/recommendationActions";
import LatestRecoRow from "./LatestRecoRow";
import GenreRecoRow from "./GenreRecoRow";

export default async function BrowsePage() {
  const allData = (await getRecommendations()) || [];

  const genres = [...new Set(allData.flatMap((r) => r.genres || []))].sort();
  const getByGenre = (genre: string) =>
    allData.filter((r) => r.genres?.includes(genre));

  return (
    <main className="pb-16 overflow-hidden pt-28 min-h-screen space-y-6 bg-black px-15">
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

import { getRecommendations } from "@/actions/recommendationActions";
import LatestRecoRow from "./LatestRecoRow";
import GenreRecoRow from "./GenreRecoRow";

export default async function BrowsePage() {
  const allData = (await getRecommendations()) || [];

  const genres = [...new Set(allData.flatMap((r) => r.genres || []))].sort();
  const getByGenre = (genre: string) =>
    allData.filter((r) => r.genres?.includes(genre));

  return (
    <main className=" overflow-hidden  min-h-screen  bg-black pb-16  pt-28 px-7 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
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

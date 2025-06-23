import { getRecommendations } from "@/actions/recommendationActions";
import FilmCard from "@/components/FilmCard";

export default async function BrowsePage() {
  const allData = (await getRecommendations()) || [];

  const genres = [...new Set(allData.flatMap((r) => r.genres || []))].sort();
  const getByGenre = (genre: string) =>
    allData.filter((r) => r.genres?.includes(genre));

  return (
    <main className="pb-16 pt-28 min-h-screen space-y-6 bg-black px-15 font-[family-name:var(--font-geist-mono)]">
      <section className="mb-16">
        <h2 className="text-3xl font-semibold">Latest Reco</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-6">
          {allData.map((item) => (
            <FilmCard key={item.recommendation_id} item={item} />
          ))}
        </div>
      </section>

      {genres.map((genre) => {
        const items = getByGenre(genre);
        if (items.length === 0) return null;

        return (
          <section key={genre} className="mb-16">
            <h2 className="text-3xl font-semibold">{genre} Picks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-6">
              {items.map((item) => (
                <FilmCard key={item.recommendation_id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

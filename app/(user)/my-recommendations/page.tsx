import { getCurrentUserRecommendations } from "@/actions/recommendationActions";
import FilmCard from "@/components/FilmCard";
import ErrorMessage from "@/components/ErrorMessage";
import Link from "@/components/NavigationLink";
import { Section } from "./Section";

export default async function MyRecommendationsPage() {
  const data = await getCurrentUserRecommendations();

  if (!data) return <ErrorMessage />;

  const { userId, public: publicRecs, private: privateRecs } = data;
  const hasNoRecs = publicRecs.length === 0 && privateRecs.length === 0;

  if (hasNoRecs) {
    return (
      <main className="page-gutter page-listing min-h-screen bg-black px-7  pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)]">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your Recommendations
        </h1>
        <p className="mb-8 text-sm leading-6 text-white/55">
          You haven&apos;t recommended anything yet. Start{" "}
          <Link
            href="/browse"
            className="text-white underline"
          >
            browsing
          </Link>{" "}
          to find something worth sharing!
        </p>
      </main>
    );
  }

  return (
    <main className="page-gutter page-listing min-h-screen relative bg-black px-7 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="absolute inset-0 page-ambient pointer-events-none" />

      <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your Recommendations</h1>
      <p className="mb-8 text-sm leading-6 text-white/55">
        Here are the movies and shows you&apos;ve recommended.
      </p>

      {publicRecs.length > 0 && (
        <Section title="Public">
          {publicRecs.map((item, index) => (
            <FilmCard
              key={item.recommendation_id}
              item={item}
              priority={index < 6}
              userId={userId}
              isDeleteRecommendation
            />
          ))}
        </Section>
      )}

      {privateRecs.length > 0 && (
        <Section title="Private">
          {privateRecs.map((item, index) => (
            <FilmCard
              key={item.recommendation_id}
              item={item}
              priority={publicRecs.length === 0 && index < 6}
              userId={userId}
              isDeleteRecommendation
            />
          ))}
        </Section>
      )}
    </main>
  );
}

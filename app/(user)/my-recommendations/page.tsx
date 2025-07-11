import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import { getMyRecommendations } from "@/actions/recommendationActions";
import FilmCard from "../../../components/FilmCard";

export default async function MyRecommendationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { public: publicRecs, private: privateRecs } =
    await getMyRecommendations(user.id);

  const hasNoRecs = publicRecs.length === 0 && privateRecs.length === 0;

  if (hasNoRecs) {
    return (
      <main className="min-h-screen bg-black px-15 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-2xl font-bold mb-4">
          Your Movie/Show Recommendations are Empty
        </h1>
        <p className="text-gray-400 mb-6 ">
          You haven't recommended anything yet. Start{" "}
          <Link href="/browse" className="text-white underline">
            browsing
          </Link>{" "}
          to find something worth sharing!
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-15 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-4">Your Recommendations</h1>

      {publicRecs.length > 0 && (
        <Section title="Public">
          {publicRecs.map((item) => (
            <FilmCard
              key={item.recommendation_id}
              item={item}
              userId={user.id}
              isDeleteRecommendation
            />
          ))}
        </Section>
      )}

      {privateRecs.length > 0 && (
        <Section title="Private">
          {privateRecs.map((item) => (
            <FilmCard
              key={item.recommendation_id}
              item={item}
              userId={user.id}
              isDeleteRecommendation
            />
          ))}
        </Section>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 ">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {children}
      </div>
    </section>
  );
}

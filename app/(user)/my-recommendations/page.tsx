import Link from "next/link";
import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import { getMyRecommendations } from "@/actions/recommendationActions";
import FilmCard from "../../../components/FilmCard";
import { FaLock, FaGlobe } from "react-icons/fa";

export default async function MyRecommendationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { public: publicRecs, private: privateRecs } =
    await getMyRecommendations(user.id);

  const hasNoRecs = publicRecs.length === 0 && privateRecs.length === 0;

  if (hasNoRecs) {
    return (
      <main className="min-h-screen bg-black px-7 lg:px-15 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-2xl font-bold mb-4">
          Your Movie/Show Recommendations are Empty
        </h1>
        <p className="text-gray-400 mb-6 ">
          You haven&apos;t recommended anything yet. Start{" "}
          <Link href="/browse" className="text-white underline">
            browsing
          </Link>{" "}
          to find something worth sharing!
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-7 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
      <h1 className="text-2xl font-bold mb-2">Your Recommendations</h1>
      <p className="text-gray-600 mb-8 font-[family-name:var(--font-geist-mono)]">
        Here are the movies and shows you&apos;ve recommended.
      </p>

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
  const isPublic = title.toLowerCase() === "public";
  const Icon = isPublic ? FaGlobe : FaLock;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon className="text-white/60 text-sm" />
        <span>{title}</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {children}
      </div>
    </section>
  );
}

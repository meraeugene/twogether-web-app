import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import WatchClient from "./WatchClient";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const recommendationId = (await params).id;

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-16 px-15">
      <WatchClient currentUser={user} recommendationId={recommendationId} />
    </main>
  );
}

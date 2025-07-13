import { getCurrentUser } from "@/actions/authActions";
import AIWatchClient from "./AIWatchClient";
import { redirect } from "next/navigation";
import { hasUserRecommendedFilm } from "@/actions/recommendationActions";

export default async function AIWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const baseId = (await params).id;
  const tmdbId = baseId?.split("-")?.[1] ?? "";

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  const hasRecommended = await hasUserRecommendedFilm(currentUser.id, tmdbId);

  return (
    <AIWatchClient
      currentUser={currentUser}
      alreadyRecommended={hasRecommended}
    />
  );
}

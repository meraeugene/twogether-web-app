import ErrorMessage from "@/components/ErrorMessage";
import TabbedProfileView from "./TabbedProfileView";
import { getCurrentUser, getUserByUsername } from "@/actions/authActions";
import { getFollowStatsWithStatus } from "@/actions/followActions";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import { getUserRecommendationsById } from "@/actions/recommendationActions";

export default async function UserProfile({
  params,
}: {
  params: Promise<{ username: string; userId: string }>;
}) {
  const username = decodeURIComponent((await params).username);
  const userId = (await params).userId;

  const currentUser = await getCurrentUser();

  const [user, userRecommendations, userWatchList, followStats] =
    await Promise.all([
      getUserByUsername(username),
      getUserRecommendationsById(userId),
      getWatchlistByUserId(userId),
      getFollowStatsWithStatus(userId, currentUser?.id ?? ""),
    ]);

  if (!user || !userRecommendations || !userWatchList || !followStats) {
    return <ErrorMessage />;
  }

  return (
    <TabbedProfileView
      user={user}
      currentUser={currentUser ?? undefined}
      userRecommendations={userRecommendations}
      userWatchList={userWatchList}
      followStats={followStats}
    />
  );
}

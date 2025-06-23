import ErrorMessage from "@/components/ErrorMessage";
import TabbedProfileView from "./TabbedProfileView";
import { CurrentUser } from "@/types/user";
import { getCurrentUser, getUserByUsername } from "@/actions/authActions";
import { redirect } from "next/navigation";
import { getFollowStatsWithStatus } from "@/actions/followActions";
import { getWatchlistByUserId } from "@/actions/watchlistActions";
import { getUserRecommendationsById } from "@/actions/recommendationActions";

export default async function UserProfile({
  params,
}: {
  params: Promise<{ username: string; userId: string }>;
}) {
  const username = (await params).username;
  const userId = (await params).userId;

  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    redirect("/");
  }

  const [user, userRecommendations, userWatchList, followStats] =
    await Promise.all([
      getUserByUsername(username),
      getUserRecommendationsById(userId),
      getWatchlistByUserId(userId),
      getFollowStatsWithStatus(userId, currentUser.id),
    ]);

  if (!user || !userRecommendations || !userWatchList || !followStats) {
    return (
      <ErrorMessage
        title="Something went wrong"
        message="We couldn't load this user's profile."
        hint="Please try again later."
      />
    );
  }

  return (
    <TabbedProfileView
      user={user}
      currentUser={currentUser}
      userRecommendations={userRecommendations}
      userWatchList={userWatchList}
      followStats={followStats}
    />
  );
}

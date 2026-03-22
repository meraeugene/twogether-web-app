import { getCurrentUser } from "@/actions/authActions";
import TabbedFriendsView from "./TabbedFriendsView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const FriendsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return <TabbedFriendsView currentUserId={currentUser.id} />;
};

export default FriendsPage;

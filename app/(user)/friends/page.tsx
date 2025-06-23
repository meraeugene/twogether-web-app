import { getCurrentUser } from "@/actions/authActions";
import TabbedFriendsView from "./TabbedFriendsView";
import { redirect } from "next/navigation";

const FriendsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return <TabbedFriendsView currentUserId={currentUser.id} />;
};

export default FriendsPage;

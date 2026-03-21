import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import WatchPartyJoinClient from "./WatchPartyJoinClient";

export default async function WatchPartyJoinPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  return <WatchPartyJoinClient currentUserId={currentUser.id} />;
}


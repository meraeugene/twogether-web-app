import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import MyRecommendationsClient from "./MyRecommendationsClient";

export default async function MyRecommendationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return <MyRecommendationsClient userId={user.id} />;
}

import { getCurrentUser } from "@/actions/authActions";
import RecommendForm from "./RecommendForm";
import { redirect } from "next/navigation";

export default async function RecommendPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <RecommendForm userId={user.id} />;
}

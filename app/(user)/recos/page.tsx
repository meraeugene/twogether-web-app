import { getRecommendations } from "@/actions/recommendationActions";
import ErrorMessage from "@/components/ErrorMessage";
import RecosClient from "./RecosClient";

export const dynamic = "force-dynamic";

export default async function RecosPage() {
  const recos = await getRecommendations();

  if (!recos) {
    return <ErrorMessage />;
  }

  return <RecosClient recos={recos} />;
}

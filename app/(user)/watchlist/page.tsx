import { getCurrentUser } from "@/actions/authActions";
import { redirect } from "next/navigation";
import WatchlistClient from "./WatchlistClient";

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-15 pt-28 pb-16 text-white">
      <WatchlistClient userId={user.id} />
    </main>
  );
}

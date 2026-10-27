import { getCurrentUser } from "@/actions/authActions";
import MessagesClient from "./MessageClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const page = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/");
  }

  return (
    <main className="page-gutter page-listing min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 relative text-white">
      <div className="absolute inset-0 page-ambient pointer-events-none" />
      <h1 className="relative mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Chats</h1>
      <MessagesClient currentUserId={currentUser.id} />
    </main>
  );
};

export default page;

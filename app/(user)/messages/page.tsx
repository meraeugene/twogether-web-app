import { getCurrentUser } from "@/actions/authActions";
import MessagesClient from "./MessageClient";
import { redirect } from "next/navigation";

const page = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-15 pt-28 pb-16 text-white">
      <MessagesClient currentUserId={currentUser.id} />
    </div>
  );
};

export default page;

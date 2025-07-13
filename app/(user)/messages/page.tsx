import { getCurrentUser } from "@/actions/authActions";
import MessagesClient from "./MessageClient";
import { redirect } from "next/navigation";

const page = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col  px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 text-white">
      <MessagesClient currentUserId={currentUser.id} />
    </div>
  );
};

export default page;

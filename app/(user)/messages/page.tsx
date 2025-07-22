import { getCurrentUser } from "@/actions/authActions";
import MessagesClient from "./MessageClient";
import { redirect } from "next/navigation";

const page = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col  px-4 pt-28 pb-16 lg:px-24 xl:px-32 relative 2xl:px-26 xl:pt-32 text-white">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      <MessagesClient currentUserId={currentUser.id} />
    </div>
  );
};

export default page;

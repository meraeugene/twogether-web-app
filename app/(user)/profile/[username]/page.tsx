import { getUserByUsername } from "@/actions/authActions";
import EditProfileForm from "./EditProfileForm";
import ErrorMessage from "@/components/ErrorMessage";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;
  const user = await getUserByUsername(username);

  if (!user) {
    return (
      <ErrorMessage
        title="User Not Found"
        message="The user you are trying to edit does not exist or has been deleted."
      />
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black  px-7  pt-28 pb-16 lg:px-24  xl:px-32 2xl:px-26 xl:pt-34 relative text-white">
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
      <EditProfileForm user={user} />
    </main>
  );
}

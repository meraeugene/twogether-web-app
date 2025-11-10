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
    return <ErrorMessage />;
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black  px-7  pt-28 pb-16 lg:px-24  xl:px-32 2xl:px-26 xl:pt-34 relative text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <EditProfileForm user={user} />
    </main>
  );
}

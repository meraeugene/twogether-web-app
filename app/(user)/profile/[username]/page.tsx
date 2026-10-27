import { getUserByUsername } from "@/actions/authActions";
import EditProfileForm from "./EditProfileForm";
import ErrorMessage from "@/components/ErrorMessage";
import { Suspense } from "react";
import { EditProfilePageSkeleton } from "@/components/PageSkeletons";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<EditProfilePageSkeleton />}>
      <EditProfileContent params={params} />
    </Suspense>
  );
}

async function EditProfileContent({
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
    <main className="page-gutter page-listing min-h-screen font-[family-name:var(--font-geist-sans)] bg-black  px-7  pt-28 pb-16 relative text-white">
      <div className="absolute inset-0 page-ambient pointer-events-none" />
      <EditProfileForm user={user} />
    </main>
  );
}

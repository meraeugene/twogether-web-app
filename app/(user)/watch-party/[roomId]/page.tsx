import { getCurrentUser } from "@/actions/authActions";
import { getWatchPartyRoom } from "@/actions/watchPartyActions";
import { redirect } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import WatchPartyRoomClient from "./WatchPartyRoomClient";

export default async function WatchPartyRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  const roomId = (await params).roomId;
  try {
    const room = await getWatchPartyRoom(roomId, currentUser.id);

    if (!room) return <ErrorMessage title="Watch room not found." />;

    return <WatchPartyRoomClient room={room} currentUserId={currentUser.id} />;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Leave that room first")
    ) {
      const params = new URLSearchParams({
        error: "active-room",
        message: error.message,
      });
      redirect(`/watch-party?${params.toString()}`);
    }

    return (
      <ErrorMessage
        title="Unable to join this room"
        message={
          error instanceof Error
            ? error.message
            : "You can't open this room right now."
        }
        actionLabel="Back to Watch Party"
        href="/watch-party"
      />
    );
  }
}

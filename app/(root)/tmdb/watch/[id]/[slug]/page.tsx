import { getCurrentUser } from "@/actions/authActions";
import TMDBWatchPage from "./TMDBWatchPage";

const page = async () => {
  const currentUser = await getCurrentUser();

  return <TMDBWatchPage currentUser={currentUser} />;
};

export default page;

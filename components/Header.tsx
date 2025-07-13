import { getCurrentUser } from "@/actions/authActions";
import { Navbar } from "./Navbar";

export default async function Header() {
  const user = await getCurrentUser();

  return <Navbar user={user} />;
}

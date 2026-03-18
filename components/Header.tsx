import { Navbar } from "./Navbar";
import { CurrentUser } from "@/types/user";

export default function Header({ user }: { user: CurrentUser | null }) {
  return <Navbar user={user} />;
}

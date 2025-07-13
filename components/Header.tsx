import { getCurrentUser } from "@/actions/authActions";
import { Navbar } from "./Navbar";
import { redirect } from "next/navigation";

export default async function Header() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <Navbar user={user} />;
}

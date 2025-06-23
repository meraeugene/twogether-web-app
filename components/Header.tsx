import { getCurrentUser } from "@/actions/authActions";
import Link from "next/link";
import LoginButton from "./LoginButton";
import { ProfileMenu } from "./ProfileMenu";
import { IoMdAdd } from "react-icons/io";
import { MdMovieFilter } from "react-icons/md";
import { RiFilmAiLine, RiMovieAiLine } from "react-icons/ri";
import { FaUserFriends } from "react-icons/fa";

const Header = async () => {
  const user = await getCurrentUser();

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10 px-15 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-2xl font-extrabold  font-[family-name:var(--font-geist-mono)] uppercase"
      >
        <span className="text-red-600">Two</span>gether
      </Link>
      {user ? (
        <nav className="flex items-center  gap-3">
          <Link
            href="/browse"
            className="px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur border border-white/20 shadow-sm text-white hover:bg-white/20 transition"
          >
            <RiMovieAiLine className="text-lg" />
            Browse Recommendations
          </Link>
          <Link
            href="/recommend"
            className="px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur border border-white/20 shadow-sm text-white hover:bg-white/20 transition"
          >
            <IoMdAdd className="text-lg" />
            Recommend a Film
          </Link>
          <Link
            href="/my-recommendations"
            className="px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur border border-white/20 shadow-sm text-white hover:bg-white/20 transition"
          >
            <RiFilmAiLine className="text-lg" />
            My Recommendations
          </Link>
          <Link
            href="/watchlist"
            className="px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur border border-white/20 shadow-sm text-white hover:bg-white/20 transition"
          >
            <MdMovieFilter className="text-lg" />
            My Watchlist
          </Link>
          <Link
            href="/friends"
            className="px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur border border-white/20 shadow-sm text-white hover:bg-white/20 transition"
          >
            <FaUserFriends className="text-lg" />
            Friends
          </Link>
          <ProfileMenu user={user} />
        </nav>
      ) : (
        <nav className="space-x-6 text-sm font-medium text-white/90 flex items-center">
          <Link href="#about" className="hover:text-red-500 transition">
            About
          </Link>
          <Link href="#features" className="hover:text-red-500 transition">
            Features
          </Link>
          <Link href="#faqs" className="hover:text-red-500 transition">
            FAQs
          </Link>
          <LoginButton />
        </nav>
      )}
    </header>
  );
};

export default Header;

"use client";

import { IoMdAdd } from "react-icons/io";
import { MdMovieFilter, MdStars } from "react-icons/md";
import { RiFilmAiLine, RiMovieAiLine } from "react-icons/ri";
import { FaUserFriends } from "react-icons/fa";
import { LuMessageSquareHeart } from "react-icons/lu";
import { BiMoviePlay } from "react-icons/bi";
import { AiOutlineFieldTime } from "react-icons/ai";

export const primaryNavItems = [
  {
    label: "Browse",
    href: "/browse",
    icon: <RiMovieAiLine className="text-lg" />,
  },
  {
    label: "Binge",
    href: "/binge",
    icon: <BiMoviePlay className="text-lg" />,
  },
  {
    label: "Chrono",
    href: "/chrono",
    icon: <AiOutlineFieldTime className="text-lg" />,
  },
  {
    label: "Recos",
    href: "/recos",
    icon: <MdStars className="text-lg" />,
  },
  {
    label: "AI Reco",
    href: "/ai-recommend",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em">
        <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
      </svg>
    ),
  },
  {
    label: "Reco",
    href: "/recommend",
    icon: <IoMdAdd className="text-lg" />,
  },
];

export const secondaryNavItems = [
  {
    label: "My Recos",
    href: "/my-recommendations",
    icon: <RiFilmAiLine className="text-lg" />,
  },
  {
    label: "Watchlist",
    href: "/watchlist",
    icon: <MdMovieFilter className="text-lg" />,
  },
  {
    label: "Friends",
    href: "/friends",
    icon: <FaUserFriends className="text-lg" />,
  },
  {
    label: "Chats",
    href: "/messages",
    icon: <LuMessageSquareHeart className="text-lg" />,
  },
];

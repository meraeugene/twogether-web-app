import {
  Clapperboard, Compass, Heart, History, Library, MessagesSquare,
  Star, Users, WandSparkles, type LucideIcon,
} from "lucide-react";

// Both navigation surfaces use the same symbols for the same destinations.
export const navigationIcons: Record<string, LucideIcon> = {
  "/browse": Compass,
  "/binge": Clapperboard,
  "/chrono": History,
  "/watchlist": Library,
  "/recos": Star,
  "/my-recommendations": Heart,
  "/ai-recommend": WandSparkles,
  "/friends": Users,
  "/messages": MessagesSquare,
};

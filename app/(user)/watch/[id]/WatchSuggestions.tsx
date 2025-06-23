import Link from "next/link";
import Image from "next/image";
import { Recommendation } from "@/types/recommendation";
import { FaPlay } from "react-icons/fa";

export default function WatchSuggestions({
  suggestions,
}: {
  suggestions: Recommendation[];
}) {
  return (
    <aside className="w-full lg:w-[10%] space-y-4">
      {suggestions.map((rec) => (
        <div
          key={rec.recommendation_id}
          className="  w-full rounded-sm overflow-hidden shadow-lg"
        >
          <div className=" group relative">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={rec.poster_url || "/placeholder.png"}
                alt={rec.title}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                fill
                className="object-cover w-full h-full transition duration-300 group-hover:brightness-50 rounded-lg"
              />
            </div>

            {/* Centered Watch Now Button on Hover */}
            <div
              className="
              absolute inset-0 z-10 flex items-center justify-center
              opacity-0 group-hover:opacity-100
              transition-all duration-500 bg-black/50 
            "
            >
              <Link
                href={`/watch/${rec.recommendation_id}`}
                className="
              flex items-center justify-center
              w-12 h-12 rounded-full
              bg-red-500 hover:bg-red-600
              text-white shadow-md
              ring-1 ring-white/10 hover:ring-3 hover:ring-red-100
              transition duration-300 ease-in-out
              transform hover:scale-110
            "
              >
                <FaPlay className="text-xl " />
              </Link>
            </div>
          </div>

          <div className="flex-1 text-sm py-2">
            <div className="font-medium text-white line-clamp-2">
              {rec.title}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white/60 text-xs mt-2">
                {rec.year} · {rec.duration}m
              </div>
              <div className="text-white/60  text-xs capitalize">
                {rec.type}
              </div>
            </div>

            {rec.recommended_by && (
              <div className="text-white/40 italic text-xs mt-1">
                Recommended by{" "}
                <Link
                  href={`/profile/${rec.recommended_by.username}/${rec.recommended_by.id}`}
                  className="text-white hover:underline"
                >
                  {rec.recommended_by.username}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </aside>
  );
}

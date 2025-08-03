import Link from "next/link";
import Image from "next/image";
import { Recommendation } from "@/types/recommendation";
import { FaPlay } from "react-icons/fa";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";
import { VisualHeartRating } from "@/components/VisualHeartRating";

export default function WatchSuggestions({
  suggestions,
}: {
  suggestions: Recommendation[];
}) {
  return (
    <aside className="w-full xl:w-[15%] 2xl:w-[10%] space-y-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:block gap-7">
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
                unoptimized
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
                href={`/watch/${rec.tmdb_id}/${getSlugFromTitle(rec.title)}`}
                shallow={true}
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
            <Link
              href={`/watch/${rec.tmdb_id}/${getSlugFromTitle(rec.title)}`}
              className="w-full flex items-center gap-3 text-white bg-red-600 hover:bg-red-700 transition p-2 rounded-md font-[family-name:var(--font-geist-mono)] text-sm mt-2 mb-4 lg:hidden"
            >
              <FaPlay className="text-white text-xs" />
              Watch Now
            </Link>
            <div className="font-medium text-white line-clamp-2">
              {rec.title}
            </div>
            <div className="flex mt-2 items-center justify-between">
              <div className="text-white/80 text-xs  flex gap-2">
                <span>{rec.year} </span>
                {rec.type === "tv" ? (
                  <span className="text-white/50 font-medium">
                    S{rec.seasons || 1} · {rec.episodes || 1}EPS
                  </span>
                ) : (
                  <span className="text-white/50 font-medium">
                    {rec.duration || "0"}m
                  </span>
                )}
              </div>

              <div
                className={`${
                  rec.type === "tv" ? "uppercase" : "capitalize"
                } text-white/70  text-xs `}
              >
                {rec.type}
              </div>
            </div>

            {rec.comment && (
              <p className="text-sm text-white/80 border-l-4 border-red-500 pl-2 my-3 italic">
                &quot;{rec.comment}&quot;
              </p>
            )}

            {rec.rating && <VisualHeartRating value={rec.rating} />}

            <div className=" mt-3">
              <Link
                href={`/profile/${rec.recommended_by.username}/${rec.recommended_by.id}`}
                className=" text-sm text-white/60 hover:underline flex items-center gap-2"
              >
                {rec.recommended_by.avatar_url && (
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={rec.recommended_by.avatar_url}
                      alt={rec.recommended_by.username}
                      width={24}
                      unoptimized
                      height={24}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                {rec.recommended_by.username}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </aside>
  );
}

"use client";

import FilmCard from "@/components/FilmCard";
import { PlaceholdersAndVanishInput } from "@/components/ui/PlaceholdersAndVanishInput";
import { browsePlaceholders } from "@/constants/placeholders";
import { ArtistMovie, ArtistProfile } from "@/types/artistSearch";
import { Recommendation } from "@/types/recommendation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type SearchClientProps = {
  query: string;
  results: Recommendation[];
  artist: ArtistProfile | null;
  artistMovies: ArtistMovie[];
};

export default function SearchClient({
  query,
  results,
  artist,
  artistMovies,
}: SearchClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const hasArtistResults = Boolean(artist && artistMovies.length > 0);

  const biography = useMemo(() => {
    if (!artist?.biography) return "No biography available yet.";
    if (artist.biography.length <= 320) return artist.biography;
    return `${artist.biography}`;
  }, [artist?.biography]);

  const adaptedArtistMovies = useMemo<Recommendation[]>(() => {
    return artistMovies.map((movie) => {
      const baseId = `movie-${movie.id}`;

      return {
        id: baseId,
        recommendation_id: baseId,
        tmdb_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_url ?? undefined,
        type: "movie",
        stream_url: [
          `https://vidsrc.cc/v2/embed/movie/${movie.id}?autoPlay=false&poster=true`,
          `https://vidsrc.to/embed/movie/${movie.id}`,
        ],
        genres: movie.genres || [],
        year: movie.year,
        duration: movie.duration ?? undefined,
        synopsis: movie.overview,
        trailer_key: movie.trailer_key ?? null,
        visibility: "public",
        comment: movie.role || "Cast",
        is_tmdb_recommendation: true,
        created_at: new Date().toISOString(),
        recommended_by: {
          id: "tmdb",
          username: "",
          avatar_url: "",
        },
      };
    });
  }, [artistMovies]);

  const handleSubmit = (e?: React.FormEvent, submittedValue?: string) => {
    e?.preventDefault();

    if (isPending) return;

    const trimmed = (submittedValue ?? searchQuery).trim();
    if (!trimmed) return;

    startTransition(() => {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
    });
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <Link
        prefetch
        href="/browse"
        className="mb-6 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-red-600 transition hover:bg-red-600 hover:text-white"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="mx-auto mb-8 w-full max-w-2xl">
        <PlaceholdersAndVanishInput
          placeholders={browsePlaceholders}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSubmit}
        />
      </div>

      {!isPending && (
        <h1 className="mb-6 text-xl font-bold md:text-3xl lg:text-3xl">
          Search results for: <span className="text-red-500">{query}</span>
        </h1>
      )}

      {isPending ? (
        <div className="space-y-8 py-4">
          <div className="h-12 w-56 animate-pulse rounded-full bg-white/10" />
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2"
              >
                <div className="aspect-2/3 w-full animate-pulse rounded-lg bg-white/10" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ) : hasArtistResults && artist ? (
        <section className="relative text-white">
          {/* 1. Large Background Typography (Watermark Effect) */}
          <div className="pointer-events-none absolute right-0 top-2 select-none overflow-hidden leading-none opacity-[0.03] sm:top-6 md:top-10">
            <h1 className="text-[16vw] font-black uppercase tracking-tighter sm:text-[15vw]">
              {artist.name}
            </h1>
          </div>

          <div className="container mx-auto px-0 py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-end lg:gap-12">
              {/* 2. The Poster-Style Portrait */}
              <div className="relative z-10 w-full shrink-0 max-w-[250px] sm:max-w-[300px] md:max-w-[320px]">
                <div className="group relative aspect-[3/4] overflow-hidden rounded-sm ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  {artist.profile_url ? (
                    <Image
                      src={artist.profile_url}
                      alt={artist.name}
                      fill
                      className="object-cover "
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-neutral-900 text-neutral-500">
                      No Image
                    </div>
                  )}
                  {/* Subtle Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>

              {/* 3. Minimalist Info Block */}
              <div className="relative z-20  flex-1 space-y-6">
                <div className="space-y-2">
                  <h2 className="break-words text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:-ml-4 xl:-ml-8 xl:text-7xl">
                    {artist.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-sm font-medium tracking-wide sm:tracking-widest text-red-500 uppercase">
                    {artist.known_for_department && (
                      <span>{artist.known_for_department}</span>
                    )}
                    {artist.known_for_department && artist.place_of_birth && (
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                    )}
                    {artist.place_of_birth && (
                      <span className="text-white/50">
                        {artist.place_of_birth}
                      </span>
                    )}
                  </div>
                </div>

                <p className="max-w-2xl text-base leading-relaxed text-neutral-400 font-light italic sm:text-lg">
                  &quot;{biography?.split(".")[0]}.&quot;
                </p>
              </div>
            </div>

            <div className="mt-16 flex items-center flex-wrap gap-2 sm:gap-3">
              <h3 className="text-lg font-semibold sm:text-xl md:text-2xl">
                Movies featuring {artist.name}
              </h3>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {adaptedArtistMovies.length} titles
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
              {adaptedArtistMovies.map((item) => (
                <div key={item.id} className="space-y-2">
                  <FilmCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : results.length === 0 ? (
        <p className="text-center text-sm text-white/60 md:text-base lg:text-left lg:text-lg">
          No results found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
          {results.map((item) => (
            <FilmCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

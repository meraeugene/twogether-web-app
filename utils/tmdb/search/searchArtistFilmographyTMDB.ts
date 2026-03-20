import { ArtistMovie, ArtistProfile } from "@/types/artistSearch";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

function formatDepartment(department?: string) {
  switch ((department || "").toLowerCase()) {
    case "acting":
      return "Actor/Actress";
    case "directing":
      return "Director";
    case "writing":
      return "Writer";
    case "production":
      return "Producer";
    case "camera":
      return "Cinematographer";
    case "editing":
      return "Editor";
    case "art":
      return "Art Department";
    default:
      return department || "";
  }
}

type PersonSearchResult = {
  id: number;
  name: string;
  profile_path?: string | null;
  popularity?: number;
  known_for_department?: string;
};

type MovieCreditResult = {
  id: number;
  title?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  popularity?: number;
  character?: string;
  job?: string;
};

type PersonDetailsResponse = {
  id: number;
  name: string;
  biography?: string;
  profile_path?: string | null;
  birthday?: string;
  place_of_birth?: string;
  known_for_department?: string;
  movie_credits?: {
    cast?: MovieCreditResult[];
    crew?: MovieCreditResult[];
  };
};

type ArtistFilmographySearchResponse = {
  artist: ArtistProfile | null;
  movies: ArtistMovie[];
};

export async function searchArtistFilmographyTMDB(
  query: string,
): Promise<ArtistFilmographySearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { artist: null, movies: [] };
  }

  const normalize = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const normalizedQuery = normalize(trimmed);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  const personSearchUrl = `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(
    trimmed,
  )}&include_adult=false&language=en-US&page=1`;

  const searchRes = await fetch(personSearchUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });

  if (!searchRes.ok) {
    return { artist: null, movies: [] };
  }

  const searchData = (await searchRes.json()) as {
    results?: PersonSearchResult[];
  };

  const getNameScore = (name: string) => {
    const normalizedName = normalize(name);
    if (!normalizedName) return 0;
    if (normalizedName === normalizedQuery) return 100;
    if (normalizedName.startsWith(normalizedQuery)) return 85;
    if (normalizedName.includes(normalizedQuery)) return 70;

    const nameTokens = normalizedName.split(" ").filter(Boolean);
    const overlap = queryTokens.filter((token) =>
      nameTokens.some((nameToken) => nameToken.startsWith(token)),
    ).length;

    if (!queryTokens.length) return 0;
    return Math.round((overlap / queryTokens.length) * 50);
  };

  const people = (searchData.results || [])
    .map((person) => ({ person, score: getNameScore(person.name) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.person.popularity ?? 0) - (a.person.popularity ?? 0);
    })
    .map(({ person }) => person);

  const artistCandidate = people[0];

  if (!artistCandidate) {
    return { artist: null, movies: [] };
  }

  if (getNameScore(artistCandidate.name) < 50) {
    return { artist: null, movies: [] };
  }

  const detailsUrl = `${BASE_URL}/person/${artistCandidate.id}?api_key=${API_KEY}&append_to_response=movie_credits`;

  const detailsRes = await fetch(detailsUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });

  if (!detailsRes.ok) {
    return { artist: null, movies: [] };
  }

  const details = (await detailsRes.json()) as PersonDetailsResponse;

  const artist: ArtistProfile = {
    id: details.id,
    name: details.name,
    biography: details.biography || "",
    profile_url: details.profile_path
      ? `https://image.tmdb.org/t/p/w500${details.profile_path}`
      : null,
    birthday: details.birthday,
    place_of_birth: details.place_of_birth,
    known_for_department: formatDepartment(details.known_for_department),
  };

  const movieMap = new Map<number, ArtistMovie>();

  const castCredits = details.movie_credits?.cast || [];
  for (const movie of castCredits) {
    if (!movie.id || !movie.title || !movie.poster_path) continue;

    movieMap.set(movie.id, {
      id: movie.id,
      title: movie.title,
      overview: movie.overview || "",
      poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      year: movie.release_date?.slice(0, 4),
      role: movie.character ? `as ${movie.character}` : "Cast",
      popularity: movie.popularity ?? 0,
    });
  }

  const crewCredits = details.movie_credits?.crew || [];
  for (const movie of crewCredits) {
    if (!movie.id || !movie.title || !movie.poster_path) continue;
    if (movieMap.has(movie.id)) continue;

    movieMap.set(movie.id, {
      id: movie.id,
      title: movie.title,
      overview: movie.overview || "",
      poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      year: movie.release_date?.slice(0, 4),
      role: movie.job || "Crew",
      popularity: movie.popularity ?? 0,
    });
  }

  const rankedMovies = Array.from(movieMap.values())
    .sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      const yearA = Number(a.year || "0");
      const yearB = Number(b.year || "0");
      return yearB - yearA;
    })
    .slice(0, 24);

  const movies = await Promise.all(
    rankedMovies.map(async (movie) => {
      const detailsUrl = `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=videos`;
      const detailsRes = await fetch(detailsUrl, {
        cache: "force-cache",
        next: { revalidate: 86400 },
      });

      if (!detailsRes.ok) return movie;

      const details = (await detailsRes.json()) as {
        runtime?: number;
        genres?: { id: number; name: string }[];
        videos?: {
          results?: {
            key: string;
            site: string;
            type: string;
            official?: boolean;
          }[];
        };
        overview?: string;
      };

      const trailer =
        details.videos?.results?.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official,
        ) ||
        details.videos?.results?.find(
          (video) => video.site === "YouTube" && video.type === "Trailer",
        ) ||
        details.videos?.results?.find((video) => video.site === "YouTube");

      return {
        ...movie,
        overview: details.overview || movie.overview,
        duration: details.runtime ?? null,
        genres: (details.genres || []).map((genre) => genre.name),
        trailer_key: trailer?.key || null,
      };
    }),
  );

  return { artist, movies };
}

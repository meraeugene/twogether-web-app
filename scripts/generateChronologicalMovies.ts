import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { Recommendation } from "../types/recommendation";
import {
  BOND_CHRONOLOGY,
  CONJURING_CHRONOLOGY,
  DCEU_CHRONOLOGY,
  DIVERGENT_CHRONOLOGY,
  EVILDEAD_CHRONOLOGY,
  FASTFURIOUS_CHRONOLOGY,
  HUNGERGAMES_CHRONOLOGY,
  JOHNWICK_CHRONOLOGY,
  LOTR_CHRONOLOGY,
  MAZERUNNER_CHRONOLOGY,
  MCU_CHRONOLOGY,
  MONSTERVERSE_CHRONOLOGY,
  PLANETOFTHEAPES_CHRONOLOGY,
  STARWARS_CHRONOLOGY,
  TRANSFORMERS_CHRONOLOGY,
  WIZARDINGWORLD_CHRONOLOGY,
  XMEN_CHRONOLOGY,
} from "@/seeds/data";

const API_KEY = "6f02b99843c4951e969dccb75a6cdc25";
const BASE = "https://api.themoviedb.org/3";

interface TMDBMovieResponse {
  title: string;
  poster_path: string | null;
  release_date: string;
  runtime: number;
  overview: string;
  genres: { id: number; name: string }[];
}

interface ChronoItem {
  id: string;
  tmdb_id: number;
  recommendation_id: string;
  comment: string;
}

async function enrich(item: ChronoItem): Promise<Recommendation | null> {
  const res = await fetch(`${BASE}/movie/${item.tmdb_id}?api_key=${API_KEY}`);

  if (!res.ok) return null;

  console.log(`Fetching: ${item.tmdb_id} - Status: ${res.status}`);

  const d = (await res.json()) as TMDBMovieResponse;

  return {
    id: item.id,
    tmdb_id: item.tmdb_id,
    recommendation_id: item.recommendation_id,
    title: d.title,
    type: "movie",
    poster_url: d.poster_path
      ? `https://image.tmdb.org/t/p/w500${d.poster_path}`
      : undefined,
    stream_url: [
      `https://vidlink.pro/movie/${item.tmdb_id}?title=true&poster=true&autoplay=false`,
      `https://vidsrc.cc/v2/embed/movie/${item.tmdb_id}?autoPlay=false&poster=true`,
      `https://vidsrc.to/embed/movie/${item.tmdb_id}`,
    ],
    comment: item.comment,
    year: d.release_date?.slice(0, 4),
    duration: d.runtime,
    synopsis: d.overview,
    genres: d.genres?.map((g) => g.name) || [],
    recommended_by: { id: "tmdb", username: "", avatar_url: "" },
    visibility: "public",
    created_at: new Date().toISOString(),
    is_tmdb_recommendation: true,
    generated_by_ai: false,
  };
}

async function enrichFranchise(items: ChronoItem[]): Promise<Recommendation[]> {
  const enriched: Recommendation[] = [];

  for (const item of items) {
    const result = await enrich(item);
    if (result) {
      enriched.push(result);
    } else {
      console.warn(
        `❗ Skipped TMDB ID: ${item.tmdb_id} (${item.recommendation_id})`
      );
    }
  }

  return enriched;
}

async function run() {
  const [
    mcuMovies,
    xmenMovies,
    starwarsMovies,
    lotrMovies,
    bondMovies,
    conjuringMovies,
    transformersMovies,
    fastFuriousMovies,
    dceuMovies,
    monsterverseMovies,
    apesMovies,
    wizardingWorldMovies,
    mazeRunnerMovies,
    hungerGamesMovies,
    divergentMovies,
    evilDeadMovies,
    johnWickMovies,
  ] = await Promise.all([
    enrichFranchise(MCU_CHRONOLOGY),
    enrichFranchise(XMEN_CHRONOLOGY),
    enrichFranchise(STARWARS_CHRONOLOGY),
    enrichFranchise(LOTR_CHRONOLOGY),
    enrichFranchise(BOND_CHRONOLOGY),
    enrichFranchise(CONJURING_CHRONOLOGY),
    enrichFranchise(TRANSFORMERS_CHRONOLOGY),
    enrichFranchise(FASTFURIOUS_CHRONOLOGY),
    enrichFranchise(DCEU_CHRONOLOGY),
    enrichFranchise(MONSTERVERSE_CHRONOLOGY),
    enrichFranchise(PLANETOFTHEAPES_CHRONOLOGY),
    enrichFranchise(WIZARDINGWORLD_CHRONOLOGY),
    enrichFranchise(MAZERUNNER_CHRONOLOGY),
    enrichFranchise(HUNGERGAMES_CHRONOLOGY),
    enrichFranchise(DIVERGENT_CHRONOLOGY),
    enrichFranchise(EVILDEAD_CHRONOLOGY),
    enrichFranchise(JOHNWICK_CHRONOLOGY),
  ]);

  const output = {
    mcuMovies,
    xmenMovies,
    starwarsMovies,
    lotrMovies,
    bondMovies,
    conjuringMovies,
    transformersMovies,
    fastFuriousMovies,
    dceuMovies,
    monsterverseMovies,
    apesMovies,
    wizardingWorldMovies,
    mazeRunnerMovies,
    hungerGamesMovies,
    divergentMovies,
    evilDeadMovies,
    johnWickMovies,
  };
  const outPath = path.resolve(__dirname, "../data/chronologicalMovies.ts");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  fs.writeFileSync(
    outPath,
    `import { Recommendation } from "@/types/recommendation";

export const chronologicalMovies: {
   mcuMovies: Recommendation[];
  xmenMovies: Recommendation[];
  starwarsMovies: Recommendation[];
  lotrMovies: Recommendation[];
  bondMovies: Recommendation[];
  conjuringMovies: Recommendation[];
  transformersMovies: Recommendation[];
  fastFuriousMovies: Recommendation[];
  dceuMovies: Recommendation[];
  monsterverseMovies: Recommendation[];
  apesMovies: Recommendation[];
  wizardingWorldMovies: Recommendation[];
  mazeRunnerMovies: Recommendation[];
  hungerGamesMovies: Recommendation[];
  divergentMovies: Recommendation[];
  evilDeadMovies: Recommendation[];
  johnWickMovies: Recommendation[];
} = ${JSON.stringify(output, null, 2)};
`
  );

  console.log("✅ chronologicalMovies.ts generated successfully!");
}

run().catch((err) => {
  console.error("❌ Error generating movies:", err);
});

import { chronologicalMovies } from "@/data/chronologicalMovies";
import { Recommendation } from "@/types/recommendation";

export const franchiseMap: Record<
  string,
  { name: string; movies: Recommendation[] }
> = {
  // 🦸 Superhero
  "marvel-cinematic-universe": {
    name: "Marvel Cinematic Universe",
    movies: chronologicalMovies.mcuMovies,
  },
  "dc-extended-universe": {
    name: "DC Extended Universe",
    movies: chronologicalMovies.dceuMovies,
  },
  "x-men-universe": {
    name: "X-Men Universe",
    movies: chronologicalMovies.xmenMovies,
  },

  // 🚀 Sci-Fi
  "star-wars": {
    name: "Star Wars Chronology",
    movies: chronologicalMovies.starwarsMovies,
  },
  "planet-of-the-apes": {
    name: "Planet of the Apes Chronology",
    movies: chronologicalMovies.apesMovies,
  },
  monsterverse: {
    name: "MonsterVerse Chronology",
    movies: chronologicalMovies.monsterverseMovies,
  },
  transformers: {
    name: "Transformers Chronology",
    movies: chronologicalMovies.transformersMovies,
  },
  alienverse: {
    name: "AlienVerse Chronology",
    movies: chronologicalMovies.alienverseMovies,
  },
  "maze-runner": {
    name: "Maze Runner Chronology",
    movies: chronologicalMovies.mazeRunnerMovies,
  },
  "hunger-games": {
    name: "Hunger Games Chronology",
    movies: chronologicalMovies.hungerGamesMovies,
  },
  divergent: {
    name: "Divergent Chronology",
    movies: chronologicalMovies.divergentMovies,
  },

  // 🧙 Fantasy
  "lord-of-the-rings": {
    name: "Lord of the Rings Chronology",
    movies: chronologicalMovies.lotrMovies,
  },
  "wizarding-world": {
    name: "Wizarding World Chronology",
    movies: chronologicalMovies.wizardingWorldMovies,
  },

  // 😱 Horror
  "conjuring-universe": {
    name: "Conjuring Universe Chronology",
    movies: chronologicalMovies.conjuringMovies,
  },
  "evil-dead": {
    name: "Evil Dead Chronology",
    movies: chronologicalMovies.evilDeadMovies,
  },

  // 🔫 Action / Thriller
  "fast-and-furious": {
    name: "Fast & Furious Chronology",
    movies: chronologicalMovies.fastFuriousMovies,
  },
  "john-wick": {
    name: "John Wick Chronology",
    movies: chronologicalMovies.johnWickMovies,
  },
  "james-bond": {
    name: "James Bond Chronology",
    movies: chronologicalMovies.bondMovies,
  },
};

import { chronologicalMovies } from "@/data/chronologicalMovies";
import { Recommendation } from "@/types/recommendation";

export const franchiseMap: Record<
  string,
  { name: string; movies: Recommendation[] }
> = {
  "marvel-cinematic-universe": {
    name: "Marvel Cinematic Universe",
    movies: chronologicalMovies.mcuMovies,
  },
  "x-men-universe": {
    name: "X-Men Universe",
    movies: chronologicalMovies.xmenMovies,
  },
  "star-wars": {
    name: "Star Wars Chronology",
    movies: chronologicalMovies.starwarsMovies,
  },
  "lord-of-the-rings": {
    name: "Lord of the Rings Chronology",
    movies: chronologicalMovies.lotrMovies,
  },
  "james-bond": {
    name: "James Bond Chronology",
    movies: chronologicalMovies.bondMovies,
  },
  "conjuring-universe": {
    name: "Conjuring Universe Chronology",
    movies: chronologicalMovies.conjuringMovies,
  },
  transformers: {
    name: "Transformers Chronology",
    movies: chronologicalMovies.transformersMovies,
  },
  "fast-and-furious": {
    name: "Fast & Furious Chronology",
    movies: chronologicalMovies.fastFuriousMovies,
  },
  "dc-extended-universe": {
    name: "DC Extended Universe",
    movies: chronologicalMovies.dceuMovies,
  },
  monsterverse: {
    name: "MonsterVerse Chronology",
    movies: chronologicalMovies.monsterverseMovies,
  },
  "wizarding-world": {
    name: "Wizarding World Chronology",
    movies: chronologicalMovies.wizardingWorldMovies,
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
  "evil-dead": {
    name: "Evil Dead Chronology",
    movies: chronologicalMovies.evilDeadMovies,
  },
  "john-wick": {
    name: "John Wick Chronology",
    movies: chronologicalMovies.johnWickMovies,
  },
  "planet-of-the-apes": {
    name: "Planet of the Apes Chronology",
    movies: chronologicalMovies.apesMovies,
  },
};

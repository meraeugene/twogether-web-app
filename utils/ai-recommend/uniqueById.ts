import { TMDBEnrichedResult } from "@/types/tmdb";

export const uniqueById = (arr: TMDBEnrichedResult[]) => {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

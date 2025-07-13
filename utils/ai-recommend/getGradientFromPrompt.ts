export const genreGradientMap = {
  horror: "from-black via-red-900 to-black",
  comedy: "from-yellow-300 via-pink-200 to-yellow-400",
  romance: "from-pink-400 via-red-300 to-pink-500",
  adventure: "from-green-600 via-blue-500 to-indigo-600",
  action: "from-red-600 via-orange-500 to-yellow-500",
  fantasy: "from-purple-600 via-indigo-500 to-blue-600",
  "sci-fi": "from-cyan-700 via-purple-800 to-black",
  thriller: "from-gray-700 via-black to-gray-900",
  drama: "from-gray-500 via-gray-800 to-black",
  default: "from-red-900/20 via-black/5 to-red-900/20",
} as const;

export type GradientValue =
  (typeof genreGradientMap)[keyof typeof genreGradientMap];

export function getGradientFromPrompt(prompt: string): GradientValue {
  const lower = prompt.toLowerCase();
  const keys = Object.keys(
    genreGradientMap
  ) as (keyof typeof genreGradientMap)[];
  for (const keyword of keys) {
    if (lower.includes(keyword)) {
      return genreGradientMap[keyword];
    }
  }
  return genreGradientMap.default;
}

export function formatPromptTitle(prompt: string) {
  return prompt
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, 6)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function shuffleMovies<T extends { id: number }>(movies: readonly T[], previousId?: number): T[] {
  const shuffled = [...movies];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  // A new round should not immediately repeat the trailer that just finished.
  if (shuffled.length > 1 && shuffled[0].id === previousId) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

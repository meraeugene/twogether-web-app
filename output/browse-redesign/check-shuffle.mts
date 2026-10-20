import assert from "node:assert/strict";
import { shuffleMovies } from "../../utils/shuffleMovies";

const movies = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
assert.deepEqual(shuffleMovies([]), []);
assert.deepEqual(shuffleMovies([{ id: 1 }], 1), [{ id: 1 }]);
const originalRandom = Math.random;
try {
  // Exercise every possible first pick, including the previous round's last movie.
  for (const random of [0, 0.25, 0.5, 0.75, 0.999]) {
    Math.random = () => random;
    const shuffled = shuffleMovies(movies, 4);
    assert.notEqual(shuffled[0].id, 4, "A new round never immediately repeats the last movie");
    assert.deepEqual(shuffled.map((movie) => movie.id).sort(), [1, 2, 3, 4]);
    assert.notEqual(shuffled, movies, "The original API array is preserved");
  }
  assert.deepEqual(movies.map((movie) => movie.id), [1, 2, 3, 4]);
  console.log("Shuffle checks passed: complete playlists, no immediate repeats, preserved input, empty and single-title feeds.");
} finally {
  Math.random = originalRandom;
}

import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET } from "../../app/api/tmdb/browse-shelves/route";

const originalFetch = globalThis.fetch;
const originalKey = process.env.TMDB_API_KEY;
const requests: URL[] = [];
const request = (query: string) => GET(new NextRequest(`http://localhost/api/tmdb/browse-shelves?${query}`));

try {
  delete process.env.TMDB_API_KEY;
  assert.equal((await request("category=tv")).status, 503);
  process.env.TMDB_API_KEY = "test-only-key";
  assert.equal((await request("category=constructor")).status, 400);
  assert.equal((await request("category=tv&genre=Horror")).status, 400);

  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    const genres = (url.searchParams.get("with_genres") ?? "").split(",").filter(Boolean).map(Number);
    const group = genres.reduce((sum, genre) => sum + genre, 0) || 1;
    return Response.json({ results: Array.from({ length: 20 }, (_, index) => ({
      id: group * 100 + index, title: "Movie", name: "Series", poster_path: "/poster.jpg",
      release_date: "2026-01-01", first_air_date: "2026-01-01", genre_ids: genres,
      original_language: url.searchParams.get("with_original_language") ?? "en",
    })) });
  };

  for (const category of ["movies", "tv", "anime", "kdramas"]) {
    requests.length = 0;
    const response = await request(`category=${category}`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.items.length, 6);
    assert.equal(data.shelves.length, 6);
    const allItems = [...data.items, ...data.shelves.flatMap((shelf: { items: { id: number }[] }) => shelf.items)];
    assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length);
    assert.ok(data.shelves.every((shelf: { items: unknown[] }) => shelf.items.length === 6));
    assert.ok(allItems.every((item) => item.type === (category === "movies" ? "movie" : "tv")));
    assert.ok(!JSON.stringify(data).includes("test-only-key"));
    if (category === "anime" || category === "kdramas") {
      const expectedLanguage = category === "anime" ? "ja" : "ko";
      const requiredGenre = category === "anime" ? "16" : "18";
      assert.ok(requests.every((url) => url.searchParams.get("with_original_language") === expectedLanguage));
      assert.ok(requests.every((url) => url.searchParams.get("with_genres")?.split(",").includes(requiredGenre)));
    }
  }

  requests.length = 0;
  const filtered = await (await request("category=kdramas&genre=Comedy&page=2")).json();
  assert.equal(filtered.items.length, 20, "See all returns a full page");
  assert.deepEqual(filtered.shelves, []);
  assert.equal(requests.length, 1, "Filtered pagination only fetches the selected genre");
  assert.equal(requests[0].searchParams.get("page"), "2");
  assert.equal(requests[0].searchParams.get("with_genres"), "18,35");
  assert.equal(requests[0].searchParams.get("with_original_language"), "ko");

  const successFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => String(input).includes("9648")
    ? new Response(null, { status: 503 }) : successFetch(input, init);
  const partialResponse = await request("category=tv");
  assert.equal(partialResponse.status, 200);
  const partial = await partialResponse.json();
  assert.equal(partial.shelves.find((shelf: { id: string }) => shelf.id === "mystery").unavailable, true);
  assert.ok(partial.items.length);
  assert.ok(partialResponse.headers.get("Cache-Control")?.includes("max-age=60"));

  globalThis.fetch = async () => { throw new Error("Simulated upstream failure"); };
  assert.equal((await request("category=anime")).status, 502);
  console.log("Category shelf checks passed: separate genres, Korean/Japanese filters, unique titles, correct media types, See all pagination, invalid inputs, independent row failures.");
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.TMDB_API_KEY;
  else process.env.TMDB_API_KEY = originalKey;
}

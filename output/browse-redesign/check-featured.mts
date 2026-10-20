import assert from "node:assert/strict";
import { GET } from "../../app/api/tmdb/featured/route";
import { BROWSE_GENRE_SHELVES } from "../../constants/browseShelves";
import { TMDB_GENRE_MAP } from "../../constants/tmdbGenres";

const originalFetch = globalThis.fetch;
const originalKey = process.env.TMDB_API_KEY;
const ids = [157336, 27205, 155, 496243, 129, 120467];

try {
  delete process.env.TMDB_API_KEY;
  assert.equal((await GET()).status, 503, "Missing credentials return a service error");

  process.env.TMDB_API_KEY = "test-only-key";
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    const summary = (id: number, release_date = new Date().toISOString().slice(0, 10)) => ({
      id, title: `Film ${id}`, release_date, backdrop_path: "/backdrop.jpg", poster_path: "/poster.jpg",
    });
    if (url.pathname.endsWith("trending/movie/day")) {
      return Response.json({ results: [summary(201), summary(202), summary(999, "1999-01-01"), { ...summary(998), adult: true }] });
    }
    if (url.pathname.endsWith("movie/now_playing")) {
      return Response.json({ results: [summary(203), summary(201)] });
    }
    if (url.pathname.endsWith("discover/movie")) {
      const genre = Number(url.searchParams.get("with_genres"));
      assert.equal(url.searchParams.get("include_adult"), "false");
      return Response.json({ results: [summary(157336), summary(901), ...Array.from({ length: 12 }, (_, index) => ({
        ...summary(genre * 10000 + index), genre_ids: [genre],
      }))] });
    }
    assert.equal(url.searchParams.get("append_to_response"), "videos,images");
    const id = Number(url.pathname.split("/").at(-1));
    return Response.json({
      id, title: `Film ${id}`, poster_path: "/poster.jpg", backdrop_path: "/backdrop.jpg",
      release_date: "2014-11-05", genres: [{ name: "Science Fiction" }],
      images: { logos: [{ file_path: "/logo.png", iso_639_1: "en" }] },
      videos: { results: id === 202 ? [] : [
        { key: "unofficial", site: "YouTube", type: "Trailer" },
        { key: "older-official", site: "YouTube", type: "Trailer", official: true, published_at: "2025-01-01" },
        { key: "official", site: "YouTube", type: "Trailer", official: true, published_at: "2026-01-01" },
      ] },
    });
  };
  const response = await GET();
  const complete = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(complete.items.map((item: { id: number }) => item.id), ids);
  assert.equal(complete.hero.id, 201, "The hero comes from the current trending feed");
  assert.deepEqual(complete.heroes.map((item: { id: number }) => item.id), [201, 203], "Hero candidates are recent, unique, non-adult, and have trailers");
  assert.equal(complete.hero.trailer_key, "official", "The newest official trailer takes priority");
  assert.equal(complete.hero.logo_url, "https://image.tmdb.org/t/p/w500/logo.png");
  assert.equal(complete.hero.backdrop_url, "https://image.tmdb.org/t/p/original/backdrop.jpg");
  assert.ok(!JSON.stringify(complete).includes("test-only-key"), "Credentials never reach clients");
  assert.equal(complete.shelves.length, BROWSE_GENRE_SHELVES.length);
  const allIds = [...complete.items, ...complete.shelves.flatMap((shelf: { items: { id: number }[] }) => shelf.items)].map((item: { id: number }) => item.id);
  assert.equal(new Set(allIds).size, allIds.length, "Titles do not repeat across shelves");
  for (const shelf of complete.shelves) {
    assert.equal(shelf.items.length, 6);
    assert.ok(shelf.items.every((item: { poster_url: string }) => item.poster_url));
  }
  assert.ok(complete.shelves[0].items.some((item: { genre_ids?: number[] }) => item.genre_ids?.includes(TMDB_GENRE_MAP.Action)));

  const successFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => String(input).includes("/157336?")
    ? new Response(null, { status: 503 }) : successFetch(input, init);
  const partialResponse = await GET();
  const partial = await partialResponse.json();
  assert.equal(partial.items.length, 5, "One failed movie does not break the shelf");
  assert.equal(partial.hero.id, 201, "A failed classic does not affect the current hero");
  assert.ok(partialResponse.headers.get("Cache-Control")?.includes("max-age=60"));

  globalThis.fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    return path.endsWith("trending/movie/day") || path.endsWith("movie/now_playing")
      ? new Response(null, { status: 503 }) : successFetch(input, init);
  };
  const failedFeeds = await (await GET()).json();
  assert.deepEqual(failedFeeds.heroes, []);
  assert.equal(failedFeeds.hero, null, "Old classics are not used as current-trailer fallbacks");
  assert.equal(failedFeeds.items.length, 6, "The shelf still loads when hero feeds fail");

  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    return url.pathname.endsWith("discover/movie") && url.searchParams.get("with_genres") === "27"
      ? new Response(null, { status: 503 }) : successFetch(input, init);
  };
  const failedGenre = await (await GET()).json();
  assert.equal(failedGenre.shelves.find((shelf: { id: string }) => shelf.id === "horror").unavailable, true);
  assert.ok(failedGenre.shelves.filter((shelf: { id: string }) => shelf.id !== "horror").every((shelf: { items: unknown[] }) => shelf.items.length === 6));

  globalThis.fetch = async () => { throw new Error("Simulated network failure"); };
  assert.equal((await GET()).status, 502, "Total upstream failure returns a retryable error");
  console.log("Featured API checks passed: credentials, current heroes, latest official trailers, duplicate filtering, six genre shelves, isolated feed/genre failures, total failure.");
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.TMDB_API_KEY;
  else process.env.TMDB_API_KEY = originalKey;
}

import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET } from "../../app/api/tmdb/search/suggestions/route";
import { cachedSuggestions, loadSearchSuggestions, suggestionHref } from "../../utils/searchAutocomplete";
import { searchArtistFilmographyTMDB } from "../../utils/tmdb/search/searchArtistFilmographyTMDB";

const originalFetch = globalThis.fetch;
const originalKey = process.env.TMDB_API_KEY;
const request = (query: string, kind = "all") => GET(new NextRequest(`http://localhost/api/tmdb/search/suggestions?${new URLSearchParams({ query, kind })}`));

try {
  delete process.env.TMDB_API_KEY;
  assert.equal((await request("Tom Hanks")).status, 503);
  assert.equal((await request("T")).status, 200);
  assert.equal((await request("Tom", "unknown")).status, 400);
  process.env.TMDB_API_KEY = "test-only-key";
  let personEndpoint = false;
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get("include_adult"), "false");
    personEndpoint = url.pathname.endsWith("/search/person");
    return Response.json({ results: personEndpoint ? [
      { id: 31, name: "Tom Hanks", profile_path: "/tom.jpg", known_for_department: "Acting" },
    ] : [
      { id: 1, title: "A film about Tom Hanks", media_type: "movie", popularity: 1000 },
      { id: 31, name: "Tom Hanks", media_type: "person", popularity: 10, profile_path: "/tom.jpg", known_for_department: "Acting" },
      { id: 2, name: "Tom Hanks series", media_type: "tv", popularity: 20 },
      { id: 3, name: "Tom Hanks", media_type: "person", adult: true, popularity: 9999 },
    ] });
  };
  const all = await (await request("Tom Hanks")).json();
  assert.equal(all.results[0].id, 31, "Exact artist matches outrank loosely related popular films");
  assert.ok(!all.results.some((item: { id: number }) => item.id === 3));
  assert.equal(all.results[0].subtitle, "Actor/Actress");
  assert.ok(all.results[0].image_url.endsWith("/tom.jpg"));
  const artists = await (await request("Tom Hanks", "artists")).json();
  assert.equal(personEndpoint, true);
  assert.ok(artists.results.every((item: { category: string }) => item.category === "person"));
  const titles = await (await request("Tom Hanks", "titles")).json();
  assert.ok(titles.results.every((item: { category: string }) => item.category !== "person"));
  assert.ok(!JSON.stringify(all).includes("test-only-key"));
  const originalCacheFetch = globalThis.fetch;
  let repeatedSearchCalls = 0;
  globalThis.fetch = async (input, init) => { repeatedSearchCalls += 1; return originalCacheFetch(input, init); };
  await request("Tom Hanks", "all");
  assert.equal(repeatedSearchCalls, 0, "Repeated server queries return from memory without upstream work");

  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ results: artists.results });
  };
  const signal = new AbortController().signal;
  await loadSearchSuggestions("Tom Hanks", "artists", signal);
  await loadSearchSuggestions("  TOM   HANKS ", "artists", signal);
  assert.equal(calls, 1, "Repeated normalized searches use the local cache");
  assert.equal(cachedSuggestions("tom hanks", "artists")?.[0].id, 31);
  assert.equal(cachedSuggestions("tom hanks", "titles"), undefined, "Search modes have separate caches");
  assert.equal(suggestionHref(artists.results[0]), "/search/Tom%20Hanks?artist=31");
  assert.equal(suggestionHref({ id: 157336, label: "Interstellar", category: "movie" }), "/tmdb/watch/movie/157336/interstellar");

  const cancelled = new AbortController();
  globalThis.fetch = async () => { cancelled.abort(); return Response.json({ results: [] }); };
  await assert.rejects(loadSearchSuggestions("Cancelled name", "artists", cancelled.signal), { name: "AbortError" });
  assert.equal(cachedSuggestions("Cancelled name", "artists"), undefined, "Cancelled searches cannot pollute the cache");

  globalThis.fetch = async () => new Response(null, { status: 503 });
  assert.equal((await request("Unknown person")).status, 502, "Transient upstream failures are not cached as empty success");

  const artistRequests: string[] = [];
  globalThis.fetch = async (input) => {
    const path = new URL(String(input)).pathname;
    artistRequests.push(path);
    return Response.json({ id: 31, name: "Tom Hanks", known_for_department: "Acting", movie_credits: { cast: [
      { id: 13, title: "Forrest Gump", poster_path: "/gump.jpg", overview: "A story.", popularity: 100 },
    ], crew: [] } });
  };
  const selectedArtist = await searchArtistFilmographyTMDB("Tom Hanks", 31);
  assert.equal(selectedArtist.artist?.id, 31);
  assert.deepEqual(artistRequests, ["/3/person/31"], "A selected artist skips both name search and unrelated title queries");
  assert.equal(selectedArtist.movies[0].id, 13);
  assert.ok(selectedArtist.movies[0].poster_url?.endsWith("/gump.jpg"));
  assert.equal(artistRequests.length, 1, "Filmography posters do not trigger bulk movie enrichment");
  console.log("Search checks passed: artist/title filters, exact-match ranking, artist metadata, local cache, cancellation, direct artist links, transient failures, one-request selected artist lookup.");
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.TMDB_API_KEY;
  else process.env.TMDB_API_KEY = originalKey;
}

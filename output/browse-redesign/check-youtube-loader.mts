import assert from "node:assert/strict";
import { loadYouTubeIframeApi } from "../../utils/youtubeIframeApi";

class Script extends EventTarget {
  src = "";
  async = false;
  removed = false;
  remove() { this.removed = true; }
}

const scripts: Script[] = [];
const timers = new Map<number, () => void>();
let timerId = 0;
let otherPlayerReadyCalls = 0;
const otherPlayerReady = () => { otherPlayerReadyCalls += 1; };
const browser = {
  YT: undefined as { Player: object } | undefined,
  onYouTubeIframeAPIReady: otherPlayerReady as (() => void) | undefined,
  setTimeout: (callback: () => void) => { timers.set(++timerId, callback); return timerId; },
  clearTimeout: (id: number) => { timers.delete(id); },
};

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
Object.defineProperty(globalThis, "document", { configurable: true, value: {
  querySelector: () => scripts.find((script) => !script.removed) ?? null,
  createElement: () => new Script(),
  head: { appendChild: (script: Script) => scripts.push(script) },
} });

try {
  const blockedScript = loadYouTubeIframeApi();
  scripts.at(-1)!.dispatchEvent(new Event("error"));
  await assert.rejects(blockedScript, /could not load/);
  assert.equal(scripts.at(-1)!.removed, true, "Failed scripts can be retried");
  assert.equal(browser.onYouTubeIframeAPIReady, otherPlayerReady, "Other players keep their readiness callback");

  const stalledScript = loadYouTubeIframeApi();
  timers.values().next().value!();
  await assert.rejects(stalledScript, /could not load/);
  assert.equal(timers.size, 0, "Timeout callbacks are cleaned up");

  const firstMount = loadYouTubeIframeApi();
  const secondMount = loadYouTubeIframeApi();
  assert.equal(firstMount, secondMount, "Concurrent mounts share one API load");
  assert.equal(scripts.filter((script) => !script.removed).length, 1);
  browser.YT = { Player: class {} };
  browser.onYouTubeIframeAPIReady!();
  assert.equal(await firstMount, browser.YT);
  assert.equal(await secondMount, browser.YT);
  assert.equal(otherPlayerReadyCalls, 1, "Existing player initialization still runs");
  assert.equal(await loadYouTubeIframeApi(), browser.YT, "Navigation reuses an available API");
  assert.equal(timers.size, 0);
  console.log("YouTube loader checks passed: blocked script, timeout, retry, concurrent mounting, existing player compatibility, navigation reuse.");
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}

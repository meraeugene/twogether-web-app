# Mobile layout verification

## Animated header, trailer playback, and full-height sidebar

The mobile drawer now expands and collapses over 240ms, fades its backdrop, and crossfades the burger/close icons. The closing drawer stays mounted for its exit transition; closed links are inert and hidden from accessibility navigation. Escape and backdrop dismissal restore focus to the burger. Reduced-motion preferences disable these transitions.

Film-card previews now initialize a controlled YouTube player with muted inline autoplay, an Unmute button, a manual Play trailer fallback, and bounded loading/error states. The player script warms on the preview tap alongside any missing movie details. Closing the preview destroys the iframe and restores scrolling/focus. This replaces the sound-on, noninteractive iframe. See the [YouTube event reference](https://developers.google.com/youtube/iframe_api_reference#onAutoplayBlocked) and [Chrome autoplay guidance](https://developer.chrome.com/blog/autoplay).

The desktop sidebar fills the viewport from top to bottom with zero corner radius, a translucent tint, one glass blur, and a subtle right divider. Removed the inset black capsule, its shadow, and rounded hover backgrounds.

Verified the menu at 320px and 390px, its opening/closing transitions, Escape/backdrop focus restoration, and the 900px-tall desktop sidebar at 1440px. In the real Interstellar preview, the video progressed from 31 to 45 seconds while switching from muted to audible playback, and continued beyond 90 seconds after muting again. Closing/reopening removed the old iframe and restarted playback. An Inception embed did not initialize in this browser session and reached the unavailable fallback; playback for that clip was not verified. TypeScript and ESLint pass.

Current screenshots: `animated-header-phone.jpg`, `trailer-autoplay-phone.jpg`, and `full-height-glass-sidebar.jpg`.

## Watch-page header clearance

Added a 24px gap below the floating header for watch pages below 1280px. The shared rule also applies to their loading skeletons. Removed the redundant phone-only override. At 390px and 1024px, the player starts at 106px and clears the header by approximately 24px. Desktop keeps its existing 32px page padding. The 390px page has no horizontal overflow. Screenshot: `watch-header-clearance-phone.jpg`.

## Profile loading, floating header, and larger Chrono cards

Scoped the edit-profile Suspense fallback to the editor page and removed its parent route loader, so it no longer wraps the public profile's own loading boundary. Profile content now renders independently of the client-side friend-status request; the friend button stays disabled while that request loads.

Restored the original floating capsule header and red/white Twogether wordmark with icon-only search and burger controls. The header uses one 12px blur surface with no animated layout or filter transitions. Its safe-area-aware clearance is shared by pages, players, and skeletons.

Chrono cards now measure about 320px at a 390px phone viewport, with 24px connectors instead of the former 112px effective gap. At 1440px, cards are 340px wide with 32px connectors and a 64px stagger. The skeleton shares the same card and connector CSS. Automatic movement is slower and pauses on touch or keyboard focus.

Verified 320px and 390px phone layouts and the 1440px desktop layout without horizontal page overflow. Checked menu focus restoration, Escape dismissal, full-screen search at 320 x 740, and keyboard scrolling in Chrono. Rendered the actual Chrono and profile loading components through a temporary development-only preview: Chrono card widths/connector gaps match the loaded UI, and the profile preview renders one loading page. Removed the preview route afterward. The real profile route redirects to sign-in/home in the unauthenticated local session, so authenticated profile navigation was not exercised. TypeScript and ESLint pass for the changed source files.

Current screenshot: `chrono-larger-cards-phone.jpg`.

## Original red-and-black palette restored

Restored the exact `--page-gradient` from commit `360a814`, the original black/white base colors, and matching red ambient overlays. Returned the glass styling to the darker pre-boost finish. Header/menu surfaces, search backgrounds, poster fallbacks, and the browser theme color use neutral black with red accents instead of the later blue/purple tints and bright fills.

Verified the gradient matches the original source exactly, the 390px collection page has no horizontal overflow, and the search dialog retains its full viewport height with the dark red/black background. Browser theme color is `#0a0a0a`. Current screenshot: `restored-red-black-phone.jpg`.

## Stronger Apple-inspired frosted material

Increased glass translucency by reducing the shared dark tint from 78% to 38%, increasing surface blur from 18px to 32px, and increasing backdrop saturation. Layered highlights, brighter upper edges, inset reflections, and softer elevation shadows make the material visible over both artwork and dark backgrounds. Header and search controls now use capsule shapes. Search uses a more transparent full-screen backdrop, with brighter secondary labels for readability.

The shared material applies to existing cards, controls, fields, header/menu surfaces, desktop navigation, and browse controls. Posters remain sharp, and page structure, watch clearance, and navigation behavior are unchanged. Solid material fallbacks are included for browsers without backdrop-filter support.

Browser verification: the 390px collection page has no horizontal overflow and computes `blur(32px) saturate(1.7)` on glass surfaces. The menu remains readable over artwork and closes with Escape. Full-screen search fits at 320 x 740 and 1440 x 900 without horizontal overflow, returns suggestions, and highlights the correct result with Arrow Down. This revision changes styles only; no JavaScript or layout logic changed.

Current screenshots: `frosted-glass-phone.jpg`, `frosted-search-phone.jpg`, and `frosted-search-desktop.jpg`.

## Glass finish, immersive watch pages, and discovery search

The latest revision uses shared glass surfaces, soft ambient backgrounds, quieter borders, and glossy controls across page layouts, collection/Chrono/friend/profile cards, message panels, forms, modal sheets, and their skeletons. Posters use lightweight shadows rather than backdrop blur. Movie credits and the Chrono timeline remain unboxed.

The mobile/tablet header now has a wordmark, search, and a labeled Menu button. Its drawer contains icons and text for destinations. Watch-page back buttons and their skeleton placeholders are hidden below 1280px; the player begins directly below the 64px mobile header.

Search is a native full-screen dialog on mobile and desktop. The initial view includes live TMDB spotlight posters and category links. Artist mode offers starter names. The latest six searches are stored locally on the device and can be cleared. Existing keyboard autocomplete, category filters, and title/artist routing remain in use.

Verification:

- At 390px the watch back button is hidden, the player begins at 64px, and it spans the full content width. At 320px the header and watch page do not overflow horizontally.
- Search covers the full 320 × 740 and 1440 × 900 viewports without horizontal overflow. The initial view renders real spotlight titles and four category links.
- Typing Interstellar, pressing Arrow Down, and pressing Enter opened `/tmdb/watch/movie/157336/interstellar`. Reopening search displayed the recent-search chip; clearing recent searches removed it.
- Selecting the Christopher Nolan artist prompt populated artist search and returned artist suggestions. Closing search and opening/closing the mobile menu retained working focus and keyboard behavior.
- The collection page uses the shared glass surfaces, retains its full-width mobile artwork and open edges, and does not overflow at phone width.
- TypeScript passed. ESLint passed with the two existing image-optimization warnings on the TMDB watch page. Authenticated actions and third-party video playback were not part of these layout checks.

Current previews: `premium-search-phone.jpg`, `premium-search-desktop.jpg`, `premium-watch-phone.jpg`, and `premium-binge-phone.jpg`.

## Simple mobile header

The latest header follows the desktop sidebar: the same `t.` mark, shared Lucide destination icons, muted gray controls, and coral active state. A compact full-width row contains destination shortcuts, search, and a menu for the remaining navigation and account actions. Safe-area and page clearance values are shared with the loading layouts. The desktop sidebar keeps its existing appearance.

Removed the homepage's floating feedback launcher. The regular feedback form remains available on the homepage.

Verified the header fits at 320px and 390px without horizontal page overflow, uses 44px touch controls, opens and closes search, navigates from its menu, closes on Escape with focus returned to the menu button, and restores background scrolling. At 1440px the mobile header is hidden and the desktop sidebar remains visible. The homepage has no feedback launcher and still renders its feedback form. Screenshot: `simple-mobile-header.jpg`.

The sections below describe earlier revisions and their verification history.

Implemented shared 16px, safe-area-aware mobile gutters; full-width 16:9 watch players; unboxed movie credits; compact poster grids; full-screen search and AI chat; mobile action sheets; full-width collection/profile/friend/chat surfaces; and horizontally scrolling server, season, and collection-genre controls.

## Header, Chrono, and loading corrections

- Restored `components/Navbar.tsx` byte for byte from the commit before the mobile redesign. Removed its mobile CSS overrides and restored clearance for the original floating header.
- Removed Chrono's enclosing card, border, background, shadow, and additional padding. Its story cards and journey controls remain in place.
- Added page-specific loading routes for browse categories, collections, search, TMDB watch details, watchlist, recommendations, profiles, and Chrono. Replaced existing generic spinner pages for friends, chats, profile editing, and recommendation forms.
- Matched poster grids, title/metadata spacing, mobile player dimensions, unboxed credits, cast rails, friend cards, and chat lists to their loaded UI. Collections and discovery heroes now use matching inline placeholders too.
- Checked 12 skeleton page types at a 390px phone viewport, representative layouts at 320px, and desktop grids/panels at 1440px. Recorded measurements in `loading-layout-checks.json`: no horizontal overflow or rendering errors in the recorded cases.
- Used a temporary development-only preview route to render the real loading components without authenticating. Removed that route after verification. This checks loading component layout, not authenticated actions.
- The loaded movie player and its skeleton both begin at 168px on mobile and span the content width. The restored header and live Chrono page were also visually checked.

Current screenshots: `chrono-unboxed-phone.jpg`, `watch-restored-header-phone.jpg`, and `watchlist-skeleton-phone.jpg`. The original three screenshots below predate the header correction.

## Initial mobile checks

Browser checks against the local development server with live TMDB data:

- Movie watch page at 390 × 844: header and player reach both content edges, details have no card padding or corner radius, and there is no horizontal page overflow.
- Browse at 320 × 740: poster grid and category controls remain usable; no horizontal page overflow after removing the body's minimum width.
- Binge at 390 × 844: genre controls occupy a single 48px swipeable row and collection artwork spans the content width; no horizontal page overflow.
- TV watch page at 430 × 932: the player spans the content width, seasons scroll within their own row, and selecting Season 2 updates episode names and the iframe URL to season 2.
- TV watch page at 1440 × 900: desktop sidebar and inset player remain present; no horizontal page overflow.
- Mobile search opens as a full-screen native dialog. The mobile menu opens, reports its expanded state, and locks background scrolling.

TypeScript passed. ESLint across changed TypeScript/TSX files passed with the existing two `no-img-element` warnings on the TMDB watch page. No production build was run.

Signed-in-only pages received shared spacing/component changes and source review; they were not exercised in the local browser because it has no authenticated session. Third-party video playback is outside these layout checks; TV source selection was checked through the rendered iframe URL.

Screenshots: `watch-phone.jpg`, `watch-details-phone.jpg`, and `binge-phone.jpg`.

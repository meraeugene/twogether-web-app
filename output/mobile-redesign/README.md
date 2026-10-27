# Mobile layout verification

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

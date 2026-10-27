# Mobile layout verification

Implemented shared 16px, safe-area-aware mobile gutters; a 56px full-width header; full-width 16:9 watch players; unboxed movie credits; compact poster grids; full-screen search and AI chat; mobile action sheets; full-width collection/profile/friend/chat surfaces; and horizontally scrolling server, season, and collection-genre controls.

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

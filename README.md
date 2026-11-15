# make.fun

A small static frontend for browsing live make.fun bounties, their standings, and creator profiles. It uses plain HTML, CSS, and JavaScript modules with no build step.

Serve the `app/` directory as the static site root with any static server. The app calls the public `https://make.fun/api` endpoints directly.

Routes:

- `#/` — bounty board
- `#/bounty/<slug>` — bounty details and rewards
- `#/bounty/<slug>/leaderboard` — standings
- `#/profile/<handle>` — creator profile

The API client reuses responses in memory, validates with ETags, and treats entries younger than 45 seconds as fresh. Leaderboard and profile views load only when opened. The initial shell stays small, with no framework, external fonts, or third-party resources.

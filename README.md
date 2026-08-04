# roscard_hardened

Self-maintained fork of [yyqclhy/RosCard](https://github.com/yyqclhy/RosCard) — the Lovelace custom card bundle for the Sanytron Astrion smart remote.

**Why this fork exists:** supply-chain control. The upstream bundle was source-reviewed and is clean (no external network calls, no eval, no obfuscation beyond minification), but it is maintained by a single pseudonymous author and auto-updates via HACS. This repo pins updates to a repo under our control; upstream changes are pulled only after review.

**Audited baseline:** upstream v1.4.1, commit `a1fe068`. `dist/RosCard.js` sha256:
`0f92e5ba7731f93c2c2ea102be9c13207249b95acf9a8fe0b4c07010141bea50`

## Cards

11 card types, each with a config editor (22 custom elements): TV, media player, light, climate, cover, fan, switch, switch-monitor, scene, weather, host.

## Install (HACS custom repository)

1. HACS → Custom repositories → add this repo, category **Dashboard**
2. Install "RosCard", reload resources

## Build

```
npm install
npm run build   # src/RosCard.js -> dist/RosCard.js (minified)
```

`src/RosCard.js` is the beautified upstream bundle (generated deterministically from the audited dist via `npm run bootstrap`, js-beautify 2.0.3). `dist/` is what HACS serves.

## License

MIT — original copyright (c) 2026 Sanytron. See LICENSE.

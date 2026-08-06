# Changelog

Entries from 1.0.0 onward are for **roscard_hardened**, the DigiSpark-maintained
fork. Earlier entries are upstream's, retained for provenance.

The format is based on Keep a Changelog and Semantic Versioning.

---

## [1.1.0] - 2026-08-06

First **feature** divergence from upstream. Everything before this was security
hardening; this is new capability we alone maintain, and it makes any future
upstream merge harder. Recorded here deliberately.

### Added
- **Sonos zone grouping in `aiks-media-player-card`.** A new optional per-entity
  `zones` list renders a chip per room beneath the transport controls. Clicking
  an unjoined room calls `media_player.join` targeting the primary with the room
  in `group_members`; clicking a joined room calls `media_player.unjoin`
  targeting *that room*, not the primary. Join state is read from the primary's
  `group_members` attribute, so the chips reflect reality rather than local
  state.

  ```yaml
  type: custom:aiks-media-player-card
  entities:
    - entity_id: media_player.great_room
      zones:
        - media_player.kitchen
        - media_player.living_room
  ```

  Omitting `zones` changes nothing — no chips render and behaviour is identical
  to 1.0.1.

- `test/zones.test.js` — 12 assertions covering join and unjoin payloads, chip
  state derived from `group_members`, unknown entities skipped, the primary
  never offered as its own zone, and hostile zone names staying inert. Wired
  into CI with a negative control: the suite must fail against any bundle
  lacking the feature. The runner exits `2` on a missing bundle so a vanished
  input can never be mistaken for a pass.

### Security
- **Editor image previews no longer load off-origin images.** 1.0.0 locked the
  *render* path to local paths and 1.0.1/1.0.0 aligned the editor *validator*,
  but the editor's preview setters still resolved `http(s)` URLs directly. A
  config that already carried an external URL — a legacy dashboard, or
  hand-edited YAML — would fire a request to that third-party host as soon as
  the card editor was opened. Same leak the render guard closed (public IP,
  User-Agent, timing), on a path we had not covered.

  The guard now lives **inside** the preview setters and the initial-preview
  assignments, so it no longer depends on the blur validator running first. All
  four `startsWith("http…")` acceptances are gone from `src/`; render,
  validation and preview now enforce one identical rule.

  This is the disposition of the two standing CodeQL `js/xss-through-dom` alerts
  at the editor preview sinks. Not XSS — the source is the admin's own input and
  `<img src>` will not execute `javascript:` — but the alerts correctly pointed
  at code that accepted external URLs and wrote them into `_config`. Fixed
  rather than dismissed, because the previous safety depended on a caller
  honouring an invariant that nothing local enforced.

- `test/editor-preview.test.js` — 6 assertions, including the legacy-config case
  (external URL already present in config when the editor opens). Fails against
  1.1.0 and upstream; wired into the CI negative control.

### Notes
- The media player card had no source, grouping, or `play_media` support of any
  kind before this — verified by inspection, not assumption.
- Zone chips are built with `createElement` + `textContent`; no dynamic value
  reaches an HTML parser, so the Semgrep DOM-XSS ratchet is unchanged.
- Known gap: `test/harness.js` lacks the "missing bundle exits 2" guard that the
  other two suites have, so a vanished input there would look like a normal
  failure. Unreachable in CI because the upstream bundle is sha-verified before
  use; worth folding in next time that file changes.

---

## [1.0.1] - 2026-08-04

### Fixed
- **Every card icon 404'd after install.** The bundle hardcodes asset paths as
  `/local/community/RosCard/icon_img/…`, but HACS serves assets from a directory
  named after *this* repository — `roscard_hardened`. Renaming the fork broke all
  13 references. Rewritten to match the repo. This was our regression, introduced
  by the fork itself, not an upstream defect.
- **`defaultIconPath` pointed at an asset that has never existed.** Upstream
  references `icon_img/states_device_light_on_icon.png`, which is not in its
  `dist/`. Any card without an explicit `icon_path` fell back to it and rendered
  a broken image. Repointed to `icon_light.png`. This one *is* an upstream bug,
  present since before the fork.
- `_createIcon` now hides the `<img>` on load error, so a missing or mistyped
  asset degrades to no icon instead of a broken-image glyph.

### Added
- **Asset-reference integrity gate** in CI: fails if the baked-in asset folder
  stops matching the repository name, or if any referenced `icon_img/*` file is
  absent from `dist/`. Both bugs above would have been caught at PR time. The
  headless suite could not catch either — jsdom never fetches images.

---

## [1.0.0] - 2026-08-04

First release of the hardened fork. Functionally at parity with upstream
**v1.4.1** (`a1fe068`) except for the three deliberate divergences below.

### Security
- **DOM-XSS**: the four sinks that interpolated Home Assistant entity data into
  `innerHTML` now build DOM with `createElement` + `textContent`. Entity names
  are attacker-influenceable (a LAN device, Zigbee join or media title can carry
  chosen text), so this closes a real stored-XSS path. Verified: hostile
  `friendly_name` injects on upstream, is inert here.
- **External image loading**: `background_path`, `image_path` and `icon_path`
  are restricted at render time to local Home Assistant paths (`/…`).
  Protocol-relative (`//host`), backslash, absolute `http(s)`, `javascript:` and
  `data:` values are rejected. Previously any dashboard render fired a request to
  a third-party host, leaking the household's public IP, User-Agent and viewing
  times. URLs are additionally percent-encoded for `'"()\`.
- **Editor validation** now applies the same rule as the render path, so the
  preview and its "Valid Link" confirmation can no longer report success for a
  value the card will refuse to render.

### Changed
- Image path fields advertise `Enter local image path (/local/...)` instead of
  `Enter image URL (http/https)`. **Externally-hosted card images will stop
  loading** and fall back to the default icon; `/local/…` and uploaded
  `/api/image/serve/…` paths are unaffected.

### Added — supply chain and verification
- `src/` is the reviewable source; `dist/` is built by a pinned esbuild
  pipeline and CI **byte-compares the shipped bundle against a rebuild of
  `src/`**, so the artifact cannot diverge from the reviewed source.
- Integrity-pinned `package-lock.json` with `npm ci --ignore-scripts` — no
  third-party install-time code executes in CI.
- Gates: Semgrep (custom DOM-XSS/eval/token/external-fetch rules with a sink
  ratchet), CodeQL `security-extended`, gitleaks over full history, actionlint,
  dependency audit. All GitHub Actions pinned by commit SHA.
- Headless card test suite against real Home Assistant entity fixtures, with a
  **negative control**: CI requires the suite to fail against the unhardened
  upstream bundle.

### Known limitations
- `aiks-cover-card` is untested — no `cover` entities were available.
- Not yet validated on Astrion hardware: button-to-keycode mapping, launcher
  card-name expectations, long-press timing, on-device layout.

---

## [1.1.2.1] - 2026-04
### Fixed
- Fixed scene execution failure issue.

---

## [1.1.2] - 2026-03
### Security
- Added support for importing self-signed certificates.
- WebSocket TLS authentication enabled.

### Fixed
- Home Assistant voice control not working under HTTPS.

---

## [1.1.1] - 2026-02
### Added
- Script binding support for TV card.
- Scene card renamed to Scene & Script.
- Dropdown improvements.

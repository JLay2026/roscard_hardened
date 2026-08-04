# Changelog

Entries from 1.0.0 onward are for **roscard_hardened**, the DigiSpark-maintained
fork. Earlier entries are upstream's, retained for provenance.

The format is based on Keep a Changelog and Semantic Versioning.

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
- Headless card test suite (47 assertions) against real Home Assistant entity
  fixtures, with a **negative control**: CI requires the suite to fail against
  the unhardened upstream bundle.

### Known limitations
- `aiks-cover-card` is untested — no `cover` entities were available.
- Not yet validated on Astrion hardware: button-to-keycode mapping, launcher
  card-name expectations, long-press timing, on-device layout.
- Upstream references `icon_img/states_device_light_on_icon.png`, which is not
  present in `dist/icon_img/`. Pre-existing; not introduced here.

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

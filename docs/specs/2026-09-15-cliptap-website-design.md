# ClipTap Website Design

Date: 2026-09-15
Status: Approved by founder

## Goal

Awesome-looking open-source site for ClipTap so others can discover, download, and use it. Better than SnapTap. Deployed via GitHub Pages, nothing else uploaded.

## Decisions

- Purpose: docs + download site (landing + install guide, usage, FAQ).
- Hosting: GitHub Pages, served from `/docs` folder in this same repo. Free, auto-deploys, stays 100% open source.
- Style: match ClipTap's dark glass app UI (Apple minimalism, frosted glass, blue accent).

## Architecture

Single static page: `docs/index.html` (+ `docs/styles.css`, optional `docs/script.js` for smooth scroll / mobile nav). Vanilla HTML/CSS/JS, zero build step, zero dependencies, zero external network requests (matches app's privacy story).

## Sections

1. Sticky nav: logo (reuse `assets/icon.png`), links to Features / Install / Usage / FAQ, GitHub button, Download button.
2. Hero: app name, tagline from README, Download + View on GitHub buttons, CSS-built glass panel mock (no screenshots needed).
3. Features grid: 6 cards from README (automatic history, text + images, instant search, pins, one-click copy-back, floating button / tray / shortcut).
4. Download: Installer + Portable cards linking to `https://github.com/0x-Shadow/ClipTap/releases`.
5. Install: 3 steps (download, run, press Ctrl+Shift+V).
6. Usage: shortcut table (Ctrl+Shift+V, /, Esc, click-to-copy, pin, delete).
7. FAQ (5 items): Is it free/open source, Windows only, where clips live, privacy/telemetry, log file location.
8. Footer: MIT license, GitHub link, log path note.

## Design tokens

Copied from `renderer/styles.css`: background dark `#16161a` with blur/saturate, `--blue #2997ff`, rounded 20px cards, same font stack (`-apple-system, Segoe UI, Roboto...`). Responsive: grid collapses to single column on mobile. `prefers-reduced-motion` disables animations.

## Data flow

None. Static page. Download buttons are plain links to Releases. No forms, no backend, no telemetry.

## Error handling

All links relative-safe for `/docs` serving (`./styles.css`, `../assets/icon.png`). If assets missing, logo falls back to text. Page works with JS disabled (script only enhances smooth scroll).

## Testing

Manual: open `docs/index.html` locally, check all anchors, responsive width 360px and 1280px, no console errors, no external requests in devtools network tab.

## Scope

In scope: `docs/index.html`, `docs/styles.css`, tiny `docs/script.js` only if needed.
Out of scope: web version of ClipTap, custom domain, analytics, framework builds, changes to Electron app.

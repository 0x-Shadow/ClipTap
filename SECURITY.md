# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Do not open a public issue for security reports.**

Open a [private security advisory](https://github.com/0x-Shadow/ClipTap/security/advisories/new)
or contact the maintainer through the email listed on the
[GitHub profile](https://github.com/0x-Shadow).

Include the affected version, steps to reproduce, and impact assessment.
Expect an initial response within 7 days.

## Security Architecture

- **Sandboxed renderers** — `sandbox: true`, `nodeIntegration: false`,
  `contextIsolation: true` on every window. No direct Node.js, filesystem,
  or Electron access from UI code.
- **Minimal preload bridge** — small `contextBridge` API; numeric clip IDs
  validated as integers, image filenames whitelisted to `img-<digits>.png`
  and resolve-contained to the app data folder.
- **Strict CSP** — `default-src 'self' data:; script-src 'self'` everywhere.
- **XSS-safe rendering** — clip text is escaped before DOM insertion.
- **Fully offline** — zero network requests, no auto-updater, no telemetry.

## Privacy

- Clips live only in the OS app-data folder on the user's machine.
- Clipboard monitoring is the app's stated purpose and can be paused
  anytime from the tray icon.
- The clipboard is written to on user action; nothing is ever transmitted.

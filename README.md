# ClipTap

A lightweight floating clipboard manager for Windows. Everything you copy — text and images — lands in a searchable history with pins. Open it, click anything, paste anywhere.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why

Windows clipboard history (`Win+V`) has no search, no tray access, no organization — and silently drops rapid back-to-back copies. ClipTap fixes all of that in one tiny always-on-top panel.

## Features

- **Automatic history** — every copy captured, newest on top, re-copies bump to top instead of duplicating
- **Text + images** — full support for both, with thumbnails
- **Instant search** — pill search bar filters as you type (or press `/`)
- **Pins** — keep passwords, snippets, and links forever; pins survive restarts and Clear
- **One-click copy-back** — click any clip to put it on the clipboard
- **Floating button** — stays on top, draggable, opens the panel anywhere
- **Tray controls** — pause monitoring, launch at login, history size (25–200), clear
- **Global shortcut** — `Ctrl+Shift+V` toggles the panel from any app
- **Glass UI** — dark frosted-glass design with staggered entrances and copy flashes

## Installation

### Download

Download the latest release from [Releases](https://github.com/0x-Shadow/ClipTap/releases).

- **Installer** — standard Windows installer with Start Menu shortcut
- **Portable** — no installation needed, just run the `.exe`

### Build from source

```bash
git clone https://github.com/0x-Shadow/ClipTap.git
cd ClipTap
npm install
npm start    # run in development
npm run build  # build installer + portable
```

## Usage

| Action | Method |
|--------|--------|
| Open panel | Click the floating button or press `Ctrl+Shift+V` |
| Copy a clip back | Click it (flashes green) |
| Search | Type in the pill bar, or press `/` |
| Pin / unpin | Hover a clip, click the pin |
| Delete | Hover a clip, click the trash |
| Close | `Esc`, `×`, or toggle shortcut |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+V` | Toggle panel (global) |
| `/` | Focus search (in panel) |
| `Esc` | Close panel |

## Where clips live

```
%APPDATA%\ClipTap\clips\clips.json   # text clips + metadata
%APPDATA%\ClipTap\clips\images\      # image clips as PNG
%APPDATA%\ClipTap\settings.json      # your preferences
```

## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop framework
- Async Clipboard API (`ClipboardItem`) — text + image capture
- Pure HTML/CSS/JS — no frameworks

## Security & Privacy

- Sandboxed renderers, isolated context, strict CSP, validated IPC — see [SECURITY.md](SECURITY.md)
- Everything stays on your disk. Zero network requests, zero telemetry
- The clipboard is the app's purpose and is disclosed here; monitoring can be paused anytime from the tray

## License

[MIT](LICENSE)

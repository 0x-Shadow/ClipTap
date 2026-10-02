# ClipTap

**Ctrl+Shift+V** — Clipboard manager for Windows

## Features

- Global hotkey `Ctrl+Shift+V` to open clipboard history
- Text and image clipboard support
- AES-256-GCM encrypted local storage
- Automatic duplicate detection
- Configurable storage limits and image retention
- Atomic file writes (safe against app kill during write)
- Complete data wipe functionality
- Sandboxed renderer with context isolation

## Development

```bash
npm install
npm run build
npm start
```

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run format
```

## Building a Release

### Code Signing

Set the following environment variables before building:

```powershell
$env:CERT_FILE="C:\path\to\certificate.pfx"
$env:CERT_PASSWORD="your-cert-password"
$env:CERT_SUBJECT="Your Certificate Subject Name"
```

Then run:

```bash
npm run dist
```

The packaged installer will be in the `release/` directory.

### Release Verification

```bash
npm run verify-release
```

## Windows Startup

ClipTap can be configured to start automatically on Windows login:

1. **Via Settings**: Use the NSIS installer option "Allow to change installation directory" and check the startup option during installation.

2. **Via Registry** (manual):
   ```
   HKCU\Software\Microsoft\Windows\CurrentVersion\Run
   ```
   Add a string value named `ClipTap` with the path to the installed executable.

3. **Via Startup Folder**:
   - Press `Win+R`, type `shell:startup`, press Enter
   - Create a shortcut to `ClipTap.exe` in this folder

4. **Via Task Scheduler** (for delayed start or specific triggers):
   - Open Task Scheduler
   - Create a basic task that runs `ClipTap.exe` at logon

## Security

- All clipboard data is encrypted with AES-256-GCM before being written to disk
- The encryption key is stored with restricted file permissions (0o600)
- The renderer process is sandboxed with `contextIsolation: true` and `sandbox: true`
- No data ever leaves the local machine

# Contributing to ClipTap

Thanks for your interest. This app holds people's clipboard — including passwords. Treat every change as security-sensitive.

## How to contribute

1. Open an issue first for anything large (sync, new formats, OCR).
2. Branch from `main`: `git checkout -b feat/short-description`
3. Run the checks below, then open a PR (what changed, how you tested).

## Required checks

```bash
npm install
npm test              # vitest suite must pass
npm run lint          # eslint must be clean
npm run format        # prettier first, commit the result
npm run build         # must bundle
npm run verify-release # release verification must pass
```

## Conventions

- Encryption is AES-256-GCM with atomic writes — do not weaken, bypass, or add unencrypted fallbacks. Any crypto change needs an issue + review.
- Renderer never touches clipboard/FS directly; all access goes through `src/preload/` + `src/main/`.
- `Ctrl+Shift+V` must keep working on a clean Windows boot after your change.
- Never commit `dist/`, installers, keys, or real clipboard samples from your machine.

## Details

- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`

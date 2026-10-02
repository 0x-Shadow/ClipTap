# Security Policy

## Supported versions

Latest `main` and the most recent signed release. Older installers are not patched — update first.

## Privacy model

ClipTap stores your clipboard history — including passwords and images —
**encrypted locally (AES-256-GCM) on your machine only**. There is no account,
no sync, and no network transmission of clipboard content.

## Reporting a vulnerability

- **Do not open a public issue.** Use GitHub → Security → Advisories → New draft advisory (preferred), or contact the owner privately.
- Include: app version, Windows version, steps to reproduce, and whether any clipboard content is written unencrypted or transmitted.
- Expect an acknowledgment within 7 days. Crypto issues are prioritized above features. Credit on request.

## Hard rules for contributors

No unencrypted fallbacks, no analytics on clipboard content, no weakening of
key derivation or atomic-write guarantees. Any crypto change requires an issue
and explicit review before merge.

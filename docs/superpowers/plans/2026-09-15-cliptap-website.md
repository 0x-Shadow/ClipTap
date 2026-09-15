# ClipTap Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page open-source docs + download site for ClipTap on GitHub Pages from the `/docs` folder.

**Architecture:** One static `docs/index.html` plus one `docs/styles.css`, vanilla HTML/CSS with zero dependencies and zero external requests. All download buttons link to the GitHub Releases page.

**Tech Stack:** Vanilla HTML5 + CSS3, no frameworks, no build step, no JavaScript required.

**Spec:** `docs/specs/2026-09-15-cliptap-website-design.md`

## Global Constraints

- Serve from `/docs` folder for GitHub Pages, nothing else uploaded.
- Zero external network requests (no CDNs, no fonts, no analytics).
- Match app glass tokens: background dark `#16161a`, accent `--blue #2997ff`, rounded 20px cards, font stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- Responsive: single column under 720px.
- Respect `prefers-reduced-motion`.
- Logo reuses `../assets/icon.png` with text fallback.

---

## File Structure

- Create: `docs/index.html` — entire page: nav, hero, features, download, install, usage, FAQ, footer.
- Create: `docs/styles.css` — glass theme, layout, responsive, reduced-motion.
- Touch nothing else. No changes to `main.js`, `preload.js`, `renderer/`, Electron packaging.

---

### Task 1: Page head, nav, hero, features

**Files:**
- Create: `docs/index.html` (partial: head through features section)

**Interfaces:**
- Consumes: nothing.
- Produces: `docs/index.html` containing `#top`, `#features` anchors and nav links that Task 2 extends with `#download`, `#install`, `#usage`, `#faq`.

- [ ] **Step 1: Write the first half of index.html**

Create `docs/index.html` with exactly this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ClipTap — Lightweight clipboard manager for Windows</title>
  <meta name="description" content="ClipTap is a free, open-source floating clipboard manager for Windows. Every copy lands in a searchable history with pins and images.">
  <link rel="stylesheet" href="./styles.css">
  <link rel="icon" href="../assets/icon.png" type="image/png">
</head>
<body>
  <header class="nav">
    <a class="brand" href="#top">
      <img src="../assets/icon.png" alt="ClipTap logo" width="28" height="28" onerror="this.remove()">
      <span>ClipTap</span>
    </a>
    <nav class="links">
      <a href="#features">Features</a>
      <a href="#install">Install</a>
      <a href="#usage">Usage</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div class="nav-cta">
      <a class="btn ghost" href="https://github.com/0x-Shadow/ClipTap">GitHub</a>
      <a class="btn primary" href="https://github.com/0x-Shadow/ClipTap/releases">Download</a>
    </div>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">Free &amp; open source (MIT)</p>
        <h1>Every copy, one tap away.</h1>
        <p class="lede">ClipTap is a lightweight floating clipboard manager for Windows. Text and images land in a searchable history with pins. Open it, click anything, paste anywhere.</p>
        <div class="hero-cta">
          <a class="btn primary big" href="https://github.com/0x-Shadow/ClipTap/releases">Download for Windows</a>
          <a class="btn ghost big" href="https://github.com/0x-Shadow/ClipTap">View on GitHub</a>
        </div>
        <p class="fine">Installer + portable builds. Zero telemetry, zero network requests.</p>
      </div>
      <div class="hero-mock" aria-hidden="true">
        <div class="mock-panel">
          <div class="mock-head"><span>Clipboard</span><span class="mock-count">3</span></div>
          <div class="mock-search">Search clips…</div>
          <div class="mock-clip"><strong>Hello world — project notes…</strong><span>12 chars · just now</span></div>
          <div class="mock-clip"><strong>Screenshot thumbnail…</strong><span>image · 2m ago</span></div>
          <div class="mock-clip pinned"><strong>Pinned: wifi password…</strong><span>9 chars · pinned</span></div>
        </div>
      </div>
    </section>

    <section id="features" class="section">
      <h2>Why ClipTap</h2>
      <p class="sub">Windows clipboard history has no search, no organization, and drops rapid copies. ClipTap fixes that.</p>
      <div class="grid">
        <div class="card"><h3>Automatic history</h3><p>Every copy captured, newest on top. Re-copies bump to top instead of duplicating.</p></div>
        <div class="card"><h3>Text + images</h3><p>Full support for both, with thumbnails for image clips.</p></div>
        <div class="card"><h3>Instant search</h3><p>Pill search bar filters as you type. Press <code>/</code> to focus.</p></div>
        <div class="card"><h3>Pins</h3><p>Keep passwords, snippets, and links forever. Pins survive restarts and Clear.</p></div>
        <div class="card"><h3>One-click copy-back</h3><p>Click any clip to put it on the clipboard. It flashes green.</p></div>
        <div class="card"><h3>Always at hand</h3><p>Floating button, tray controls, and global <code>Ctrl+Shift+V</code> shortcut.</p></div>
      </div>
    </section>
```

- [ ] **Step 2: Verify the partial file parses**

Run: `python -c "from html.parser import HTMLParser; HTMLParser().feed(open('docs/index.html', encoding='utf-8').read()); print('HTML OK')"`
Expected: `HTML OK`

- [ ] **Step 3: Commit**

```bash
git add docs/index.html
git commit -m "feat(site): add page head, nav, hero, features"
```

---

### Task 2: Download, install, usage, FAQ, footer

**Files:**
- Modify: `docs/index.html` (append second half before `</main>` + footer + close tags)

**Interfaces:**
- Consumes: partial `docs/index.html` from Task 1 (ends inside `<main>` after features section).
- Produces: complete `docs/index.html` with anchors `#download`, `#install`, `#usage`, `#faq` that the nav links to.

- [ ] **Step 1: Append the second half**

Append exactly this to the end of `docs/index.html`:

```html
    <section id="download" class="section">
      <h2>Download</h2>
      <p class="sub">Get the latest release from GitHub.</p>
      <div class="grid two">
        <div class="card"><h3>Installer</h3><p>Standard Windows installer with Start Menu shortcut.</p><p><a class="btn primary" href="https://github.com/0x-Shadow/ClipTap/releases">Get installer</a></p></div>
        <div class="card"><h3>Portable</h3><p>No installation needed — just run the .exe.</p><p><a class="btn ghost" href="https://github.com/0x-Shadow/ClipTap/releases">Get portable</a></p></div>
      </div>
      <p class="fine">Or build from source: <code>git clone https://github.com/0x-Shadow/ClipTap.git &amp;&amp; cd ClipTap &amp;&amp; npm install &amp;&amp; npm start</code></p>
    </section>

    <section id="install" class="section">
      <h2>Install in 3 steps</h2>
      <ol class="steps">
        <li><strong>Download</strong> the installer or portable build from Releases.</li>
        <li><strong>Run it.</strong> ClipTap lives in your tray and shows a floating button.</li>
        <li><strong>Press <code>Ctrl+Shift+V</code></strong> anywhere to open your history.</li>
      </ol>
    </section>

    <section id="usage" class="section">
      <h2>Usage</h2>
      <table class="keys">
        <tr><th>Action</th><th>Method</th></tr>
        <tr><td>Open panel</td><td>Click the floating button or <code>Ctrl+Shift+V</code></td></tr>
        <tr><td>Copy a clip back</td><td>Click it (flashes green)</td></tr>
        <tr><td>Search</td><td>Type in the pill bar, or press <code>/</code></td></tr>
        <tr><td>Pin / unpin</td><td>Hover a clip, click the pin</td></tr>
        <tr><td>Delete</td><td>Hover a clip, click the trash</td></tr>
        <tr><td>Close</td><td><code>Esc</code></td></tr>
      </table>
    </section>

    <section id="faq" class="section">
      <h2>FAQ</h2>
      <div class="faq">
        <div class="card"><h3>Is it free and open source?</h3><p>Yes. MIT licensed. Source, issues, and releases live on GitHub.</p></div>
        <div class="card"><h3>Which platforms?</h3><p>Windows (installer + portable). Built with Electron.</p></div>
        <div class="card"><h3>Where do clips live?</h3><p>On your disk only: <code>%APPDATA%\ClipTap\clips\</code>. Nothing leaves your machine.</p></div>
        <div class="card"><h3>Any telemetry?</h3><p>No. Zero network requests. Pause monitoring anytime from the tray.</p></div>
        <div class="card"><h3>Something wrong?</h3><p>Check <code>%APPDATA%\ClipTap\ClipTap.log</code> or tray → Open log file, then open a GitHub issue.</p></div>
      </div>
    </section>
  </main>

  <footer class="foot">
    <span>ClipTap · MIT License</span>
    <a href="https://github.com/0x-Shadow/ClipTap">GitHub</a>
    <a href="https://github.com/0x-Shadow/ClipTap/releases">Releases</a>
  </footer>
</body>
</html>
```

- [ ] **Step 2: Verify anchors all resolve**

Run: `python -c "import re; h=open('docs/index.html',encoding='utf-8').read(); ids=set(re.findall(r'id=\"([^\"]+)\"',h)); links=[l for l in re.findall(r'href=\"#([^\"]+)\"',h)]; missing=[l for l in links if l not in ids]; print('missing:',missing); assert not missing, missing; print('anchors OK:',sorted(ids))"`
Expected: `anchors OK:` including `features`, `download`, `install`, `usage`, `faq`, `top`, with `missing: []`

- [ ] **Step 3: Commit**

```bash
git add docs/index.html
git commit -m "feat(site): add download, install, usage, FAQ, footer"
```

---

### Task 3: Glass stylesheet + final verification

**Files:**
- Create: `docs/styles.css`
- Test: manual browser check + automated no-external-requests check

**Interfaces:**
- Consumes: `docs/index.html` classes: `.nav`, `.brand`, `.links`, `.btn`, `.hero`, `.mock-panel`, `.grid`, `.card`, `.steps`, `.keys`, `.faq`, `.foot`.
- Produces: complete styled site. Nothing downstream.

- [ ] **Step 1: Write the stylesheet**

Create `docs/styles.css` with exactly this content:

```css
:root {
  --blue: #2997ff;
  --text: #f5f5f7;
  --muted: #a1a1a6;
  --faint: #6e6e73;
  --panel: rgba(22, 22, 26, 0.78);
  --card: rgba(255, 255, 255, 0.035);
  --line: rgba(255, 255, 255, 0.08);
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #16161a; color: var(--text); font-family: var(--sans); line-height: 1.6; }
.nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 20px; padding: 14px 28px; background: rgba(22, 22, 26, 0.85); backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid var(--line); }
.brand { display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-weight: 700; font-size: 18px; }
.brand img { width: 28px; height: 28px; border-radius: 7px; }
.links { display: flex; gap: 18px; margin-left: auto; }
.links a { color: var(--muted); text-decoration: none; font-size: 14px; }
.links a:hover { color: #fff; }
.nav-cta { display: flex; gap: 10px; }
.btn { display: inline-block; padding: 9px 18px; border-radius: 980px; text-decoration: none; font-size: 14px; font-weight: 600; border: 1px solid var(--line); color: var(--text); background: rgba(255,255,255,0.06); }
.btn.primary { background: var(--blue); border-color: transparent; color: #fff; }
.btn.big { padding: 13px 26px; font-size: 15px; }
main { max-width: 1020px; margin: 0 auto; padding: 0 24px 40px; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; padding: 72px 0 48px; }
.kicker { color: var(--blue); font-weight: 700; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
.hero h1 { font-size: 52px; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 16px; }
.lede { color: var(--muted); font-size: 18px; margin-bottom: 24px; }
.hero-cta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.fine { color: var(--faint); font-size: 13px; }
.fine code, .card code, .steps code, .keys code, .faq code { font-family: Consolas, monospace; font-size: 0.9em; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 6px; }
.hero-mock .mock-panel { background: var(--panel); backdrop-filter: blur(28px) saturate(180%); border-radius: 20px; border: 1px solid var(--line); padding: 20px; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
.mock-head { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 12px; }
.mock-count { color: var(--blue); background: rgba(41,151,255,0.13); border-radius: 980px; padding: 0 10px; font-size: 12px; }
.mock-search { background: rgba(255,255,255,0.06); border-radius: 980px; padding: 8px 14px; color: var(--faint); font-size: 13px; margin-bottom: 12px; }
.mock-clip { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; font-size: 13px; }
.mock-clip span { display: block; color: var(--faint); font-size: 11px; margin-top: 4px; }
.mock-clip.pinned { border-color: rgba(41,151,255,0.4); }
.section { padding: 36px 0; }
.section h2 { font-size: 30px; letter-spacing: -0.02em; margin-bottom: 8px; }
.sub { color: var(--muted); margin-bottom: 20px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.grid.two { grid-template-columns: repeat(2, 1fr); }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
.card h3 { font-size: 16px; margin-bottom: 8px; }
.card p { color: var(--muted); font-size: 14px; }
.card .btn { margin-top: 12px; }
.steps { margin-left: 20px; display: grid; gap: 10px; }
.keys { width: 100%; border-collapse: collapse; font-size: 14px; }
.keys th, .keys td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); }
.keys th { color: var(--faint); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
.faq { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.foot { display: flex; gap: 18px; align-items: center; max-width: 1020px; margin: 0 auto; padding: 24px; border-top: 1px solid var(--line); color: var(--faint); font-size: 13px; }
.foot a { color: var(--muted); text-decoration: none; }
.foot a:hover { color: #fff; }
@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; padding-top: 48px; }
  .hero h1 { font-size: 38px; }
  .grid, .grid.two, .faq { grid-template-columns: 1fr; }
  .links { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 2: Run automated checks**

Run: `python -c "import re; h=open('docs/index.html',encoding='utf-8').read(); ext=re.findall(r'https?://[^\"'\"' ]+',h); allowed=[u for u in ext if 'github.com/0x-Shadow/ClipTap' not in u]; print('external:',allowed); assert not allowed, allowed; print('no external requests OK')"`
Expected: `no external requests OK`

Run: `python -c "import re,os; h=open('docs/index.html',encoding='utf-8').read(); cls=set(re.findall(r'class=\"([^\"]+)\"',h)); used={c for g in cls for c in g.split()}; css=open('docs/styles.css',encoding='utf-8').read(); missing=[c for c in ['nav','brand','links','btn','hero','mock-panel','grid','card','steps','keys','faq','foot'] if '.'+c not in css]; print('missing classes:',missing); assert not missing; print('classes OK')"`
Expected: `classes OK`

- [ ] **Step 3: Manual browser check**

Open `docs/index.html` in a browser. Confirm: nav sticky, hero + mock render, all anchors jump, 360px and 1280px widths look right, devtools network tab shows zero external requests, no console errors.

- [ ] **Step 4: Commit**

```bash
git add docs/styles.css
git commit -m "feat(site): add glass stylesheet and verify site"
```

---

## After all tasks

Enable Pages: repo Settings → Pages → Deploy from branch → `main` → folder `/docs`. Site goes live, nothing else uploaded.

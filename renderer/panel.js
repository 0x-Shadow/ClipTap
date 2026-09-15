const list = document.getElementById('clip-list');
const count = document.getElementById('clip-count');
const closeBtn = document.getElementById('panel-close');
const searchInput = document.getElementById('search');
const searchClear = document.getElementById('search-clear');
const emptyState = document.getElementById('clip-empty');
const clearBtn = document.getElementById('clear-btn');
const footHint = document.getElementById('foot-hint');

let allClips = [];
let query = '';

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return new Date(ts).toLocaleDateString();
}

function imgSrc(file) {
  if (!/^img-\d+\.png$/.test(file)) return '';
  const dir = window.clipAPI.getImagesDir();
  return 'file:///' + dir.replace(/\\/g, '/').replace(/ /g, '%20') + '/' + file;
}

function matches(c) {
  if (!query) return true;
  if (c.kind === 'text') return (c.text || '').toLowerCase().includes(query);
  return (c.file || '').toLowerCase().includes(query);
}

function render(animate) {
  list.querySelectorAll('.clip').forEach(el => el.remove());
  const items = allClips.filter(matches);
  const pinned = items.filter(c => c.pinned);
  const rest = items.filter(c => !c.pinned);
  const ordered = [...pinned, ...rest];

  count.textContent = allClips.length;
  emptyState.style.display = allClips.length === 0 ? 'flex' : 'none';
  if (allClips.length > 0 && ordered.length === 0) {
    emptyState.style.display = 'flex';
    emptyState.querySelector('p').textContent = 'No matches';
    emptyState.querySelector('span').textContent = 'Try a different search';
  } else if (allClips.length > 0) {
    emptyState.querySelector('p').textContent = 'Nothing copied yet';
    emptyState.querySelector('span').textContent = 'Copy anything — it lands here';
  }

  ordered.slice(0, 120).forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'clip' + (c.pinned ? ' pinned' : '');
    if (animate) el.style.animationDelay = Math.min(i * 28, 400) + 'ms';
    else el.classList.add('no-anim');

    const body = c.kind === 'text'
      ? `<div class="clip-text">${esc((c.text || '').slice(0, 280))}</div>`
      : `<div class="clip-img">${c.broken || !c.file
          ? '<span class="img-missing">image unavailable</span>'
          : `<img src="${imgSrc(c.file)}" alt="" loading="lazy">`}</div>`;

    el.innerHTML = `
      ${body}
      <div class="clip-meta">
        <span class="clip-kind">${c.kind === 'text' ? `${(c.text || '').length} chars` : 'image'}</span>
        <span class="clip-time">${timeAgo(c.time)}</span>
      </div>
      <div class="clip-tools">
        <button class="tool tool-pin${c.pinned ? ' on' : ''}" title="${c.pinned ? 'Unpin' : 'Pin'}">
          <svg viewBox="0 0 24 24" fill="${c.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 3h6l1 7 3 3H5l3-3z"/></svg>
        </button>
        <button class="tool tool-del" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;
    list.appendChild(el);

    el.addEventListener('click', () => {
      window.clipAPI.copyClip(c.id);
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
      footHint.textContent = 'Copied — paste anywhere';
      setTimeout(() => { footHint.textContent = 'Click a clip to copy it back'; }, 1500);
    });
    el.querySelector('.tool-pin').addEventListener('click', (e) => {
      e.stopPropagation();
      window.clipAPI.togglePin(c.id);
    });
    el.querySelector('.tool-del').addEventListener('click', (e) => {
      e.stopPropagation();
      window.clipAPI.deleteClip(c.id);
    });
  });
}

window.clipAPI.onClips((clips) => {
  allClips = Array.isArray(clips) ? clips : [];
  render(false);
});

let searchTimer = null;
searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  searchClear.classList.toggle('hidden', query.length === 0);
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => render(false), 120);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  query = '';
  searchClear.classList.add('hidden');
  searchInput.focus();
  render(false);
});

closeBtn.addEventListener('click', () => window.clipAPI.closePanel());
clearBtn.addEventListener('click', () => window.clipAPI.clearHistory());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.clipAPI.closePanel();
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});

allClips = window.clipAPI.getClips();
render(true);
searchInput.focus();

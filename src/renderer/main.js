async function loadClips() {
  const clips = await window.cliptap.getClips();
  renderClips(clips);
}

function renderClips(clips) {
  const list = document.getElementById('clips-list');
  list.innerHTML = '';
  for (const clip of clips) {
    const li = document.createElement('li');
    li.className = 'clip-item';
    if (clip.type === 'image') {
      const img = document.createElement('img');
      img.src = 'data:image/png;base64,' + clip.content;
      li.appendChild(img);
    } else {
      const p = document.createElement('p');
      p.textContent = clip.content;
      li.appendChild(p);
    }
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => window.cliptap.deleteClip(clip.id).then(loadClips);
    li.appendChild(delBtn);
    list.appendChild(li);
  }
}

async function loadSettings() {
  const settings = await window.cliptap.getSettings();
  document.getElementById('retention-days').value = settings.imageRetentionDays;
}

document.getElementById('clear-btn').onclick = () => {
  if (confirm('Clear all clips?')) {
    window.cliptap.clearAll().then(loadClips);
  }
};

document.getElementById('wipe-btn').onclick = () => {
  if (confirm('WARNING: This will permanently delete ALL ClipTap data. Continue?')) {
    window.cliptap.wipeData().then(() => {
      alert('All data wiped.');
      loadClips();
    });
  }
};

document.getElementById('save-settings').onclick = () => {
  const days = parseInt(document.getElementById('retention-days').value, 10);
  window.cliptap.saveSettings({ imageRetentionDays: days }).then(loadSettings);
};

window.cliptap.onClipsUpdated(loadClips);
window.cliptap.onShortcutConflict((_, error) => {
  const el = document.getElementById('conflict-warning');
  el.textContent = 'Shortcut conflict: ' + error;
  el.classList.remove('hidden');
});

loadClips();
loadSettings();

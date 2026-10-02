const btn = document.getElementById('clip-btn');
let isDragging = false;
let dragStartY = 0;
let windowStartY = 0;

btn.addEventListener('mousedown', (e) => {
  isDragging = false;
  dragStartY = e.screenY;
  windowStartY = window.screenY;

  const onMove = (ev) => {
    if (Math.abs(ev.screenY - dragStartY) > 5) isDragging = true;
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if (!isDragging) window.clipAPI.togglePanel();
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});

btn.addEventListener('mousemove', (e) => {
  if (e.buttons === 1) {
    const newY = windowStartY + (e.screenY - dragStartY);
    const { height: screenH } = window.screen;
    window.moveTo(window.screenX, Math.max(0, Math.min(newY, screenH - 50)));
  }
});

'use strict';
/* ClipTap site FX — vanilla only, zero dependencies.
 * - Lerped cursor aura (dot + trailing glow ring)
 * - Click water bubbles on a fixed canvas (rings + rising droplets)
 * - Scroll reveals via IntersectionObserver (fire once)
 * - Magnetic buttons + subtle hero panel tilt (fine pointers only)
 * All motion is disabled under prefers-reduced-motion.
 */
(function () {
  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion) return;

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- lerped cursor aura ---------- */
  var aura = document.getElementById('aura');
  var dot = aura ? aura.querySelector('.aura-dot') : null;
  var ring = aura ? aura.querySelector('.aura-ring') : null;
  var auraOn = !!(aura && dot && ring && finePointer);
  var mx = -100, my = -100, dx = -100, dy = -100, rx = -100, ry = -100;
  if (auraOn) {
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      aura.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      aura.classList.remove('on');
    });
    document.addEventListener('mouseover', function (e) {
      if (e.target && e.target.closest && e.target.closest('a, button')) aura.classList.add('hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target && e.target.closest && e.target.closest('a, button')) aura.classList.remove('hot');
    });
  }

  /* ---------- click water bubbles (canvas) ---------- */
  var canvas = document.getElementById('fx');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var parts = [];
  var rings = [];
  var MAX_PARTS = 240;
  function sizeCanvas() {
    if (!canvas || !ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function burst(x, y) {
    rings.push({ x: x, y: y, r: 6, max: 92, a: 0.55 });
    rings.push({ x: x, y: y, r: 2, max: 58, a: 0.4 });
    for (var i = 0; i < 14; i++) {
      if (parts.length >= MAX_PARTS) parts.shift();
      var ang = Math.random() * Math.PI * 2;
      var sp = 1 + Math.random() * 3.2;
      parts.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 1.6,
        r: 1.5 + Math.random() * 5,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        wob: Math.random() * Math.PI * 2,
        cyan: Math.random() < 0.35
      });
    }
  }
  if (ctx) {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    document.addEventListener('pointerdown', function (e) {
      burst(e.clientX, e.clientY);
    }, { passive: true });
  }

  /* ---------- single rAF loop drives aura + canvas ---------- */
  function frame() {
    if (auraOn) {
      dx = lerp(dx, mx, 0.5); dy = lerp(dy, my, 0.5);
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    }
    if (ctx && (rings.length || parts.length)) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      var i, g, j, p;
      for (i = rings.length - 1; i >= 0; i--) {
        g = rings[i];
        g.r += (g.max - g.r) * 0.12 + 0.6;
        g.a *= 0.94;
        if (g.a < 0.02 || g.r >= g.max) { rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(41,151,255,' + g.a.toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      for (j = parts.length - 1; j >= 0; j--) {
        p = parts[j];
        p.wob += 0.08;
        p.x += p.vx + Math.sin(p.wob) * 0.4;
        p.y += p.vy;
        p.vy -= 0.02;
        p.vx *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(j, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life + 0.4, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? 'rgba(125,211,252,' + (p.life * 0.8).toFixed(3) + ')'
          : 'rgba(41,151,255,' + (p.life * 0.7).toFixed(3) + ')';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, Math.max(p.r * 0.28 * p.life, 0.3), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (p.life * 0.85).toFixed(3) + ')';
        ctx.fill();
      }
      if (!rings.length && !parts.length) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- scroll reveals (fire once) ---------- */
  if ('IntersectionObserver' in window) {
    var els = Array.prototype.slice.call(document.querySelectorAll(
      '.section h2, .section .sub, .card, .steps li, .keys, .foot'
    ));
    els.forEach(function (el) { el.classList.add('reveal'); });
    Array.prototype.forEach.call(document.querySelectorAll('.grid, .faq'), function (group) {
      Array.prototype.forEach.call(group.querySelectorAll('.card'), function (card, i) {
        card.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- magnetic buttons + hero tilt (fine pointers) ---------- */
  if (finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll('.btn.big, .nav-cta .btn'), function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var ox = e.clientX - (r.left + r.width / 2);
        var oy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (ox * 0.12).toFixed(1) + 'px,' + (oy * 0.18).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
    var hero = document.querySelector('.hero');
    var mock = document.querySelector('.mock-panel');
    if (hero && mock) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        mock.style.transform = 'rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg)';
      });
      hero.addEventListener('pointerleave', function () { mock.style.transform = ''; });
    }
  }
})();

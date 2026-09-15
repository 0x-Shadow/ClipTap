'use strict';
/* ClipTap site FX — vanilla, zero dependencies.
 * Loader, scroll progress, lerped custom cursor (dot + ring) with magnetic
 * hover, cursor spotlight, refined click bubbles, CTA ink ripples,
 * count-up stats, scroll reveals, spotlight cards, live demo + toast,
 * copy buttons, accordion polish, nav state, back-to-top.
 * Everything visual is gated behind fine-pointer / no-reduced-motion checks.
 */
(function () {
  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- loader (skip entirely on reduced motion) ---------- */
  var loader = document.getElementById('loader');
  function hideLoader() { if (loader) loader.classList.add('done'); }
  if (reduceMotion) hideLoader();
  else {
    window.addEventListener('load', function () { setTimeout(hideLoader, 500); });
    setTimeout(hideLoader, 2200);
  }

  /* ---------- toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  /* ---------- scroll progress + nav state + back-to-top ---------- */
  var progress = document.querySelector('#progress i');
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0).toFixed(3) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (toTop) toTop.classList.toggle('show', y > 700);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- count-up stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || !('IntersectionObserver' in window)) { el.textContent = target + suffix; return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.disconnect();
        var t0 = null;
        function tick(t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / 1100, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), countUp);

  /* ---------- scroll reveals ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var els = Array.prototype.slice.call(document.querySelectorAll(
      '.section .kicker, .section h2, .section .sub, .bento .cell, .steps li, .dl-card, .term, .keys, .accordion details, .cta-band, .hero-demo'
    ));
    els.forEach(function (el) { el.classList.add('reveal'); });
    Array.prototype.forEach.call(document.querySelectorAll('.bento, .steps'), function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
      });
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- spotlight cards (mouse-tracked radial highlight) ---------- */
  if (finePointer && !reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('.spot'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ---------- material ink ripple on CTAs ---------- */
  if (!reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-ripple]'), function (el) {
      el.addEventListener('pointerdown', function (e) {
        var r = el.getBoundingClientRect();
        var d = Math.max(r.width, r.height) * 2.2;
        var ink = document.createElement('span');
        ink.className = 'ink';
        ink.style.width = ink.style.height = d.toFixed(0) + 'px';
        ink.style.left = (e.clientX - r.left).toFixed(0) + 'px';
        ink.style.top = (e.clientY - r.top).toFixed(0) + 'px';
        el.appendChild(ink);
        setTimeout(function () { ink.remove(); }, 650);
      });
    });
  }

  /* ---------- magnetic elements ---------- */
  if (finePointer && !reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnetic]'), function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var ox = e.clientX - (r.left + r.width / 2);
        var oy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (ox * 0.14).toFixed(1) + 'px,' + (oy * 0.2).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    var hero = document.querySelector('.hero');
    var demo = document.getElementById('demoPanel');
    if (hero && demo) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        demo.style.transform = 'rotateY(' + (px * 9).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg)';
      });
      hero.addEventListener('pointerleave', function () { demo.style.transform = ''; });
    }
  }

  /* ---------- custom cursor: instant dot + lerped ring + spotlight ---------- */
  var cursor = document.getElementById('cursor');
  var cDot = cursor ? cursor.querySelector('.cur-dot') : null;
  var cRing = cursor ? cursor.querySelector('.cur-ring') : null;
  var spot = document.getElementById('spot');
  var cursorOn = !!(cursor && cDot && cRing && finePointer && !reduceMotion);
  var mx = -100, my = -100, rx = -100, ry = -100, sx = -100, sy = -100;
  if (cursorOn) {
    document.documentElement.classList.add('has-cursor');
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cursor.classList.remove('on'); });
    document.addEventListener('pointerdown', function () { cursor.classList.add('down'); });
    document.addEventListener('pointerup', function () { cursor.classList.remove('down'); });
    document.addEventListener('mouseover', function (e) {
      if (e.target && e.target.closest && e.target.closest('a, button, summary')) cursor.classList.add('hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target && e.target.closest && e.target.closest('a, button, summary')) cursor.classList.remove('hot');
    });
  }

  /* ---------- refined click bubbles (single ring + small droplets) ---------- */
  var canvas = document.getElementById('fx');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var parts = [];
  var rings = [];
  var MAX_PARTS = 120;
  function sizeCanvas() {
    if (!canvas || !ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function burst(x, y) {
    rings.push({ x: x, y: y, r: 4, max: 64, a: 0.5 });
    for (var i = 0; i < 8; i++) {
      if (parts.length >= MAX_PARTS) parts.shift();
      var ang = Math.random() * Math.PI * 2;
      var sp = 0.8 + Math.random() * 2.2;
      parts.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.2,
        r: 1.5 + Math.random() * 3.5,
        life: 1, decay: 0.012 + Math.random() * 0.014,
        wob: Math.random() * Math.PI * 2
      });
    }
    if (rings.length > 12) rings.splice(0, rings.length - 12);
  }
  if (ctx && !reduceMotion) {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    document.addEventListener('pointerdown', function (e) { burst(e.clientX, e.clientY); }, { passive: true });
  }

  /* ---------- one rAF loop ---------- */
  function frame() {
    if (cursorOn) {
      cDot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      rx = lerp(rx, mx, 0.2); ry = lerp(ry, my, 0.2);
      cRing.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
      if (spot) {
        sx = lerp(sx, mx, 0.07); sy = lerp(sy, my, 0.07);
        spot.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
        spot.style.opacity = cursor.classList.contains('on') ? '1' : '0';
      }
    }
    if (ctx && (rings.length || parts.length)) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      var i, g, j, p;
      for (i = rings.length - 1; i >= 0; i--) {
        g = rings[i];
        g.r += (g.max - g.r) * 0.16 + 0.5;
        g.a *= 0.93;
        if (g.a < 0.02 || g.r >= g.max) { rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(41,151,255,' + g.a.toFixed(3) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      for (j = parts.length - 1; j >= 0; j--) {
        p = parts[j];
        p.wob += 0.09;
        p.x += p.vx + Math.sin(p.wob) * 0.35;
        p.y += p.vy;
        p.vy -= 0.015;
        p.vx *= 0.986;
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(j, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.r * p.life, 0.4), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120,190,255,' + (p.life * 0.75).toFixed(3) + ')';
        ctx.fill();
      }
      if (!rings.length && !parts.length) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    requestAnimationFrame(frame);
  }
  if (cursorOn || (ctx && !reduceMotion)) requestAnimationFrame(frame);

  /* ---------- live demo: click a clip to copy + toast ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.demo-clip'), function (clip) {
    clip.addEventListener('click', function () {
      var text = clip.getAttribute('data-text') || '';
      function done() {
        clip.classList.remove('flash');
        void clip.offsetWidth;
        clip.classList.add('flash');
        showToast('Copied — paste anywhere');
        setTimeout(function () { clip.classList.remove('flash'); }, 1200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else done();
    });
  });

  /* ---------- copy build command ---------- */
  var copyBuild = document.getElementById('copyBuild');
  if (copyBuild) copyBuild.addEventListener('click', function () {
    var cmd = 'git clone https://github.com/0x-Shadow/ClipTap.git && cd ClipTap && npm install && npm start';
    function done() { copyBuild.textContent = 'copied'; showToast('Build command copied'); setTimeout(function () { copyBuild.textContent = 'copy'; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cmd).then(done, done);
    else done();
  });
})();

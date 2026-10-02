'use strict';
/* ClipTap site FX — vanilla, zero dependencies.
 * Scroll progress, minimal difference-blend cursor (dot + ring),
 * subtle click rings, CTA ink ripples, scroll reveals, magnetic
 * buttons, demo tilt, live demo copy + toast, copy buttons, nav, toTop.
 * Gated behind fine-pointer / no-reduced-motion checks throughout.
 */
(function () {
  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function lerp(a, b, t) { return a + (b - a) * t; }

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

  /* ---------- progress + nav + toTop ---------- */
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

  /* ---------- headline word masks (split once, CSS animates) ---------- */
  if (!reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('.display'), function (h) {
      var nodes = Array.prototype.slice.call(h.childNodes);
      h.textContent = '';
      var wi = 0;
      nodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { h.appendChild(document.createTextNode(' ')); return; }
            var m = document.createElement('span');
            m.className = 'wordmask';
            var inner = document.createElement('span');
            inner.textContent = part;
            inner.style.animationDelay = (wi * 0.06).toFixed(2) + 's';
            m.appendChild(inner);
            h.appendChild(m);
            wi++;
          });
        } else if (n.nodeName === 'BR') {
          h.appendChild(n);
        } else {
          var m2 = document.createElement('span');
          m2.className = 'wordmask';
          var in2 = document.createElement('span');
          in2.style.animationDelay = (wi * 0.06).toFixed(2) + 's';
          in2.appendChild(n);
          m2.appendChild(in2);
          h.appendChild(m2);
          h.appendChild(document.createTextNode(' '));
          wi++;
        }
      });
    });
  }

  /* ---------- scroll reveals ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var els = Array.prototype.slice.call(document.querySelectorAll(
      '.mono-label, .section h2, .lede, .hero-cta, .spec-strip, .hero-demo, .feat, .steps li, .dl-row, .term, .keys, .accordion details'
    ));
    els.forEach(function (el) { el.classList.add('reveal'); });
    Array.prototype.forEach.call(document.querySelectorAll('.feat-list, .steps'), function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.transitionDelay = Math.min(i * 60, 300) + 'ms';
      });
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- scrollspy ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.links a'));
  if ('IntersectionObserver' in window && spyLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('main .section[id]'), function (s) { spy.observe(s); });
  }

  /* ---------- CTA ink ripple ---------- */
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
        setTimeout(function () { ink.remove(); }, 600);
      });
    });
  }

  /* ---------- magnetic + demo tilt ---------- */
  if (finePointer && !reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnetic]'), function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var ox = e.clientX - (r.left + r.width / 2);
        var oy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (ox * 0.1).toFixed(1) + 'px,' + (oy * 0.16).toFixed(1) + 'px)';
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
        demo.style.transform = 'rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg)';
      });
      hero.addEventListener('pointerleave', function () { demo.style.transform = ''; });
    }
  }

  /* ---------- minimal difference cursor ---------- */
  var cursor = document.getElementById('cursor');
  var cDot = cursor ? cursor.querySelector('.cur-dot') : null;
  var cRing = cursor ? cursor.querySelector('.cur-ring') : null;
  var cursorOn = !!(cursor && cDot && cRing && finePointer && !reduceMotion);
  var mx = -100, my = -100, rx = -100, ry = -100;
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

  /* ---------- subtle click ring + droplets ---------- */
  var canvas = document.getElementById('fx');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var parts = [];
  var rings = [];
  function sizeCanvas() {
    if (!canvas || !ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function burst(x, y) {
    rings.push({ x: x, y: y, r: 3, max: 46, a: 0.4 });
    for (var i = 0; i < 6; i++) {
      if (parts.length > 90) parts.shift();
      var ang = Math.random() * Math.PI * 2;
      var sp = 0.6 + Math.random() * 1.8;
      parts.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1,
        r: 1 + Math.random() * 2.5,
        life: 1, decay: 0.014 + Math.random() * 0.014
      });
    }
    if (rings.length > 8) rings.splice(0, rings.length - 8);
  }
  if (ctx && !reduceMotion) {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    document.addEventListener('pointerdown', function (e) { burst(e.clientX, e.clientY); }, { passive: true });
  }

  function frame() {
    if (cursorOn) {
      cDot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      rx = lerp(rx, mx, 0.22); ry = lerp(ry, my, 0.22);
      cRing.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
    }
    if (ctx && (rings.length || parts.length)) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      var i, g, j, p;
      for (i = rings.length - 1; i >= 0; i--) {
        g = rings[i];
        g.r += (g.max - g.r) * 0.18 + 0.5;
        g.a *= 0.92;
        if (g.a < 0.02 || g.r >= g.max) { rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(242,240,234,' + g.a.toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (j = parts.length - 1; j >= 0; j--) {
        p = parts[j];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01;
        p.vx *= 0.987;
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(j, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.r * p.life, 0.4), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(41,151,255,' + (p.life * 0.7).toFixed(3) + ')';
        ctx.fill();
      }
      if (!rings.length && !parts.length) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    requestAnimationFrame(frame);
  }
  if (cursorOn || (ctx && !reduceMotion)) requestAnimationFrame(frame);

  /* ---------- live demo copy + build-command copy ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.demo-clip'), function (clip) {
    clip.addEventListener('click', function () {
      var text = clip.getAttribute('data-text') || '';
      function done() {
        clip.classList.remove('flash');
        void clip.offsetWidth;
        clip.classList.add('flash');
        showToast('copied — paste anywhere');
        setTimeout(function () { clip.classList.remove('flash'); }, 1200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else done();
    });
  });
  var copyBuild = document.getElementById('copyBuild');
  if (copyBuild) copyBuild.addEventListener('click', function () {
    var cmd = 'git clone https://github.com/0x-Shadow/ClipTap.git && cd ClipTap && npm install && npm start';
    function done() { copyBuild.textContent = 'copied'; showToast('build command copied'); setTimeout(function () { copyBuild.textContent = 'copy'; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cmd).then(done, done);
    else done();
  });
})();

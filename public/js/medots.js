/* ─────────────────────────────────────────────────────────────
   MEDots · a small 2D particle engine shared across the site.
   One file, no libraries. Every dotted background on the site is
   an instance of this with a different mode.

   Usage:  <canvas data-dots="rain" data-accent="#C4622F"></canvas>
   Modes:  field · rain · heat · ripple · flow · scatter
   Perf:   DPR capped at 2, density scales with area, and an
           IntersectionObserver parks the loop when off-screen.
   ───────────────────────────────────────────────────────────── */
(function () {
  var TAU = Math.PI * 2;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // cheap value noise, good enough for a dot field
  var P = new Uint8Array(512);
  (function () { for (var i = 0; i < 256; i++) P[i] = P[i + 256] = (Math.random() * 256) | 0; })();
  function n2(x, y) {
    var xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    var xf = x - Math.floor(x), yf = y - Math.floor(y);
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    function g(a, b) { return P[(P[a] + b) & 511] / 255; }
    var a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }

  function Dots(cv, mode, opts) {
    opts = opts || {};
    var ctx = cv.getContext('2d');
    var accent = opts.accent || '#E0A05A';
    var water = opts.water || '#4FA89C';
    var base = opts.base || '#6B6857';
    var dpr = 1, W = 0, H = 0, t = 0, running = false, raf = 0;
    var pts = [];

    function hex(c, a) {
      var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return false;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    function count() {
      var byArea = Math.round(W * H / 900);           // ~1 dot per 30x30 px
      return clamp(byArea, 260, opts.max || 2600);
    }

    function seed() {
      pts.length = 0;
      var N = count();
      for (var i = 0; i < N; i++) {
        pts.push({
          x: rnd(0, W), y: rnd(0, H),
          bx: 0, by: 0,
          s: rnd(0.6, 1.9),
          p: rnd(0, TAU),
          v: rnd(0.25, 1),
          k: Math.random()
        });
      }
      if (mode === 'field' || mode === 'flow') {
        // lay them on a jittered lattice so the surface reads as a surface
        var cols = Math.ceil(Math.sqrt(pts.length * (W / H))), rows = Math.ceil(pts.length / cols), i2 = 0;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          if (i2 >= pts.length) break;
          var p = pts[i2++];
          p.bx = (c + 0.5) / cols * W + rnd(-6, 6);
          p.by = (r + 0.5) / rows * H + rnd(-6, 6);
          p.x = p.bx; p.y = p.by;
        }
      }
    }

    var MODES = {
      /* an undulating dot surface with a channel carved through it */
      field: function (dt) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          var nx = p.bx * 0.004, ny = p.by * 0.006;
          var h = n2(nx + t * 0.05, ny) * 2 - 1;
          var chan = Math.exp(-Math.pow((p.by - H * 0.62) / (H * 0.13), 2));
          var y = p.by + h * H * 0.055 + chan * H * 0.06;
          var lift = clamp((H * 0.62 - y) / (H * 0.5), -1, 1);
          var col = chan > 0.45 ? water : base;
          var a = 0.18 + 0.5 * (0.5 + lift * 0.5) * (chan > 0.45 ? 1.2 : 1);
          ctx.fillStyle = hex(col, clamp(a, 0.05, 0.85));
          ctx.beginPath();
          ctx.arc(p.bx, y, p.s * (chan > 0.45 ? 1.15 : 1), 0, TAU);
          ctx.fill();
        }
      },

      /* rain falling into a rising line */
      rain: function (dt) {
        ctx.clearRect(0, 0, W, H);
        var line = H * (0.78 - 0.10 * (0.5 + 0.5 * Math.sin(t * 0.35)));
        ctx.strokeStyle = hex(water, 0.30);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, line); ctx.lineTo(W, line); ctx.stroke();
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.y += (60 + p.v * 130) * dt;
          p.x -= (10 + p.v * 14) * dt;
          if (p.y > line) { p.y = -10; p.x = rnd(0, W + 80); }
          if (p.x < -20) p.x = W + 20;
          var near = clamp((line - p.y) / (H * 0.5), 0, 1);
          ctx.fillStyle = hex(p.k > 0.86 ? accent : water, 0.16 + 0.5 * (1 - near));
          ctx.fillRect(p.x, p.y, 1.1, 3.4 + p.v * 3);
        }
        // accumulated surface speckle
        for (var j = 0; j < 90; j++) {
          var x = (j * 97 + Math.sin(t * 0.6 + j) * 40) % W;
          ctx.fillStyle = hex(water, 0.22);
          ctx.beginPath(); ctx.arc(x, line + Math.sin(t + j) * 2.5, 1.2, 0, TAU); ctx.fill();
        }
      },

      /* warm dots rising and dispersing */
      heat: function (dt) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.y -= (12 + p.v * 34) * dt;
          p.x += Math.sin(t * 0.8 + p.p) * 10 * dt;
          if (p.y < -8) { p.y = H + rnd(0, 40); p.x = rnd(0, W); }
          var up = clamp(1 - p.y / H, 0, 1);
          ctx.fillStyle = hex(up > 0.55 ? accent : '#C4622F', 0.06 + 0.34 * (1 - up));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.6 + up * 0.9), 0, TAU); ctx.fill();
        }
      },

      /* concentric rings pulsing out of a point, for the voice surface */
      ripple: function (dt) {
        ctx.clearRect(0, 0, W, H);
        var cx = W * (opts.cx || 0.5), cy = H * (opts.cy || 0.5);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          var dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
          var wave = Math.sin(d * 0.035 - t * 2.1);
          var a = 0.06 + 0.36 * Math.max(0, wave);
          var off = wave * 3.2;
          ctx.fillStyle = hex(d < Math.min(W, H) * 0.28 ? accent : base, a);
          ctx.beginPath();
          ctx.arc(p.x + (dx / (d || 1)) * off, p.y + (dy / (d || 1)) * off, p.s * (0.7 + Math.max(0, wave) * 0.8), 0, TAU);
          ctx.fill();
        }
      },

      /* dots streaming along a gentle curve, like a reach seen from above */
      flow: function (dt) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.x += (18 + p.v * 46) * dt;
          if (p.x > W + 12) { p.x = -12; p.by = rnd(0, H); }
          var cy = H * 0.5 + Math.sin(p.x * 0.0042 + 0.6) * H * 0.20 + Math.sin(p.x * 0.0011) * H * 0.10;
          var band = Math.exp(-Math.pow((p.by - cy) / (H * 0.20), 2));
          var y = p.by * 0.32 + cy * 0.68 + Math.sin(t * 0.9 + p.p) * 2.2;
          ctx.fillStyle = hex(band > 0.5 ? water : base, 0.05 + 0.55 * band);
          ctx.beginPath(); ctx.arc(p.x, y, p.s * (0.6 + band * 0.9), 0, TAU); ctx.fill();
        }
      },

      /* a still scatter where a few dots are marked, for evidence pages */
      scatter: function (dt) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          var tw = 0.5 + 0.5 * Math.sin(t * 0.9 + p.p);
          var marked = p.k > 0.955;
          ctx.fillStyle = hex(marked ? accent : base, marked ? 0.35 + 0.45 * tw : 0.07 + 0.16 * tw);
          ctx.beginPath();
          ctx.arc(p.x, p.y + Math.sin(t * 0.4 + p.p) * 1.6, p.s * (marked ? 1.5 : 0.9), 0, TAU);
          ctx.fill();
        }
      }
    };

    var draw = MODES[mode] || MODES.scatter;
    var last = 0;
    function loop(now) {
      if (!running) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now; t += dt;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    if (!size()) return;
    seed();
    draw(0.016);

    var ro = window.ResizeObserver ? new ResizeObserver(function () {
      if (size()) { seed(); draw(0.016); }
    }) : null;
    if (ro) ro.observe(cv);

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.01 }).observe(cv);
    } else start();

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) stop();
  }

  function boot() {
    var list = document.querySelectorAll('canvas[data-dots]');
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      Dots(c, c.getAttribute('data-dots'), {
        accent: c.getAttribute('data-accent') || undefined,
        water: c.getAttribute('data-water') || undefined,
        base: c.getAttribute('data-base') || undefined,
        cx: parseFloat(c.getAttribute('data-cx')) || undefined,
        cy: parseFloat(c.getAttribute('data-cy')) || undefined,
        max: parseInt(c.getAttribute('data-max'), 10) || undefined
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.MEDots = Dots;
  window.MEDotsBoot = boot;
})();
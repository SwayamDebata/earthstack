/* ─────────────────────────────────────────────────────────────
   MEMotion · timeline-driven motion graphics, written by hand.

   Each set piece is a scene function that renders a whole frame
   from one normalised time t (0..1). The runner gives every scene
   a loop, an IntersectionObserver so it only runs on screen, a
   scrub bar, a play/pause control, and a reduced-motion still.

   Usage:  <div data-mg="score" data-dur="13"></div>
   Scenes: density · score · leadtime · sentence
   ───────────────────────────────────────────────────────────── */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // segment helper: maps global t onto a 0..1 ramp between a and b
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function outCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function fmt(v, d) { return v.toFixed(d === undefined ? 0 : d); }

  // The accent lives in site.css. Read it from there so the page theme and the
  // data-me-accent alternates drive this engine too, instead of a second copy
  // of the hue drifting out of sync in here.
  function cssAccent(name, fallback) {
    try {
      var root = document.querySelector('.me-root');
      if (!root) return fallback;
      var v = getComputedStyle(root).getPropertyValue(name).trim();
      return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
    } catch (e) { return fallback; }
  }

  var C = {
    bone: '#EDE9DE', text: '#C9C4B4', ash: '#9A9584', dim: '#6B6857',
    line: '#2A2C21', line2: '#3A3D2F', panel: '#14160E', panel2: '#191B12',
    amber: cssAccent('--art-accent-hi', '#7FBB7F'),
    laterite: cssAccent('--art-accent', '#5A9A43'),
    water: '#4FA89C', green: '#7FB08A', steel: '#8E9A93'
  };
  var MONO = 'JetBrains Mono, ui-monospace, monospace';
  var DISP = 'Instrument Sans, system-ui, sans-serif';

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, o) {
    o = o || {};
    var n = el('text', {
      x: x, y: y, fill: o.fill || C.ash, 'font-family': o.mono === false ? DISP : MONO,
      'font-size': o.size || 11, 'letter-spacing': o.ls === undefined ? '.1em' : o.ls,
      'text-anchor': o.anchor || 'start', 'font-weight': o.weight || 400
    }, parent);
    n.textContent = s;
    return n;
  }

  /* ══════════ SCENE 1 · measurement density ══════════ */
  function density(host) {
    var svg = el('svg', { viewBox: '0 0 1000 300', width: '100%', style: 'width:100%;height:auto;display:block', role: 'img',
      'aria-label': 'Measurement density building up on a thick basin and a thin one' }, host);
    el('rect', { x: 0, y: 0, width: 500, height: 300, fill: C.water, opacity: .04 }, svg);
    el('rect', { x: 500, y: 0, width: 500, height: 300, fill: C.laterite, opacity: .04 }, svg);
    el('path', { d: 'M500 0 V300', stroke: C.line, 'stroke-dasharray': '5 5' }, svg);

    var L = [], R = [], i;
    var gl = el('g', {}, svg), gr = el('g', {}, svg);
    for (i = 0; i < 220; i++) {
      L.push(el('circle', { cx: 30 + (i % 20) * 23, cy: 120 + Math.floor(i / 20) * 16 + (i % 3) * 3,
        r: 2, fill: C.water, opacity: 0 }, gl));
    }
    for (i = 0; i < 9; i++) {
      R.push(el('circle', { cx: 560 + (i % 3) * 130, cy: 140 + Math.floor(i / 3) * 52,
        r: 2, fill: C.laterite, opacity: 0 }, gr));
    }
    var live = el('circle', { cx: 690, cy: 192, r: 6, fill: C.amber, opacity: 0 }, svg);
    var ring = el('circle', { cx: 690, cy: 192, r: 6, fill: 'none', stroke: C.amber, 'stroke-width': 1, opacity: 0 }, svg);

    txt(svg, 30, 44, 'WHERE THE PLATFORMS WORK', { fill: C.water, size: 11.5 });
    txt(svg, 530, 44, 'WHERE WE WORK', { fill: C.laterite, size: 11.5 });
    var nL = txt(svg, 30, 90, '0', { fill: C.bone, size: 40, mono: false, weight: 700, ls: '-.03em' });
    var nR = txt(svg, 530, 90, '0', { fill: C.bone, size: 40, mono: false, weight: 700, ls: '-.03em' });
    txt(svg, 30, 274, 'ROUTINE OBSERVATIONS REACHING THE ENGINE, PER CYCLE', { fill: C.dim, size: 10 });
    var tag = txt(svg, 706, 196, '', { fill: C.amber, size: 11 });

    return function (t) {
      var a = ease(seg(t, 0.05, 0.62));
      var b = ease(seg(t, 0.05, 0.80));
      for (var i = 0; i < L.length; i++) {
        var f = clamp(a * L.length - i, 0, 1);
        L[i].setAttribute('opacity', (0.75 * f).toFixed(3));
      }
      for (var j = 0; j < R.length; j++) {
        var g = clamp(b * R.length - j, 0, 1);
        R[j].setAttribute('opacity', (0.8 * g).toFixed(3));
      }
      nL.textContent = fmt(a * 220);
      nR.textContent = fmt(b * 9);
      var lv = seg(t, 0.72, 0.88);
      live.setAttribute('opacity', lv.toFixed(2));
      ring.setAttribute('opacity', (lv * 0.5 * (1 - (t * 3 % 1))).toFixed(3));
      ring.setAttribute('r', (6 + 16 * (t * 3 % 1)).toFixed(1));
      tag.textContent = lv > 0.6 ? '1 LIVE GAUGE' : '';
    };
  }

  /* ══════════ SCENE 2 · how a score is made ══════════ */
  function score(host) {
    var svg = el('svg', { viewBox: '0 0 1000 430', width: '100%', style: 'width:100%;height:auto;display:block', role: 'img',
      'aria-label': 'A flood score assembling from rainfall, antecedent rain and forecast, with the river term rejected' }, host);
    var rows = [
      { k: 'RAIN 6 h', v: 78, u: ' mm', col: C.laterite, w: .82, a: .04, b: .20 },
      { k: 'p95 BASELINE', v: 41, u: ' mm', col: C.line2, w: .43, a: .10, b: .24 },
      { k: 'ANTECEDENT', v: 3, u: ' wet d', col: C.amber, w: .64, a: .24, b: .40 },
      { k: 'FORECAST 24 h', v: 46, u: ' mm', col: C.water, w: .56, a: .40, b: .56 }
    ];
    var bars = [], vals = [];
    rows.forEach(function (r, i) {
      var y = 60 + i * 46;
      txt(svg, 20, y + 13, r.k, { fill: C.dim, size: 10.5 });
      el('rect', { x: 150, y: y, width: 420, height: 18, fill: C.panel2 }, svg);
      bars.push(el('rect', { x: 150, y: y, width: 0, height: 18, fill: r.col }, svg));
      vals.push(txt(svg, 600, y + 13, '', { fill: C.bone, size: 11.5, anchor: 'end' }));
    });

    // river row, gated
    var ry = 60 + 4 * 46;
    txt(svg, 20, ry + 13, 'RIVER LEVEL', { fill: C.dim, size: 10.5 });
    el('rect', { x: 150, y: ry, width: 420, height: 18, fill: C.panel2 }, svg);
    var rbar = el('rect', { x: 150, y: ry, width: 0, height: 18, fill: C.steel, opacity: .5 }, svg);
    var stamp = el('g', { opacity: 0 }, svg);
    el('rect', { x: 150, y: ry - 2, width: 300, height: 22, fill: 'none',
      stroke: C.laterite, 'stroke-width': 1.4 }, stamp);
    txt(stamp, 160, ry + 13, 'NOT LIVE  ·  CONTRIBUTES NOTHING', { fill: C.laterite, size: 11 });
    var rval = txt(svg, 600, ry + 13, '', { fill: C.dim, size: 11.5, anchor: 'end' });

    // dial
    var cx = 810, cy = 150, R = 78;
    el('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: C.line, 'stroke-width': 12 }, svg);
    var arc = el('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: C.green, 'stroke-width': 12,
      'stroke-linecap': 'butt', transform: 'rotate(-90 ' + cx + ' ' + cy + ')',
      'stroke-dasharray': (2 * Math.PI * R).toFixed(1), 'stroke-dashoffset': (2 * Math.PI * R).toFixed(1) }, svg);
    var num = txt(svg, cx, cy + 10, '0.00', { fill: C.bone, size: 38, mono: false, weight: 700, anchor: 'middle', ls: '-.03em' });
    var sev = txt(svg, cx, cy + 40, 'LOW', { fill: C.green, size: 13, anchor: 'middle', ls: '.16em' });
    txt(svg, cx, cy - 96, 'rule_score', { fill: C.dim, size: 10.5, anchor: 'middle' });

    // threshold ticks
    [[0.40, 'MEDIUM'], [0.60, 'HIGH']].forEach(function (p) {
      var ang = -Math.PI / 2 + p[0] * 2 * Math.PI;
      el('path', { d: 'M' + (cx + Math.cos(ang) * (R - 10)) + ' ' + (cy + Math.sin(ang) * (R - 10)) +
        ' L' + (cx + Math.cos(ang) * (R + 10)) + ' ' + (cy + Math.sin(ang) * (R + 10)),
        stroke: C.void || '#0A0B08', 'stroke-width': 2 }, svg);
    });

    // action line
    var act = el('g', { opacity: 0 }, svg);
    el('rect', { x: 20, y: 336, width: 960, height: 66, fill: '#1A1009' }, act);
    el('rect', { x: 20, y: 336, width: 3, height: 66, fill: C.laterite }, act);
    txt(act, 40, 360, 'SUGGESTED ACTION', { fill: C.laterite, size: 10 });
    var actTxt = txt(act, 40, 386, '', { fill: C.bone, size: 15, mono: false, ls: '0' });
    var ACT = 'Pre-position at Naraj. Alert wards 4 to 9. Rainfall-only read, so treat river state as unknown.';

    return function (t) {
      rows.forEach(function (r, i) {
        var p = outCubic(seg(t, r.a, r.b));
        bars[i].setAttribute('width', (420 * r.w * p).toFixed(1));
        vals[i].textContent = p > 0.02 ? fmt(r.v * p, r.v < 10 ? 0 : 0) + r.u : '';
      });
      var rp = outCubic(seg(t, 0.56, 0.66));
      rbar.setAttribute('width', (420 * 0.5 * rp * (1 - seg(t, 0.66, 0.72))).toFixed(1));
      stamp.setAttribute('opacity', seg(t, 0.66, 0.74).toFixed(2));
      rval.textContent = t > 0.74 ? 'n/a' : '';

      var s = outCubic(seg(t, 0.60, 0.86)) * 0.71;
      arc.setAttribute('stroke-dashoffset', (2 * Math.PI * 78 * (1 - s)).toFixed(1));
      arc.setAttribute('stroke', s >= 0.60 ? C.laterite : s >= 0.40 ? C.amber : C.green);
      num.textContent = s.toFixed(2);
      sev.textContent = s >= 0.60 ? 'HIGH' : s >= 0.40 ? 'MEDIUM' : 'LOW';
      sev.setAttribute('fill', s >= 0.60 ? C.laterite : s >= 0.40 ? C.amber : C.green);

      var ap = seg(t, 0.86, 1.0);
      act.setAttribute('opacity', clamp(ap * 3, 0, 1).toFixed(2));
      actTxt.textContent = ACT.slice(0, Math.round(ACT.length * outCubic(ap)));
    };
  }

  /* ══════════ SCENE 3 · the 48 hours, and the miss ══════════ */
  function leadtime(host) {
    var svg = el('svg', { viewBox: '0 0 1000 400', width: '100%', style: 'width:100%;height:auto;display:block', role: 'img',
      'aria-label': 'A playhead crossing the August 2026 event: rainfall, river stage, and what the engine said' }, host);
    var X0 = 60, X1 = 960;
    function X(u) { return X0 + (X1 - X0) * u; }

    el('path', { d: 'M' + X0 + ' 150 H' + X1, stroke: C.line }, svg);
    txt(svg, X0, 30, 'RAINFALL', { fill: '#3E5B66', size: 10.5 });

    var RB = [];
    var hs = [38, 56, 98, 116, 84, 48, 24, 12, 8, 4, 3, 2, 2, 1, 1, 1, 1, 1];
    hs.forEach(function (h, i) {
      RB.push({ n: el('rect', { x: X0 + 10 + i * 50, y: 150 - h, width: 28, height: h, fill: '#3E5B66', opacity: 0 }, svg),
                u: i / hs.length });
    });

    // river stage
    var RIVER = 'M60 300 C 140 298, 200 288, 268 262 C 330 238, 380 208, 448 194 C 520 180, 580 178, 650 184 C 730 191, 800 200, 880 214 C 960 228, 1010 244, 1010 250';
    var uid = 'ltc' + Math.random().toString(36).slice(2, 8);
    var defs = el('defs', {}, svg);
    var cp = el('clipPath', { id: uid }, defs);
    var cpR = el('rect', { x: 0, y: 0, width: 0, height: 400 }, cp);
    var rivG = el('g', { 'clip-path': 'url(#' + uid + ')' }, svg);
    el('path', { d: RIVER, stroke: C.water, 'stroke-width': 2.6, fill: 'none' }, rivG);
    el('path', { d: 'M' + X0 + ' 200 H' + X1, stroke: C.laterite, 'stroke-width': 1.3, 'stroke-dasharray': '6 5' }, svg);
    txt(svg, X0 + 6, 194, 'DANGER LEVEL 18.33 m', { fill: C.laterite, size: 10.5 });

    // severity band
    var SEG = [[0, .16, C.green, 'LOW'], [.16, .28, C.amber, 'MEDIUM'], [.28, .52, C.laterite, 'HIGH'],
               [.52, .66, C.amber, 'MEDIUM'], [.66, 1, C.green, 'LOW']];
    var bandG = el('g', {}, svg), bands = [];
    SEG.forEach(function (s) {
      var x = X(s[0]), w = X(s[1]) - x;
      var g = el('g', { opacity: 0 }, bandG);
      el('rect', { x: x, y: 320, width: w, height: 30, fill: s[2], opacity: .22 }, g);
      el('rect', { x: x, y: 320, width: w, height: 30, fill: 'none', stroke: s[2], 'stroke-width': 1 }, g);
      txt(g, x + w / 2, 340, s[3], { fill: s[2], size: 11, anchor: 'middle' });
      bands.push({ g: g, u: s[0] });
    });
    txt(svg, X0, 312, 'WHAT THE ENGINE SAID', { fill: C.dim, size: 10.5 });

    // playhead
    var ph = el('path', { d: 'M0 24 V360', stroke: C.bone, 'stroke-width': 1.2, opacity: .8 }, svg);
    var phDot = el('circle', { cx: 0, cy: 24, r: 4, fill: C.bone }, svg);

    // callouts
    function callout(x, y, label, col) {
      var g = el('g', { opacity: 0 }, svg);
      el('circle', { cx: x, cy: y, r: 5, fill: col }, g);
      txt(g, x + 12, y - 20, label, { fill: col, size: 11 });
      return g;
    }
    var cHigh = callout(X(.28), 320, 'HIGH FIRES · 48 h BEFORE ONSET · 6 / 6', C.bone);
    var cOnset = callout(X(.43), 194, 'ONSET · RIVER ABOVE DANGER', C.laterite);
    var cMiss = el('g', { opacity: 0 }, svg);
    el('rect', { x: X(.62), y: 232, width: 296, height: 56, fill: C.laterite }, cMiss);
    txt(cMiss, X(.62) + 14, 254, 'RAIN STOPS. WATER DOES NOT.', { fill: '#FBF3E6', size: 11 });
    txt(cMiss, X(.62) + 14, 274, '14 OF 18 LOCATION-DAYS SCORED LOW', { fill: '#FBF3E6', size: 11 });

    var dates = ['14 AUG', '17 AUG', '19 AUG', '21 AUG'];
    dates.forEach(function (d, i) {
      txt(svg, X(i / (dates.length - 1)), 384, d, { fill: C.dim, size: 10.5,
        anchor: i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle' });
    });

    return function (t) {
      var u = ease(seg(t, 0.04, 0.92));
      var px = X(u);
      ph.setAttribute('d', 'M' + px + ' 24 V360');
      phDot.setAttribute('cx', px);
      RB.forEach(function (b) { b.n.setAttribute('opacity', b.u < u ? '0.9' : '0'); });
      cpR.setAttribute('width', px.toFixed(1));
      bands.forEach(function (b) { b.g.setAttribute('opacity', b.u < u ? '1' : '0'); });
      cHigh.setAttribute('opacity', clamp((u - 0.28) * 12, 0, 1).toFixed(2));
      cOnset.setAttribute('opacity', clamp((u - 0.43) * 12, 0, 1).toFixed(2));
      cMiss.setAttribute('opacity', clamp((u - 0.68) * 10, 0, 1).toFixed(2));
    };
  }

  /* ══════════ SCENE 4 · dossier collapsing to one sentence ══════════ */
  function sentence(host) {
    var svg = el('svg', { viewBox: '0 0 1000 268', width: '100%',
      style: 'width:100%;height:auto;display:block', role: 'img',
      'aria-label': 'A dossier of numbers being swallowed one by one, leaving a single spoken sentence' }, host);
    var LINES = ['rule_score  0.71', '78 mm / 6 h', 'p95 baseline  41 mm', 'antecedent  3 wet days',
                 'forecast  +46 mm / 24 h', 'river  n/a  not live', 'nearest match  653 events'];
    var rowsG = [];
    LINES.forEach(function (s, i) {
      var g = el('g', {}, svg);
      var y = 52 + i * 26;
      el('rect', { x: 30, y: y, width: 300, height: 20, fill: C.panel2, stroke: C.line }, g);
      txt(g, 40, y + 14, s, { fill: C.text, size: 11 });
      rowsG.push({ g: g, y: y });
    });
    txt(svg, 30, 34, 'WHAT THE OFFICER GETS', { fill: C.dim, size: 10 });
    txt(svg, 560, 34, 'WHAT THE HOUSEHOLD GETS', { fill: C.amber, size: 10 });

    // the funnel: rows are drawn toward this point before the sentence lands
    var arrow = el('path', { d: 'M340 140 H540', stroke: C.line2, 'stroke-width': 1.3,
      'stroke-dasharray': 200, 'stroke-dashoffset': 200 }, svg);
    var head = el('path', { d: 'M534 134 l8 6 -8 6', stroke: C.line2, 'stroke-width': 1.3,
      fill: 'none', opacity: 0 }, svg);

    var od = el('text', { x: 560, y: 106, fill: C.bone,
      'font-family': "'Noto Sans Oriya', sans-serif", 'font-size': 25, opacity: 0 }, svg);
    od.textContent = 'ଆଜି ରାତିରେ ପାଣି ବଢ଼ିବ।';
    var en = txt(svg, 560, 138, '', { fill: C.ash, size: 14, mono: false, ls: '0' });
    var EN = 'The water will rise tonight.';
    var act = txt(svg, 560, 172, '', { fill: C.green, size: 13.5, mono: false, ls: '0' });
    var ACT = 'Move the grain above waist height.';

    var wave = el('g', { opacity: 0 }, svg);
    for (var i = 0; i < 20; i++) el('rect', { x: 560 + i * 11, y: 198, width: 4, height: 5, fill: C.green }, wave);
    var wr = wave.childNodes;
    var foot = txt(svg, 30, 252, '', { fill: C.dim, size: 10 });
    var FOOT = 'ONE ENGINE. THE DETAIL IS NOT HIDDEN, IT IS JUST NOT WHAT A HOUSEHOLD NEEDS AT 03:00.';

    return function (t) {
      // each row is swallowed in turn, and is fully gone before the next starts
      rowsG.forEach(function (r, i) {
        var a0 = 0.10 + i * 0.045, a1 = a0 + 0.10;
        var k = ease(seg(t, a0, a1));
        r.g.setAttribute('transform',
          'translate(' + (150 * k).toFixed(1) + ',' + ((140 - r.y) * 0.55 * k).toFixed(1) + ')');
        r.g.setAttribute('opacity', (1 - k).toFixed(3));
      });
      var ar = ease(seg(t, 0.30, 0.52));
      arrow.setAttribute('stroke-dashoffset', (200 * (1 - ar)).toFixed(0));
      head.setAttribute('opacity', seg(t, 0.50, 0.56).toFixed(2));
      od.setAttribute('opacity', ease(seg(t, 0.52, 0.68)).toFixed(2));
      var e = seg(t, 0.62, 0.76); en.textContent = EN.slice(0, Math.round(EN.length * e));
      var ac = seg(t, 0.72, 0.86); act.textContent = ACT.slice(0, Math.round(ACT.length * ac));
      var w = seg(t, 0.78, 0.98);
      wave.setAttribute('opacity', w.toFixed(2));
      for (var i = 0; i < wr.length; i++) {
        var h = w > 0 ? 4 + 18 * Math.abs(Math.sin(t * 26 + i * 0.7)) : 4;
        wr[i].setAttribute('height', h.toFixed(1));
        wr[i].setAttribute('y', (212 - h).toFixed(1));
      }
      var fp = seg(t, 0.86, 1.0);
      foot.textContent = FOOT.slice(0, Math.round(FOOT.length * fp));
    };
  }

  var SCENES = { density: density, score: score, leadtime: leadtime, sentence: sentence };

  /* ══════════ runner ══════════ */
  function mount(host) {
    var name = host.getAttribute('data-mg');
    var build = SCENES[name];
    if (!build) return;
    var dur = parseFloat(host.getAttribute('data-dur')) || 12;

    var stage = document.createElement('div');
    stage.style.cssText = 'position:relative';
    host.appendChild(stage);
    var render = build(stage);

    var ctl = document.createElement('div');
    ctl.style.cssText = 'display:flex;align-items:center;gap:14px;margin-top:16px;' +
      'padding-top:14px;border-top:1px solid ' + C.line;
    ctl.innerHTML =
      '<button type="button" aria-label="Play or pause" style="appearance:none;border:1px solid ' + C.line2 +
      ';background:transparent;color:' + C.ash + ';font:400 10px/1 ' + JSON.stringify(MONO) +
      ';letter-spacing:.14em;padding:7px 12px;border-radius:999px;cursor:pointer">PAUSE</button>' +
      '<div style="flex:1;height:2px;background:' + C.line + ';position:relative">' +
      '<div style="position:absolute;inset:0 100% 0 0;background:' + C.amber + '"></div></div>' +
      '<span style="font:400 10px/1 ' + JSON.stringify(MONO) + ';letter-spacing:.14em;color:' + C.dim +
      '">MOTION &middot; ' + name.toUpperCase() + '</span>';
    host.appendChild(ctl);
    var btn = ctl.querySelector('button'), fill = ctl.querySelector('div > div');

    var t = 0, playing = false, raf = 0, last = 0, visible = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function frame(now) {
      if (!playing) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt / dur;
      if (t > 1.14) t = 0;                 // hold on the finished frame, then loop
      render(Math.min(1, t));
      fill.style.right = (100 - Math.min(1, t) * 100).toFixed(1) + '%';
      raf = requestAnimationFrame(frame);
    }
    function play() { if (playing || reduce) return; playing = true; last = 0; raf = requestAnimationFrame(frame); btn.textContent = 'PAUSE'; }
    function pause() { playing = false; cancelAnimationFrame(raf); btn.textContent = 'PLAY'; }

    btn.addEventListener('click', function () { playing ? pause() : (visible && play()); });

    render(reduce ? 1 : 0);
    if (reduce) { btn.textContent = 'PLAY'; fill.style.right = '0%'; }

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible) play(); else pause();
        });
      }, { threshold: 0.25 }).observe(host);
    } else { visible = true; play(); }
  }

  function boot() {
    var list = document.querySelectorAll('[data-mg]');
    for (var i = 0; i < list.length; i++) mount(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.MEMotion = { mount: mount, boot: boot };
})();
'use client';

import { useEffect, useRef, useState } from 'react';

/* ==========================================================================
   The Mahanadi flythrough.

   Real geography: the bounding box, the five city coordinates and the three
   river courses are true positions. The relief is interpolated from documented
   spot elevations (not a DEM).

   Ported from the Route D prototype. No libraries: raw WebGL, one point cloud,
   a keyframed camera driven by window scroll.
   ========================================================================== */

type Terrain = {
  lon0: number;
  lon1: number;
  lat0: number;
  lat1: number;
  nx: number;
  ny: number;
  cities: { n: string; lat: number; lon: number; r: string }[];
  rivers: [number, number][][];
  h_b64: string;
};

/* The hero tells the positioning, not a defence of the rendering. The scene is
   a real basin, and the copy uses that as the ground the planetary claim lands
   on, rather than arguing about whether the terrain is genuine. Every figure
   here is already published and labelled elsewhere on the site. */
const BEATS = [
  {
    kicker: 'ModelEarth · planetary-scale resilience intelligence',
    title: 'Earth is already instrumented. The warning still does not arrive.',
    body: 'Satellites overhead, gauges in the water, thirty years of record on disk. Observation stopped being the hard part decades ago. What is missing is the layer that turns all of it into a decision somebody can act on tonight.',
    a: 0.0,
    b: 0.2,
  },
  {
    kicker: '02 · the climate intelligence layer',
    title: 'We sit between the observation and the decision.',
    body: 'One engine takes what the sky, the rivers and the historical record already know, resolves it against each location’s own thirty-year baseline, and issues a call with the reasoning attached. Hazard-agnostic by design.',
    a: 0.24,
    b: 0.44,
  },
  {
    kicker: '03 · planetary resilience intelligence',
    title: 'Planetary means the ungauged parts too.',
    body: 'Most of the world’s rivers have no reliable gauge and no local model, and that is exactly where a warning is worth the most. This is built to make a defensible call from a thin record, and to sharpen as the record fills in.',
    a: 0.5,
    b: 0.72,
  },
  {
    kicker: '04 · resilience',
    title: 'Measured in hours of warning, not points of accuracy.',
    body: 'The unit that matters is lead time: the hours a district gets to move people and grain before the water arrives. That is the number this whole system exists to produce.',
    a: 0.78,
    b: 1.0,
  },
];

const BEAT_NAMES = ['01 · HIRAKUD', '02 · SONEPUR REACH', '03 · CUTTACK · NARAJ', '04 · THE DELTA'];

export default function HeroTerrain() {
  const secRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hudRef = useRef<{ alt: HTMLElement | null; beat: HTMLElement | null }>({
    alt: null,
    beat: null,
  });

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current;
    const sec = secRef.current;
    if (!cv || !sec) return;

    let raf = 0;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    const gl = cv.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) {
      setFailed(true);
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      let T: Terrain;
      try {
        const res = await fetch('/terrain/mahanadi.json');
        if (!res.ok) throw new Error(String(res.status));
        T = (await res.json()) as Terrain;
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed) return;

      /* ---- decode the Int16 heightfield ---- */
      const bin = atob(T.h_b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const H = new Int16Array(bytes.buffer);
      const NX = T.nx;
      const NY = T.ny;

      /* ---- geographic → world km, origin at box centre ---- */
      const latC = (T.lat0 + T.lat1) / 2;
      const lonC = (T.lon0 + T.lon1) / 2;
      const KX = 111.32 * Math.cos((latC * Math.PI) / 180);
      const KY = 110.57;
      const VE = 14; // vertical exaggeration, stated on the page

      const wx = (lon: number) => (lon - lonC) * KX;
      const wz = (lat: number) => -(lat - latC) * KY;
      const wy = (m: number) => (m * VE) / 1000;
      const lonAt = (i: number) => T.lon0 + ((T.lon1 - T.lon0) * i) / (NX - 1);
      const latAt = (j: number) => T.lat1 + ((T.lat0 - T.lat1) * j) / (NY - 1);

      const hAt = (i: number, j: number) =>
        H[Math.max(0, Math.min(NY - 1, j)) * NX + Math.max(0, Math.min(NX - 1, i))];

      const hBilinear = (lat: number, lon: number) => {
        const fi = ((lon - T.lon0) / (T.lon1 - T.lon0)) * (NX - 1);
        const fj = ((T.lat1 - lat) / (T.lat1 - T.lat0)) * (NY - 1);
        const i = Math.floor(fi);
        const j = Math.floor(fj);
        const u = fi - i;
        const v = fj - j;
        return (
          hAt(i, j) * (1 - u) * (1 - v) +
          hAt(i + 1, j) * u * (1 - v) +
          hAt(i, j + 1) * (1 - u) * v +
          hAt(i + 1, j + 1) * u * v
        );
      };

      /* ---- build the point cloud ---- */
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      // Density costs memory more than frame time; halve it on small screens.
      const PER = window.innerWidth < 900 ? 2 : 4;

      const SUN = (() => {
        const v = [-0.62, 0.52, -0.59];
        const L = Math.hypot(v[0], v[1], v[2]);
        return [v[0] / L, v[1] / L, v[2] / L];
      })();

      const shadeAt = (lat: number, lon: number) => {
        const e = 0.022;
        const hx = ((hBilinear(lat, lon + e) - hBilinear(lat, lon - e)) / 1000) * VE;
        const hz = ((hBilinear(lat + e, lon) - hBilinear(lat - e, lon)) / 1000) * VE;
        const nx = -hx / (2 * e * KX);
        const nz = hz / (2 * e * KY);
        const L = Math.hypot(nx, 1, nz) || 1;
        const d = (nx / L) * SUN[0] + (1 / L) * SUN[1] + (nz / L) * SUN[2];
        return 0.16 + 1.75 * Math.max(0, d);
      };

      const PP: number[] = [];
      const PC: number[] = [];
      const PS: number[] = [];

      for (let j = 0; j < NY; j++) {
        for (let i = 0; i < NX; i++) {
          for (let k = 0; k < PER; k++) {
            const jj = j + (k ? rnd(-0.5, 0.5) : 0);
            const ii = i + (k ? rnd(-0.5, 0.5) : 0);
            const lat = latAt(jj);
            const lon = lonAt(ii);
            const h = hBilinear(lat, lon);

            if (h <= 0.5) {
              // sea and open water: not slope-shaded
              const d0 = Math.min(1, -h / 40);
              PP.push(wx(lon), wy(h), wz(lat));
              PC.push(0.16 + 0.10 * (1 - d0), 0.62 - 0.18 * d0, 0.64 - 0.14 * d0);
              PS.push(0.9 * rnd(0.8, 1.2));
              continue;
            }

            // Land holds a constant mid luminance and shifts hue with height.
            // Tying brightness to elevation rendered the valley floor, most of
            // what the camera flies over, almost black.
            //
            // Green, not ochre: the land is the biggest surface in the frame,
            // so it is where the brand actually lands, and it puts this scene
            // in the same world as the Journey valley. Each stop holds the
            // luminance of the warm ramp it replaces, which is what kept the
            // terrain from washing into the sky. The sky stays warm on purpose:
            // dawn light is warm, and a green sky reads as bad weather.
            //
            // The ramp is deliberately muted and a little darker than the ochre
            // it replaces. Against ochre the cyan river separated on hue, because
            // orange and cyan are opposites; against green they are neighbours,
            // so the separation has to be bought back with luminance and
            // saturation instead. The river is the one vivid thing in frame.
            const e = Math.min(1, h / 700);
            const shd = shadeAt(lat, lon);
            PP.push(wx(lon), wy(h), wz(lat));
            PC.push(
              Math.min(1, (0.14 + 0.32 * e) * shd),
              Math.min(1, (0.23 + 0.33 * e) * shd),
              Math.min(1, (0.13 + 0.17 * e) * shd),
            );
            PS.push(rnd(0.82, 1.2));
          }
        }
      }

      // extra density along the river courses so the reach reads clearly
      for (const riv of T.rivers) {
        for (let a = 0; a < riv.length - 1; a++) {
          for (let t = 0; t < 90; t++) {
            const f = t / 90;
            const lat = riv[a][0] + (riv[a + 1][0] - riv[a][0]) * f;
            const lon = riv[a][1] + (riv[a + 1][1] - riv[a][1]) * f;
            for (let q = 0; q < 5; q++) {
              const la = lat + rnd(-0.035, 0.035);
              const lo = lon + rnd(-0.035, 0.035);
              PP.push(wx(lo), wy(hBilinear(la, lo)) + 0.02, wz(la));
              PC.push(0.34, 0.98, 0.98);
              PS.push(rnd(0.9, 1.5));
            }
          }
        }
      }

      const COUNT = PS.length;
      if (disposed) return;

      /* ---- shaders ---- */
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.warn(gl.getShaderInfoLog(s));
          return null;
        }
        return s;
      };

      const VS = `
        attribute vec3 aPos; attribute vec3 aCol; attribute float aSz;
        uniform mat4 uMVP; uniform vec3 uCam; uniform float uPx;
        varying vec3 vCol; varying float vFog;
        void main(){
          vec4 p = uMVP * vec4(aPos,1.0);
          float d = length(aPos - uCam);
          gl_Position = p;
          gl_PointSize = clamp(uPx * aSz * (22.0/d), 1.0, 3.6);
          float far = exp(-pow(d*0.0082,1.55));
          float near = smoothstep(0.6, 3.5, d);
          vFog = clamp(far * near, 0.0, 1.0);
          vCol = aCol;
        }`;

      const FS = `
        precision mediump float;
        varying vec3 vCol; varying float vFog;
        uniform vec3 uFog;
        void main(){
          vec2 c = gl_PointCoord - vec2(0.5);
          if (dot(c,c) > 0.25) discard;
          gl_FragColor = vec4(mix(uFog, vCol, vFog), 1.0);
        }`;

      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)!);
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)!);
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.bindAttribLocation(prog, 1, 'aCol');
      gl.bindAttribLocation(prog, 2, 'aSz');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn(gl.getProgramInfoLog(prog));
        if (!disposed) setFailed(true);
        return;
      }

      /* ---- sky: fullscreen tri shaded against the projected horizon ---- */
      const skyProg = (() => {
        const vs = `attribute vec2 aXY; varying vec2 vUV;
          void main(){ vUV = aXY*0.5+0.5; gl_Position = vec4(aXY,0.999,1.0); }`;
        const fs = `precision mediump float; varying vec2 vUV; uniform float uHor;
          void main(){
            float y = vUV.y;
            float a = clamp((y - uHor) / max(0.001, 1.0 - uHor), 0.0, 1.0);
            // Deep navy at the zenith falling to a bright, narrow amber band
            // sitting on the horizon: the light is concentrated there, which is
            // what keeps the sky luminous without lifting the whole frame.
            vec3 hi   = vec3(0.035, 0.075, 0.150);
            vec3 mid  = vec3(0.105, 0.125, 0.165);
            vec3 warm = vec3(0.600, 0.500, 0.250);
            vec3 col = mix(warm, mid, smoothstep(0.0, 0.34, a));
            col = mix(col, hi, smoothstep(0.28, 1.0, a));
            // a soft, wide bloom rather than a hard stripe on the horizon line
            col += vec3(0.22, 0.19, 0.08) * pow(1.0 - clamp(abs(y - uHor) * 4.2, 0.0, 1.0), 1.7);

            // Below the horizon this quad is the ground the point cloud sits on,
            // and it is what shows in the gaps between points. Keep it dark, or
            // the terrain and the sky read as one wash.
            float b = clamp((uHor - y) / max(0.001, uHor), 0.0, 1.0);
            vec3 farGround  = vec3(0.090, 0.170, 0.080);
            vec3 nearGround = vec3(0.030, 0.040, 0.028);
            col = mix(col, farGround, smoothstep(0.0, 0.05, b));
            col = mix(col, nearGround, smoothstep(0.04, 0.55, b));
            gl_FragColor = vec4(col,1.0);
          }`;
        const pr = gl.createProgram()!;
        gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)!);
        gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)!);
        gl.bindAttribLocation(pr, 0, 'aXY');
        gl.linkProgram(pr);
        const vb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        return { p: pr, b: vb, uHor: gl.getUniformLocation(pr, 'uHor') };
      })();

      const buf = (arr: number[], loc: number, size: number) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        return b;
      };
      const bPos = buf(PP, 0, 3);
      const bCol = buf(PC, 1, 3);
      const bSz = buf(PS, 2, 1);

      const uMVP = gl.getUniformLocation(prog, 'uMVP');
      const uCam = gl.getUniformLocation(prog, 'uCam');
      const uPx = gl.getUniformLocation(prog, 'uPx');
      const uFog = gl.getUniformLocation(prog, 'uFog');
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0.040, 0.036, 0.030, 1);

      /* ---- matrices ---- */
      const persp = (f: number, a: number, near: number, far: number) => {
        const t = 1 / Math.tan(f / 2);
        const nf = 1 / (near - far);
        return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
      };
      const look = (e: number[], c: number[], up: number[]) => {
        const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const nrm = (v: number[]) => {
          const l = Math.hypot(v[0], v[1], v[2]) || 1;
          return [v[0] / l, v[1] / l, v[2] / l];
        };
        const crs = (a: number[], b: number[]) => [
          a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0],
        ];
        const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const z = nrm(sub(e, c));
        const x = nrm(crs(up, z));
        const y = crs(z, x);
        return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
      };
      const mul = (a: number[], b: number[]) => {
        const o = new Array(16);
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < 4; c++) {
            let s = 0;
            for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
            o[c * 4 + r] = s;
          }
        return o;
      };

      /* ---- camera keyframed along the real Mahanadi course ---- */
      const MR = T.rivers[0];
      const riverAt = (t: number) => {
        const f = Math.max(0, Math.min(0.999, t)) * (MR.length - 1);
        const i = Math.floor(f);
        const u = f - i;
        const a = MR[i];
        const b = MR[Math.min(MR.length - 1, i + 1)];
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      };
      const KEY = [
        { t: 0.03, alt: 19, back: 30, drop: 5.0 },
        { t: 0.2, alt: 13, back: 22, drop: 3.2 },
        { t: 0.48, alt: 10, back: 17, drop: 2.2 },
        { t: 0.74, alt: 9, back: 15, drop: 1.8 },
        { t: 0.97, alt: 15, back: 24, drop: 3.6 },
      ];
      const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      const camAt = (p: number) => {
        const f = p * (KEY.length - 1);
        const i = Math.min(KEY.length - 2, Math.floor(f));
        const u = ease(f - i);
        const A = KEY[i];
        const B = KEY[i + 1];
        const rt = A.t + (B.t - A.t) * u;
        const alt = A.alt + (B.alt - A.alt) * u;
        const back = A.back + (B.back - A.back) * u;
        const drop = A.drop + (B.drop - A.drop) * u;
        const here = riverAt(rt);
        const ahead = riverAt(Math.min(1, rt + 0.09));
        const tx = wx(here[1]);
        const tz = wz(here[0]);
        let dx = wx(ahead[1]) - tx;
        let dz = wz(ahead[0]) - tz;
        const L = Math.hypot(dx, dz) || 1;
        dx /= L;
        dz /= L;
        return {
          eye: [tx - dx * back, alt, tz - dz * back],
          tgt: [tx + dx * 44, -drop, tz + dz * 44],
          lat: here[0],
          lon: here[1],
          alt,
        };
      };

      /* ---- city pins, projected each frame ---- */
      const PINS: { el: HTMLDivElement; x: number; y: number; z: number }[] = [];
      const pinWrap = pinsRef.current;
      if (pinWrap) {
        pinWrap.innerHTML = '';
        for (const c of T.cities) {
          const el = document.createElement('div');
          el.className = 'me-pin';
          el.innerHTML =
            '<span class="me-pin-dot"></span><span class="me-pin-lbl">' +
            c.n +
            '<span class="me-pin-sub">' +
            c.lat.toFixed(4) +
            '°N&nbsp;&nbsp;' +
            c.lon.toFixed(4) +
            '°E</span></span>';
          pinWrap.appendChild(el);
          PINS.push({ el, x: wx(c.lon), y: wy(hBilinear(c.lat, c.lon)) + 1.2, z: wz(c.lat) });
        }
      }

      /* ---- scroll → progress ---- */
      let W = 0;
      let Ht = 0;
      let DPR = 1;
      const resize = () => {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = cv.clientWidth;
        Ht = cv.clientHeight;
        cv.width = Math.round(W * DPR);
        cv.height = Math.round(Ht * DPR);
        gl.viewport(0, 0, cv.width, cv.height);
      };

      let prog01 = 0;
      let target01 = 0;
      const readScroll = () => {
        const rect = sec.getBoundingClientRect();
        const span = sec.offsetHeight - window.innerHeight;
        target01 = Math.max(0, Math.min(1, -rect.top / Math.max(1, span)));
      };

      const hud = hudRef.current;

      const frame = () => {
        if (disposed) return;
        prog01 += (target01 - prog01) * 0.12;
        const C = camAt(prog01);
        const P = persp((54 * Math.PI) / 180, W / Math.max(1, Ht), 0.4, 900);
        const MVP = mul(P, look(C.eye, C.tgt, [0, 1, 0]));

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // horizon in screen space: project a point at eye height, far ahead
        const fx = C.tgt[0] - C.eye[0];
        const fz = C.tgt[2] - C.eye[2];
        const fl = Math.hypot(fx, fz) || 1;
        const hxp = C.eye[0] + (fx / fl) * 620;
        const hzp = C.eye[2] + (fz / fl) * 620;
        const hcy = MVP[1] * hxp + MVP[5] * C.eye[1] + MVP[9] * hzp + MVP[13];
        const hcw = MVP[3] * hxp + MVP[7] * C.eye[1] + MVP[11] * hzp + MVP[15];
        const hor = Math.max(0.05, Math.min(0.95, hcw > 0.001 ? (hcy / hcw) * 0.5 + 0.5 : 0.55));

        gl.disable(gl.DEPTH_TEST);
        gl.useProgram(skyProg.p);
        gl.bindBuffer(gl.ARRAY_BUFFER, skyProg.b);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(skyProg.uHor, hor);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bCol);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bSz);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(uMVP, false, new Float32Array(MVP));
        gl.uniform3fv(uCam, new Float32Array(C.eye));
        gl.uniform1f(uPx, DPR * 1.25);
        gl.uniform3f(uFog, 0.170, 0.160, 0.100);
        gl.drawArrays(gl.POINTS, 0, COUNT);

        for (let i = 0; i < PINS.length; i++) {
          const p = PINS[i];
          const cx = MVP[0] * p.x + MVP[4] * p.y + MVP[8] * p.z + MVP[12];
          const cy = MVP[1] * p.x + MVP[5] * p.y + MVP[9] * p.z + MVP[13];
          const cw = MVP[3] * p.x + MVP[7] * p.y + MVP[11] * p.z + MVP[15];
          if (cw <= 0.01) {
            p.el.style.opacity = '0';
            continue;
          }
          const sx = ((cx / cw) * 0.5 + 0.5) * W;
          const sy = (1 - ((cy / cw) * 0.5 + 0.5)) * Ht;
          const on = sx > W * 0.5 && sx < W - 200 && sy > 90 && sy < Ht - 110 && prog01 > 0.3;
          const stagger = (i % 3) * 26 - 26;
          p.el.style.transform = `translate(${sx.toFixed(1)}px,${(sy + stagger).toFixed(1)}px) translate(-50%,-50%)`;
          p.el.style.opacity = on ? '1' : '0';
        }

        for (let k = 0; k < BEATS.length; k++) {
          const el = beatRefs.current[k];
          if (!el) continue;
          const B = BEATS[k];
          let o = 0;
          let sft = 22;
          if (prog01 >= B.a && prog01 <= B.b) {
            const u = (prog01 - B.a) / (B.b - B.a);
            // The first beat is the page's headline and must be legible the
            // moment the page opens, so it skips the fade-in and only fades out.
            const rise = k === 0 ? 1 : u / 0.2;
            o = Math.min(1, Math.min(rise, (1 - u) / 0.22));
            sft = 22 * (1 - o);
          }
          el.style.opacity = o.toFixed(3);
          // Hand the nudge to CSS as a variable rather than writing transform
          // directly: the desktop rule centres the beat with translateY(-50%),
          // and setting transform here would silently drop that centring.
          el.style.setProperty('--nudge', `${sft.toFixed(1)}px`);
        }

        if (hud.alt) {
          hud.alt.textContent = `${C.alt.toFixed(1)} km`;
          const bi = Math.min(BEAT_NAMES.length - 1, Math.floor(prog01 * BEAT_NAMES.length));
          if (hud.beat && hud.beat.textContent !== BEAT_NAMES[bi]) hud.beat.textContent = BEAT_NAMES[bi];
        }

        raf = requestAnimationFrame(frame);
      };

      window.addEventListener('resize', resize);
      window.addEventListener('scroll', readScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('resize', resize));
      cleanups.push(() => window.removeEventListener('scroll', readScroll));
      cleanups.push(() => {
        gl.deleteBuffer(bPos);
        gl.deleteBuffer(bCol);
        gl.deleteBuffer(bSz);
        gl.deleteProgram(prog);
        gl.deleteProgram(skyProg.p);
      });

      resize();
      readScroll();
      prog01 = target01;
      if (reduce) {
        // one static frame at the beat the reader is on, no loop
        prog01 = target01;
        frame();
        cancelAnimationFrame(raf);
      } else {
        frame();
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section
      ref={secRef}
      id="top"
      className="me-on-dark"
      style={{ position: 'relative', height: '420vh', background: '#0a0b08' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100svh',
          minHeight: 620,
          overflow: 'hidden',
          color: '#ede9de',
        }}
      >
        {failed ? (
          // WebGL unavailable: the pre-rendered flythrough of the same basin
          <video
            poster="/posters/basin-hero.jpg"
            muted
            loop
            playsInline
            autoPlay
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src="/videos/basin-hero-1080.mp4" media="(min-width: 900px)" type="video/mp4" />
            <source src="/videos/basin-hero-720.mp4" type="video/mp4" />
          </video>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          />
        )}

        <div ref={pinsRef} className="me-pins" aria-hidden="true" />

        {/* beats: the copy the camera is flying under */}
        {BEATS.map((b, i) => (
          <div
            key={b.kicker}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            className="me-beat"
          >
            <span className="me-eyebrow" style={{ color: 'var(--art-accent-hi)' }}>
              {b.kicker}
            </span>
            <h1 className="me-display" style={{ color: '#ede9de' }}>
              {b.title}
            </h1>
            <p>{b.body}</p>
          </div>
        ))}

        {/* reach readout */}
        <dl className="me-hud">
          <div>
            <dt>ALT</dt>
            <dd ref={(el) => { hudRef.current.alt = el; }}>19.0 km</dd>
          </div>
          <div>
            <dt>REACH</dt>
            <dd ref={(el) => { hudRef.current.beat = el; }}>01 · HIRAKUD</dd>
          </div>
        </dl>

        <span className="me-scroll-cue">Scroll to fly the reach</span>
      </div>
    </section>
  );
}

/* ==========================================================================
   Blog cover art.

   Drawn rather than photographed, in the same hand as the scene art elsewhere
   on the site: flat shapes, the site palette, no gradients doing the work of
   drawing. Stock photography would clash with every other illustration here,
   and these carry no licence or attribution burden.

   Each is 800 x 500 and is rendered behind a card, so nothing important sits
   in the bottom fifth where the type overlaps.
   ========================================================================== */

export const COVERS: Record<string, string> = {
  /* events migrating off the river we claimed them for */
  audit: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="800" height="500" fill="#14160E"/>
    <g stroke="#8E9A93" stroke-width="2" opacity=".5">
      <path d="M-10 120 C 180 150, 360 190, 560 250 S 760 330, 820 360"/>
      <path d="M-10 210 C 190 240, 380 270, 570 320 S 770 380, 820 400"/>
    </g>
    <path d="M-10 350 C 200 360, 420 372, 620 392 S 790 420, 820 430" stroke="var(--art-accent)" stroke-width="2.6"/>
    <g fill="#4FA89C">
      <circle cx="120" cy="140" r="4"/><circle cx="196" cy="156" r="4"/><circle cx="258" cy="171" r="4"/>
      <circle cx="322" cy="184" r="4"/><circle cx="398" cy="203" r="4"/><circle cx="452" cy="220" r="4"/>
      <circle cx="516" cy="240" r="4"/><circle cx="572" cy="257" r="4"/><circle cx="636" cy="283" r="4"/>
    </g>
    <g fill="#7FB08A">
      <circle cx="150" cy="228" r="3.6"/><circle cx="242" cy="248" r="3.6"/><circle cx="336" cy="264" r="3.6"/>
      <circle cx="430" cy="286" r="3.6"/><circle cx="524" cy="312" r="3.6"/>
    </g>
    <g fill="var(--art-accent-hi)" opacity=".9">
      <circle cx="470" cy="300" r="3"/><circle cx="492" cy="288" r="3"/><circle cx="452" cy="316" r="3"/>
      <circle cx="508" cy="322" r="3"/><circle cx="436" cy="292" r="3"/>
    </g>
    <circle cx="470" cy="304" r="86" stroke="var(--art-accent-hi)" stroke-width="1.4" stroke-dasharray="6 7" opacity=".55"/>
    <circle cx="470" cy="304" r="5.5" fill="#EDE9DE"/>
    <circle cx="300" cy="366" r="7" fill="var(--art-accent)"/>
    <circle cx="300" cy="366" r="15" stroke="var(--art-accent)" stroke-width="1.2" opacity=".5"/>
  </svg>`,

  /* four traces: three of them lie */
  gauges: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="800" height="500" fill="#14160E"/>
    <g stroke="#2A2C21" stroke-width="1"><path d="M60 130h680M60 230h680M60 330h680"/></g>
    <path d="M60 130 h680" stroke="#6B6857" stroke-width="2.4"/>
    <path d="M60 230 C 160 230, 220 214, 300 208 S 420 206, 740 206" stroke="#6B6857" stroke-width="2.4"/>
    <path d="M60 330 h120 l24 -54 l22 108 l26 -70 l30 44 h140 l26 62 l24 -120 h268" stroke="#6B6857" stroke-width="2.4"/>
    <path d="M60 440 C 180 438, 280 420, 380 384 S 560 300, 740 268" stroke="#4FA89C" stroke-width="3"/>
    <path d="M60 300 h680" stroke="var(--art-accent)" stroke-width="1.4" stroke-dasharray="7 8" opacity=".8"/>
    <g transform="translate(650,268)">
      <rect x="-3" y="0" width="6" height="120" fill="#0A0B08"/>
      <circle cx="0" cy="-8" r="7" fill="var(--art-accent)"/>
      <circle cx="0" cy="-8" r="17" fill="var(--art-accent)" opacity=".2"/>
    </g>
    <g font-family="JetBrains Mono, monospace" font-size="13" fill="#6B6857" letter-spacing="1.4">
      <text x="60" y="118">FLATLINE</text><text x="60" y="218">STALL</text>
      <text x="60" y="318">IMPOSSIBLE</text>
    </g>
    <text x="60" y="470" font-family="JetBrains Mono, monospace" font-size="13" fill="#4FA89C" letter-spacing="1.4">A RIVER RISING</text>
  </svg>`,

  /* lead time, honestly counted */
  leadtime: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="800" height="500" fill="#14160E"/>
    <g font-family="JetBrains Mono, monospace" font-size="14" fill="#6B6857" letter-spacing="1.6">
      <text x="70" y="150">72 h</text><text x="70" y="264">48 h</text><text x="70" y="378">24 h</text>
    </g>
    <g>
      <rect x="170" y="126" width="480" height="34" fill="#1E2118"/>
      <rect x="170" y="126" width="80" height="34" fill="#8E9A93"/>
      <rect x="170" y="240" width="480" height="34" fill="#1E2118"/>
      <rect x="170" y="240" width="480" height="34" fill="#7FB08A"/>
      <rect x="170" y="354" width="480" height="34" fill="#1E2118"/>
      <rect x="170" y="354" width="320" height="34" fill="#8E9A93"/>
    </g>
    <g font-family="Instrument Sans, sans-serif" font-size="19" font-weight="600" fill="#EDE9DE">
      <text x="666" y="151">1 / 6</text><text x="666" y="265">6 / 6</text><text x="666" y="379">4 / 6</text>
    </g>
    <text x="170" y="440" font-family="JetBrains Mono, monospace" font-size="13" fill="var(--art-accent)" letter-spacing="1.4">SO WE DO NOT SAY 72 HOURS</text>
  </svg>`,

  /* the eastern himalaya draining onto a plain */
  upstream: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="800" height="500" fill="#0E1220"/>
    <rect width="800" height="230" fill="#141A2C"/>
    <g fill="#1E2740">
      <path d="M-20 230 L 90 96 L 190 230 Z"/><path d="M120 230 L 250 60 L 380 230 Z"/>
      <path d="M320 230 L 430 110 L 540 230 Z"/><path d="M500 230 L 640 78 L 790 230 Z"/>
    </g>
    <g fill="#E8EEF6" opacity=".85">
      <path d="M250 60 L 292 114 L 268 108 L 250 124 L 232 108 L 208 114 Z"/>
      <path d="M640 78 L 676 126 L 656 120 L 640 134 L 624 120 L 604 126 Z"/>
    </g>
    <path d="M0 230 C 140 246, 300 250, 460 262 S 700 286, 800 296 L800 500 L0 500 Z" fill="#1A2416"/>
    <path d="M0 300 C 160 312, 320 322, 470 342 S 700 380, 800 396 L800 500 L0 500 Z" fill="#22301C"/>
    <path d="M248 128 C 280 200, 330 250, 386 292 S 520 372, 620 404 S 760 448, 800 462"
          stroke="#4FA89C" stroke-width="7" stroke-linecap="round" opacity=".92"/>
    <path d="M642 136 C 640 200, 610 252, 566 292 S 470 350, 420 384"
          stroke="#4FA89C" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <g stroke="#8FA6B4" stroke-width="1.6" opacity=".4">
      <path d="M70 20 l-12 42M150 8 l-12 42M230 26 l-12 42M310 6 l-12 42M390 22 l-12 42M470 10 l-12 42M550 28 l-12 42M630 8 l-12 42M710 24 l-12 42"/>
    </g>
    <g fill="#0C110A">
      <path d="M486 400 l22 -18 l22 18 v20 h-44 z"/><path d="M548 412 l18 -15 l18 15 v17 h-36 z"/>
    </g>
    <rect x="496" y="406" width="9" height="12" fill="var(--art-accent-hi)" opacity=".9"/>
  </svg>`,

  /* a coast that moved a million people in time */
  lastmile: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="800" height="500" fill="#141013"/>
    <g opacity=".5" stroke="#4A5A6B" stroke-width="2" fill="none">
      <path d="M470 190 C 560 150, 660 200, 640 280 C 620 352, 500 372, 448 314 C 404 264, 430 216, 470 190"/>
      <path d="M486 214 C 552 190, 616 226, 602 282 C 588 332, 508 348, 472 308 C 442 274, 458 234, 486 214"/>
      <path d="M506 240 C 546 228, 582 250, 574 282 C 566 312, 520 322, 500 298 C 484 278, 490 250, 506 240"/>
    </g>
    <circle cx="538" cy="270" r="12" fill="#141013" stroke="#8E9A93" stroke-width="2"/>
    <path d="M0 366 C 150 358, 320 372, 470 386 S 700 412, 800 418 L800 500 L0 500 Z" fill="#16200F"/>
    <path d="M0 404 C 180 398, 360 412, 520 424 S 720 444, 800 450 L800 500 L0 500 Z" fill="#1E2A15"/>
    <g fill="#0C100A">
      <path d="M62 366 l20 -17 l20 17 v18 h-40 z"/><path d="M118 372 l17 -14 l17 14 v16 h-34 z"/>
      <path d="M168 366 l20 -17 l20 17 v18 h-40 z"/>
    </g>
    <g stroke="#7FB08A" stroke-width="2.4" stroke-linecap="round">
      <path d="M232 372 h96"/><path d="M312 362 l18 10 l-18 10"/>
    </g>
    <g fill="var(--art-accent-hi)">
      <circle cx="356" cy="372" r="5"/><circle cx="378" cy="372" r="5"/><circle cx="400" cy="372" r="5"/>
      <circle cx="367" cy="356" r="5"/><circle cx="389" cy="356" r="5"/><circle cx="378" cy="388" r="5"/>
    </g>
    <rect x="344" y="330" width="72" height="8" fill="#7FB08A" opacity=".8"/>
    <text x="62" y="462" font-family="JetBrains Mono, monospace" font-size="13" fill="#7FB08A" letter-spacing="1.4">INLAND, BEFORE LANDFALL</text>
  </svg>`,
};

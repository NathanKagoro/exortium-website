// Every picture on the site is drawn here as inline SVG: cut-paper portraits
// for the fictional team and posters for the illustrative case studies.
// Nothing is traced from a photograph.

const C = { red: '#fa2d1a', ink: '#d2220e', navy: '#182748', blue: '#2e4c8c', cream: '#fff3e1', sand: '#f1d9b5' };

// Shared defs: halftone dot patterns and the registration mark. Included once per page.
export const sprite = `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="ht-navy" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5" cy="5" r="2.6" fill="${C.navy}"/></pattern>
    <pattern id="ht-navy-s" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.5" fill="${C.navy}"/></pattern>
    <pattern id="ht-red" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><circle cx="5" cy="5" r="2.6" fill="${C.red}"/></pattern>
    <pattern id="ht-cream" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5" cy="5" r="2.6" fill="${C.cream}"/></pattern>
    <pattern id="ht-blue" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="4.5" cy="4.5" r="2.1" fill="${C.blue}"/></pattern>
    <symbol id="reg" viewBox="0 0 40 40"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="20" r="11"/><path d="M20 0v40M0 20h40"/></g><circle cx="20" cy="20" r="4.5" fill="currentColor"/></symbol>
    <symbol id="star" viewBox="0 0 40 40"><path fill="currentColor" d="M20 0l4.6 11.2L35.5 6l-5.2 10.9L42 20l-11.7 3.1L35.5 34l-10.9-5.2L20 40l-4.6-11.2L4.5 34l5.2-10.9L-2 20l11.7-3.1L4.5 6l10.9 5.2z"/></symbol>
  </defs>
</svg>`;

const portrait = (title, body) =>
  `<svg class="portrait" viewBox="0 0 320 400" role="img" aria-label="${title}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;

export const avatars = {
  tamsin: portrait('Cut-paper illustration of Tamsin Vale: a navy bob on a red ground', `
    <rect width="320" height="400" fill="${C.red}"/>
    <circle cx="232" cy="120" r="150" fill="url(#ht-navy)" opacity=".55"/>
    <path d="M10 400c0-74 64-104 150-104s150 30 150 104z" fill="${C.navy}"/>
    <path d="M132 300l28 44 28-44z" fill="${C.cream}"/>
    <rect x="136" y="232" width="48" height="76" fill="${C.sand}"/>
    <path d="M98 176c0-52 26-82 62-82s62 30 62 82c0 46-28 82-62 82s-62-36-62-82z" fill="${C.cream}"/>
    <path d="M160 94c36 0 62 30 62 82 0 46-28 82-62 82z" fill="url(#ht-navy-s)" opacity=".35"/>
    <path d="M80 262c-8-60-10-104 4-138 14-36 44-52 78-52 36 0 64 18 76 54 12 34 8 78 2 136h-34c10-52 10-92-10-118-28 22-64 26-88 14-12 26-10 62-4 104z" fill="${C.navy}"/>
    <path d="M160 170l-9 34h13" fill="none" stroke="${C.navy}" stroke-width="3.5" stroke-linecap="square"/>
    <path d="M142 226c12 8 26 8 38 0" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
    <path d="M124 170h20M178 170h20" stroke="${C.navy}" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="96" cy="224" r="7" fill="${C.cream}"/>
  `),
  corwin: portrait('Cut-paper illustration of Corwin Ashby: round glasses and a red quiff on a navy ground', `
    <rect width="320" height="400" fill="${C.navy}"/>
    <path d="M-20 400L140-20h90L70 400z" fill="${C.blue}"/>
    <circle cx="70" cy="300" r="120" fill="url(#ht-cream)" opacity=".3"/>
    <path d="M6 400c0-70 62-98 154-98s154 28 154 98z" fill="${C.cream}"/>
    <path d="M118 302l42 60 42-60z" fill="${C.red}"/>
    <rect x="134" y="236" width="52" height="72" fill="${C.sand}"/>
    <path d="M100 150h120v52c0 40-26 68-60 68s-60-28-60-68z" fill="${C.cream}"/>
    <path d="M100 202c0 40 26 68 60 68s60-28 60-68v-10c-18 22-40 26-60 26s-42-4-60-26z" fill="${C.red}"/>
    <path d="M92 160c-6-46 22-82 70-86 30-2 58 8 70 34-22-6-36 0-44 14-30-8-62 2-80 38z" fill="${C.red}"/>
    <g fill="none" stroke="${C.navy}" stroke-width="5"><circle cx="134" cy="176" r="20"/><circle cx="186" cy="176" r="20"/><path d="M154 176h12M114 172l-14-6M206 172l14-6"/></g>
    <path d="M160 186l-6 20h12" fill="none" stroke="${C.navy}" stroke-width="3.5" stroke-linecap="square"/>
    <path d="M146 232h28" stroke="${C.cream}" stroke-width="5" stroke-linecap="round"/>
  `),
  odalys: portrait('Cut-paper illustration of Odalys Brandt: a top knot and a hoop earring on a cream ground', `
    <rect width="320" height="400" fill="${C.cream}"/>
    <circle cx="96" cy="130" r="140" fill="url(#ht-red)" opacity=".8"/>
    <rect x="0" y="330" width="320" height="70" fill="${C.navy}"/>
    <path d="M14 400c0-72 60-100 146-100s146 28 146 100z" fill="${C.red}"/>
    <path d="M130 300c8 22 52 22 60 0z" fill="${C.blue}"/>
    <rect x="136" y="234" width="48" height="70" fill="${C.blue}"/>
    <ellipse cx="160" cy="180" rx="60" ry="76" fill="${C.blue}"/>
    <path d="M160 104c33 0 60 34 60 76s-27 76-60 76z" fill="url(#ht-navy-s)" opacity=".5"/>
    <circle cx="160" cy="62" r="34" fill="${C.navy}"/>
    <path d="M96 190c-10-62 22-100 64-100s74 38 64 100c-8-36-28-60-64-64-36 4-56 28-64 64z" fill="${C.navy}"/>
    <path d="M160 174l-8 32h13" fill="none" stroke="${C.cream}" stroke-width="3.5" stroke-linecap="square"/>
    <path d="M144 228c10 6 22 6 32 0" fill="none" stroke="${C.cream}" stroke-width="5" stroke-linecap="round"/>
    <path d="M124 172c6-6 14-6 20 0M176 172c6-6 14-6 20 0" fill="none" stroke="${C.cream}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="226" cy="222" r="13" fill="none" stroke="${C.cream}" stroke-width="5"/>
  `),
};

const poster = (title, body) =>
  `<svg class="poster" viewBox="0 0 480 600" role="img" aria-label="${title}">${body}</svg>`;

const rays = (cx, cy, r1, r2, n, fill) => {
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const b = a + (Math.PI / n) * 0.9;
    const p = (ang, r) => `${(cx + Math.cos(ang) * r).toFixed(1)} ${(cy + Math.sin(ang) * r).toFixed(1)}`;
    d += `M${p(a, r1)}L${p(a, r2)}L${p(b, r2)}L${p(b, r1)}Z`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
};

export const posters = {
  northbridge: poster('Poster drawing for Northbridge FC: a halftone football rising over a three-arch bridge', `
    <rect width="480" height="600" fill="${C.navy}"/>
    <path d="M-40 250L300-60h110L70 250z" fill="${C.red}"/>
    <path d="M110 250L450-60h40L150 250z" fill="${C.cream}"/>
    <circle cx="300" cy="250" r="128" fill="${C.cream}"/>
    <circle cx="300" cy="250" r="128" fill="url(#ht-navy)"/>
    <path d="M300 204l44 32-17 52h-54l-17-52z" fill="${C.navy}"/>
    <path d="M300 204v-80M344 236l76-26M327 288l48 66M273 288l-48 66M256 236l-76-26" stroke="${C.navy}" stroke-width="7" fill="none"/>
    <path d="M0 600V360h480v240h-52v-110a54 54 0 00-108 0v110h-52v-110a54 54 0 00-108 0v110h-52v-110a54 54 0 00-108 0z" fill="${C.cream}" transform="translate(0 0)"/>
    <rect x="0" y="360" width="480" height="26" fill="${C.red}"/>
    <text x="24" y="118" class="poster__t" font-size="96" fill="${C.cream}">NORTH</text>
    <text x="24" y="118" class="poster__t" font-size="96" fill="none" stroke="${C.red}" stroke-width="2" transform="translate(5 5)">NORTH</text>
    <text x="456" y="352" class="poster__t" font-size="54" fill="${C.cream}" text-anchor="end">BRIDGE FC</text>
  `),
  helios: poster('Poster drawing for Helios Taverna: a rayed sun above a plate and two olives', `
    <rect width="480" height="600" fill="${C.red}"/>
    ${rays(240, 230, 120, 330, 18, C.ink)}
    <circle cx="240" cy="230" r="104" fill="${C.cream}"/>
    <circle cx="252" cy="242" r="104" fill="url(#ht-navy)" opacity=".85"/>
    <rect x="0" y="430" width="480" height="170" fill="${C.navy}"/>
    <ellipse cx="240" cy="436" rx="170" ry="34" fill="${C.cream}"/>
    <ellipse cx="240" cy="432" rx="120" ry="20" fill="none" stroke="${C.blue}" stroke-width="4"/>
    <ellipse cx="204" cy="424" rx="26" ry="15" fill="${C.navy}"/><circle cx="222" cy="422" r="5" fill="${C.red}"/>
    <ellipse cx="270" cy="430" rx="26" ry="15" fill="${C.blue}"/><circle cx="288" cy="428" r="5" fill="${C.red}"/>
    <text x="240" y="548" class="poster__t" font-size="92" fill="${C.cream}" text-anchor="middle">HELIOS</text>
    <text x="240" y="586" class="poster__t poster__t--wide" font-size="26" fill="${C.cream}" text-anchor="middle">TAVERNA</text>
  `),
  summit: poster('Poster drawing for Summit Ridge Roofing: tiled roofs rising like a mountain ridge under a red sun', `
    <rect width="480" height="600" fill="${C.cream}"/>
    <rect width="480" height="330" fill="url(#ht-blue)" opacity=".55"/>
    <circle cx="352" cy="132" r="74" fill="${C.red}"/>
    <path d="M-10 420L150 190l96 138 82-98 162 190z" fill="${C.navy}"/>
    <path d="M150 190l96 138-40 92H-10z" fill="url(#ht-cream)" opacity=".35"/>
    <path d="M-10 600V420l120-70 130 70 130-70 120 70v180z" fill="${C.red}"/>
    <g fill="none" stroke="${C.cream}" stroke-width="4">
      <path d="M-10 452h500M-10 486h500M-10 520h500"/>
      <path d="M30 420v32M90 420v32M150 420v32M210 420v32M270 420v32M330 420v32M390 420v32M450 420v32M60 452v34M120 452v34M180 452v34M240 452v34M300 452v34M360 452v34M420 452v34M30 486v34M90 486v34M150 486v34M210 486v34M270 486v34M330 486v34M390 486v34M450 486v34"/>
    </g>
    <rect x="0" y="520" width="480" height="80" fill="${C.navy}"/>
    <text x="24" y="578" class="poster__t" font-size="60" fill="${C.cream}">SUMMIT RIDGE</text>
    <text x="456" y="578" class="poster__t poster__t--wide" font-size="20" fill="${C.cream}" text-anchor="end">ROOFING</text>
  `),
};

// Round rubber stamp with text set on a circle.
export const stamp = (ring, centre) => `<svg class="stamp" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
  <defs><path id="stamp-arc" d="M100 100m-74 0a74 74 0 11148 0a74 74 0 11-148 0"/></defs>
  <g fill="none" stroke="currentColor"><circle cx="100" cy="100" r="96" stroke-width="5"/><circle cx="100" cy="100" r="56" stroke-width="2.5"/></g>
  <text class="stamp__ring" fill="currentColor"><textPath href="#stamp-arc" textLength="455">${ring}</textPath></text>
  <text class="stamp__centre" x="100" y="111" text-anchor="middle" fill="currentColor">${centre}</text>
</svg>`;

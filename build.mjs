// Tiny static build: wraps each page in src/pages with the shared head, slug
// line, masthead and footer, fills in the shared blocks, and copies the
// assets. No dependencies. Output goes to dist/.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, NAV, SERVICES, CASES, TEAM } from './src/data.mjs';
import { sprite, avatars, posters, stamp } from './src/art.mjs';
import { PURPOSES, MESSAGE_MAX } from './src/js/lib/form.js';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const out = join(root, 'dist');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const reg = (cls = '') => `<svg class="reg ${cls}" aria-hidden="true" focusable="false"><use href="#reg"/></svg>`;
const star = '<svg class="star" aria-hidden="true" focusable="false"><use href="#star"/></svg>';

const head = (page) => `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="theme-color" content="#182748">
${page.base ? `<base href="${page.base}">\n` : ''}<link rel="preload" href="assets/fonts/anybody-latin-wdth.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/archivo-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/styles.css">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Exortium">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${SITE.url}${page.file === 'index.html' ? '' : page.file}">
<meta property="og:image" content="${SITE.url}assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Poster reading: We connect you to clients who weren't looking. Exortium, a concept agency.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${SITE.url}assets/og.png">
<script type="module" src="js/site.js"></script>
</head>`;

const masthead = (page) => `
<a class="skip" href="#main">Skip to content</a>
${sprite}
<div class="slug">
  <a class="slug__back" href="https://nathankagoro.com">&larr; nathankagoro.com</a>
  <p class="slug__notice">${SITE.notice}</p>
</div>
<header class="masthead">
  <a class="wordmark" href="index.html" aria-label="Exortium, home">Exortium</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
  <nav class="nav" id="site-nav" aria-label="Pages">
    ${NAV.map((n) => `<a href="${n.href}"${n.key === page.nav ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n    ')}
  </nav>
</header>`;

const footer = () => `
<footer class="footer">
  <div class="footer__bar" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i>${reg()}</div>
  <p class="footer__word fit" aria-hidden="true"><span class="fit__line" style="--k:.3481">Exortium</span></p>
  <div class="footer__cols">
    <nav class="footer__nav" aria-label="Footer">
      ${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join('\n      ')}
    </nav>
    <p class="footer__note">A concept site. There is no office, phone line or inbox behind it. Set in Anybody and Archivo; every picture is drawn in SVG or on a canvas.</p>
    <a class="footer__back" href="https://nathankagoro.com">&larr; nathankagoro.com</a>
  </div>
</footer>`;

// ---- Shared blocks ---------------------------------------------------------

const marqueeItems = ['Websites', 'Social', 'Adverts', 'Leads', 'Launches', 'Follow-up'];
const marqueeRun = (hidden) => `<ul class="marquee__run"${hidden ? ' aria-hidden="true"' : ''}>${marqueeItems.map((w) => `<li>${w}${star}</li>`).join('')}</ul>`;

const blocks = {
  marquee: () => `<div class="marquee">
  <div class="marquee__belt">${marqueeRun(false)}${marqueeRun(true)}</div>
  <button class="marquee__toggle" type="button" aria-pressed="false" aria-label="Pause the moving strip"><span>Pause</span></button>
</div>`,

  stamp: () => stamp('CONCEPT AGENCY &#9733; ILLUSTRATIVE WORK &#9733;', 'PROOF'),

  reg: () => reg(),

  services: () => `<div class="services__rows">
${SERVICES.map((s) => `  <article class="service" id="${s.id}">
    <h3 class="service__word">${s.word}</h3>
    <div class="service__body">
      <p class="service__name">${s.name}</p>
      <p>${s.text}</p>
    </div>
  </article>`).join('\n')}
</div>`,

  servicesFull: () => SERVICES.map((s) => `<article class="service service--full" id="${s.id}">
    <h2 class="service__word">${s.word}</h2>
    <div class="service__body">
      <p class="service__name">${s.name}</p>
      <p>${s.text}</p>
      <ul class="ticks">${s.includes.map((i) => `<li>${i}</li>`).join('')}</ul>
    </div>
  </article>`).join('\n'),

  carousel: () => `<div class="carousel" role="group" aria-roledescription="carousel" aria-label="Illustrative case studies">
  <ul class="carousel__track" tabindex="0" aria-label="Case studies. Use the left and right arrow keys, or swipe.">
${CASES.map((c, i) => `    <li class="case" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${CASES.length}">
      <div class="case__poster">${posters[c.id]}</div>
      <div class="case__text">
        <p class="case__sector">${c.sector}, illustrative</p>
        <h3>${c.name}</h3>
        <p class="case__label">The brief we imagined</p>
        <p class="case__brief">&ldquo;${c.brief}&rdquo;</p>
        <p class="case__label">What we would do</p>
        <ul class="ticks">${c.plan.map((p) => `<li>${p}</li>`).join('')}</ul>
      </div>
    </li>`).join('\n')}
  </ul>
  <div class="carousel__controls">
    <button class="round" type="button" data-dir="-1" aria-label="Previous case study"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l-8 8 8 8M6 12h14" fill="none" stroke="currentColor" stroke-width="3"/></svg></button>
    <p class="carousel__count" aria-hidden="true">1 / ${CASES.length}</p>
    <button class="round" type="button" data-dir="1" aria-label="Next case study"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4l8 8-8 8M18 12H4" fill="none" stroke="currentColor" stroke-width="3"/></svg></button>
  </div>
  <p class="carousel__status visually-hidden" aria-live="polite"></p>
</div>`,

  cases: () => CASES.map((c) => `<article class="casefile" id="${c.id}">
  <div class="case__poster">${posters[c.id]}</div>
  <div class="case__text">
    <p class="case__sector">${c.sector}, illustrative</p>
    <h2>${c.name}</h2>
    <p class="case__label">The brief we imagined</p>
    <p class="case__brief">&ldquo;${c.brief}&rdquo;</p>
    <p class="case__label">What we would do</p>
    <ul class="ticks">${c.plan.map((p) => `<li>${p}</li>`).join('')}</ul>
    <p class="case__label">What we would measure</p>
    <p>${c.measure}</p>
  </div>
</article>`).join('\n'),

  team: () => `<ul class="team__grid">
${TEAM.map((t) => `  <li class="member">
    <div class="member__art">${avatars[t.id]}</div>
    <h3 class="member__name">${t.name}</h3>
    <p class="member__role">${t.role}</p>
    <p>${t.text}</p>
  </li>`).join('\n')}
</ul>`,

  // method="dialog" outside a <dialog> submits nowhere, so without script the
  // form cannot leak what was typed into the address bar.
  form: () => `<form class="contact-form" method="dialog" novalidate>
  <p class="contact-form__demo">Demo form. There is no inbox behind it, so nothing you type leaves this page.</p>
  <div class="field">
    <label for="f-name">Name</label>
    <input id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="e-name">
    <p class="field__error" id="e-name" data-error-for="name"></p>
  </div>
  <div class="field">
    <label for="f-email">Email</label>
    <input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="e-email">
    <p class="field__error" id="e-email" data-error-for="email"></p>
  </div>
  <div class="field">
    <label for="f-purpose">What is it about?</label>
    <select id="f-purpose" name="purpose" required aria-describedby="e-purpose">
      <option value="">Choose one</option>
      ${PURPOSES.map((p) => `<option>${p}</option>`).join('')}
    </select>
    <p class="field__error" id="e-purpose" data-error-for="purpose"></p>
  </div>
  <div class="field">
    <label for="f-message">Message <span class="field__opt">(optional)</span></label>
    <textarea id="f-message" name="message" rows="4" maxlength="${MESSAGE_MAX}" aria-describedby="e-message"></textarea>
    <p class="field__error" id="e-message" data-error-for="message"></p>
  </div>
  <button class="btn btn--red" type="submit">Send request</button>
  <p class="contact-form__status" role="status"></p>
</form>`,
};

// ---- Build -----------------------------------------------------------------

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pages = readdirSync(join(src, 'pages')).filter((f) => f.endsWith('.html'));
for (const file of pages) {
  const raw = readFileSync(join(src, 'pages', file), 'utf8');
  const match = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!match) throw new Error(`${file}: missing front matter comment`);
  const page = { file, ...JSON.parse(match[1]) };
  let body = raw.slice(match[0].length).replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (!blocks[name]) throw new Error(`${file}: unknown block {{${name}}}`);
    return blocks[name]();
  });
  const html = `${head(page)}
<body class="page-${page.nav || 'plain'}">${masthead(page)}
<main id="main">
${body.trim()}
</main>${footer()}
</body>
</html>
`;
  writeFileSync(join(out, file), html);
}

cpSync(join(src, 'css'), join(out, 'css'), { recursive: true });
cpSync(join(src, 'js'), join(out, 'js'), { recursive: true });
cpSync(join(src, 'assets'), join(out, 'assets'), { recursive: true });
writeFileSync(join(out, '.nojekyll'), '');

console.log(`Built ${pages.length} pages into dist/`);

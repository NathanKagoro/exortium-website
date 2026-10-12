// Checks on the built pages. `npm test` builds first (see pretest).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { check, findForbidden } from '../tools/check-links.mjs';
import { SITE } from '../src/data.mjs';

const dist = new URL('../dist/', import.meta.url);
const pages = readdirSync(dist).filter((f) => f.endsWith('.html'));
const read = (file) => readFileSync(new URL(file, dist), 'utf8');

test('no dead internal links and no forbidden strings', () => {
  assert.deepEqual(check(), []);
});

test('the forbidden-string detector works', () => {
  const j = (...p) => p.join('');
  assert.equal(findForbidden('Tamsin Vale runs campaigns at max-width').length, 0);
  assert.equal(findForbidden('nathankagoro.com').length, 0);
  assert.equal(findForbidden(`<h3>${j('Ra', 'din')}</h3>`).length, 1);
  assert.equal(findForbidden(`<h3>${j('M', 'ax')}</h3>`).length, 1);
  assert.equal(findForbidden(`Phone: +1 (415) ${j('555', '-0192')}`).length, 1);
  assert.equal(findForbidden(`88 ${j('Market', ' Street')}`).length, 1);
});

test('six pages are built', () => {
  assert.deepEqual(pages.sort(), ['404.html', 'about.html', 'case-studies.html', 'contact.html', 'index.html', 'services.html']);
});

for (const file of pages) {
  test(`${file}: shared head, slug line, masthead and footer`, () => {
    const html = read(file);
    assert.equal(html.split(SITE.notice).length - 1, 1, 'the concept notice appears exactly once');
    assert.match(html, /<meta name="description" content="[^"]{50,200}">/);
    assert.match(html, /<link rel="icon" href="assets\/favicon\.svg"/);
    assert.match(html, /<meta property="og:image" content="https:\/\/nathankagoro\.github\.io\/exortium-website\/assets\/og\.png">/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.match(html, /href="https:\/\/nathankagoro\.com"/);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'one h1');
    assert.equal((html.match(/<nav class="nav"/g) || []).length, 1);
    assert.equal((html.match(/<footer class="footer"/g) || []).length, 1);
    assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
  });
}

test('forms cannot navigate or put details in the address bar', () => {
  for (const file of ['index.html', 'contact.html']) {
    const html = read(file);
    assert.match(html, /<form class="contact-form" method="dialog" novalidate>/);
    assert.doesNotMatch(html, /<form[^>]*\saction=/);
  }
});

test('the live region holds only the carousel status, not the buttons', () => {
  const html = read('index.html');
  const live = html.match(/<[^>]*aria-live="polite"[^>]*>/g);
  assert.equal(live.length, 1);
  assert.match(live[0], /^<p class="carousel__status/);
});

test('page weight: the home page and its assets stay under 400 KB', () => {
  const size = (path) => statSync(new URL(path, dist)).size;
  const total = ['index.html', 'css/styles.css', 'js/site.js', 'js/network.js', 'js/lib/form.js', 'js/lib/carousel.js',
    'js/lib/network-math.js', 'assets/fonts/anybody-latin-wdth.woff2', 'assets/fonts/archivo-latin-wght.woff2', 'assets/favicon.svg']
    .reduce((sum, f) => sum + size(f), 0);
  assert.ok(total < 400 * 1024, `${Math.round(total / 1024)} KB`);
});

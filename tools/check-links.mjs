// Checks the built site (dist/) and the tracked source for two things:
//  1. every internal link, script, stylesheet, font and #fragment resolves;
//  2. none of the strings that must never be published appear anywhere.
// Exits 1 on any problem. Run after `node build.mjs`.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// The original demo used three real first names for its team, a made-up phone
// number and a made-up street address. They are assembled from pieces here so
// that this file does not itself contain them.
const j = (...parts) => parts.join('');
export const FORBIDDEN = [
  { label: 'a real first name from the original team', re: new RegExp(`\\b(${j('M', 'ax')}|${j('Ra', 'din')}|${j('Nat', 'han')})\\b`) },
  { label: 'the original fake phone number', re: new RegExp(j('555', '-', '0192')) },
  { label: 'the original fake street address', re: new RegExp(j('Market', ' ', 'Street'), 'i') },
  { label: 'the original fake email address', re: new RegExp(j('hello@', 'exortium'), 'i') },
  { label: 'the removed testimonials heading', re: new RegExp(j('Proof In Real', ' Campaign'), 'i') },
];

export function findForbidden(text) {
  return FORBIDDEN.filter((f) => f.re.test(text)).map((f) => f.label);
}

function walk(dir, skip = []) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (skip.includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, skip));
    else out.push(full);
  }
  return out;
}

const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.md', '.txt', '.yml']);

export function check() {
  const problems = [];
  if (!existsSync(dist)) return ['dist/ does not exist. Run `node build.mjs` first.'];

  const pages = readdirSync(dist).filter((f) => f.endsWith('.html'));
  const ids = new Map();
  const html = new Map();
  for (const file of pages) {
    const text = readFileSync(join(dist, file), 'utf8');
    html.set(file, text);
    ids.set(file, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }

  for (const [file, text] of html) {
    const refs = [...text.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (/^(https?:|mailto:|tel:|data:)/.test(ref)) {
        if (/^(mailto:|tel:)/.test(ref)) problems.push(`${file}: contact link "${ref}" on a site with no real contact details`);
        continue;
      }
      if (ref === '' || ref === '#' || /^javascript:/i.test(ref)) {
        problems.push(`${file}: dead link "${ref}"`);
        continue;
      }
      if (ref.startsWith('/')) {
        if (ref !== '/exortium-website/') problems.push(`${file}: root-relative link "${ref}" breaks under /exortium-website/`);
        continue;
      }
      const [path, fragment] = ref.split('#');
      const target = path === '' ? file : path.replace(/^\.\//, '');
      if (!existsSync(join(dist, target))) {
        problems.push(`${file}: "${ref}" points at a file that does not exist`);
        continue;
      }
      if (fragment !== undefined && fragment !== '' && ids.has(target) && !ids.get(target).has(fragment)) {
        problems.push(`${file}: "${ref}" points at a missing #${fragment}`);
      }
    }
    for (const m of text.matchAll(/<img\b[^>]*>/g)) problems.push(`${file}: unexpected <img> (${m[0].slice(0, 60)}); pictures are drawn inline`);
  }

  // url(...) references in the stylesheet
  for (const cssFile of walk(dist).filter((f) => f.endsWith('.css'))) {
    const text = readFileSync(cssFile, 'utf8');
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^(data:|https?:)/.test(m[1])) continue;
      if (!existsSync(join(dirname(cssFile), m[1]))) problems.push(`${relative(dist, cssFile)}: url(${m[1]}) does not exist`);
    }
  }

  // Forbidden strings: the built site, and everything else that gets committed.
  const sources = [
    ...walk(dist),
    ...walk(root, ['node_modules', 'dist', '.git', 'shots', 'package-lock.json']),
  ].filter((f) => TEXT.has(extname(f)) && !/OFL-/.test(f));
  for (const file of sources) {
    for (const label of findForbidden(readFileSync(file, 'utf8'))) {
      problems.push(`${relative(root, file)}: contains ${label}`);
    }
  }
  return problems;
}

if (process.argv[1] && process.argv[1].endsWith('check-links.mjs')) {
  const problems = check();
  if (problems.length) {
    console.error(problems.map((p) => `FAIL ${p}`).join('\n'));
    process.exit(1);
  }
  console.log('Links and content checks passed.');
}

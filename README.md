# Exortium website

A concept site for a small marketing agency that does not exist, designed as a
loud print poster: condensed headlines that fill the page width, flat red
blocks on cream, halftone dots, crop marks and a running marquee.

Hosted at <https://nathankagoro.github.io/exortium-website/> (GitHub Pages,
deployed from `main`). Part of the portfolio at <https://nathankagoro.com>.

## What is real and what is illustrative

Real:

- the design, the code and every drawing (inline SVG and one canvas; there are
  no photographs or raster images apart from the social preview);
- the hero network, which reacts to a pointer or a finger, pauses when it is
  off screen or the tab is hidden, and draws one still frame when the visitor
  prefers reduced motion;
- the form validation, the keyboard and swipe support, and the tests.

Illustrative, and labelled as such on every page:

- the agency, its three team members (Tamsin Vale, Corwin Ashby and Odalys
  Brandt are invented names with drawn portraits) and its three clients
  (Northbridge FC, Helios Taverna, Summit Ridge Roofing);
- the case studies, which are imagined briefs with no results claimed;
- the contact form. It checks what you type, then shows "Demo form. Nothing
  was sent." There is no inbox, phone number or address behind the site.

## Run, build and test

Needs Node 22 or later. The build itself has no dependencies; `npm install`
is only needed for the screenshot and preview-image tools.

```
npm run build         # writes the site to dist/
npm run serve         # http://127.0.0.1:4350/exortium-website/ (same subfolder as Pages)
npm test              # builds, then runs the unit tests and the link and content checks
npm install           # once, before the next two
npm run screenshots   # every page at 1440, 390 and 360 px into shots/
npm run og            # redraws src/assets/og.png
```

## How it is put together

```
build.mjs             wraps each page in the shared head, slug line, masthead and footer
src/pages/*.html      page bodies, with {{blocks}} filled in by the build
src/data.mjs          copy used on more than one page (services, case studies, team)
src/art.mjs           the SVG portraits, posters, stamp and printer's marks
src/css/styles.css    one stylesheet
src/js/site.js        menu, carousel, form and headline fitting
src/js/network.js     the canvas network
src/js/lib/           pure functions, unit-tested: form rules, node-count scaling, carousel index
test/                 node --test
tools/                link and content checker, static server, screenshots, preview image
```

`tools/check-links.mjs` fails on any dead internal link and on a short list of
strings from the original demo that must not be published again.

Two workflows run on GitHub: `ci.yml` builds, tests and uploads screenshots on
every push and pull request; `pages.yml` tests and deploys `dist/` on pushes
to `main`.

## Fonts

Anybody (Etcetera Type Co) for display and Archivo (Omnibus-Type) for text,
both self-hosted as Latin-subset variable WOFF2 under the SIL Open Font
License. The licence texts are in `src/assets/fonts/`.

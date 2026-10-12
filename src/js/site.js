import { validateContact } from './lib/form.js';
import { wrapIndex, indexFromScroll } from './lib/carousel.js';
import { startNetwork } from './network.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---- Headlines that fill the measure -------------------------------------
// Each line carries --k (font-size as a fraction of the container width) in
// the markup, so the first paint is already right. This re-measures once the
// real font has loaded, in case a fallback font was used or the copy changed.
function fitLines() {
  for (const line of document.querySelectorAll('.fit__line')) {
    const box = line.parentElement.getBoundingClientRect().width;
    if (!box || !line.offsetParent) continue;
    const range = document.createRange();
    range.selectNodeContents(line);
    const text = range.getBoundingClientRect().width;
    const size = parseFloat(getComputedStyle(line).fontSize);
    if (!text || !size) continue;
    const k = (size / text) * 0.995;
    line.style.setProperty('--k', k.toFixed(4));
  }
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLines);
window.fitLines = fitLines;

// ---- Menu (small screens) --------------------------------------------------
const menuButton = document.querySelector('.menu-btn');
const nav = document.getElementById('site-nav');
if (menuButton && nav) {
  const setOpen = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  menuButton.addEventListener('click', () => setOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      menuButton.focus();
    }
  });
}

// ---- Hero network ----------------------------------------------------------
const canvas = document.getElementById('network');
if (canvas) startNetwork(canvas, canvas.parentElement);

// ---- Marquee: pause control ------------------------------------------------
for (const marquee of document.querySelectorAll('.marquee')) {
  const button = marquee.querySelector('.marquee__toggle');
  if (!button) continue;
  button.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('span').textContent = paused ? 'Play' : 'Pause';
  });
}

// ---- Case-study carousel ---------------------------------------------------
// The track is a native scroll-snap row, so swiping and trackpads work without
// script. Script adds the buttons, arrow keys and the spoken status.
for (const carousel of document.querySelectorAll('.carousel')) {
  const track = carousel.querySelector('.carousel__track');
  const slides = [...track.children];
  const status = carousel.querySelector('.carousel__status');
  const count = carousel.querySelector('.carousel__count');
  const prev = carousel.querySelector('[data-dir="-1"]');
  const next = carousel.querySelector('[data-dir="1"]');
  let current = 0;

  const show = (index) => {
    const i = wrapIndex(index, slides.length);
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced.matches ? 'auto' : 'smooth' });
  };
  const announce = (i) => {
    if (i === current) return;
    current = i;
    const name = slides[i].querySelector('h3').textContent;
    status.textContent = `Case study ${i + 1} of ${slides.length}: ${name}`;
    count.textContent = `${i + 1} / ${slides.length}`;
  };

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  track.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (event.key === 'Home') show(0);
    else if (event.key === 'End') show(slides.length - 1);
    else if (step) show(current + step);
    else return;
    event.preventDefault();
  });
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      announce(indexFromScroll(track.scrollLeft, slides[0].getBoundingClientRect().width, slides.length));
    });
  }, { passive: true });
  carousel.classList.add('is-ready');
}

// ---- Demo contact form -----------------------------------------------------
for (const form of document.querySelectorAll('.contact-form')) {
  const status = form.querySelector('.contact-form__status');
  const fieldError = (name, message) => {
    const input = form.elements[name];
    const slot = form.querySelector(`[data-error-for="${name}"]`);
    slot.textContent = message || '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const result = validateContact(data);
    for (const name of ['name', 'email', 'purpose', 'message']) fieldError(name, result.errors[name]);
    if (!result.ok) {
      status.textContent = '';
      status.classList.remove('is-shown');
      form.elements[Object.keys(result.errors)[0]].focus();
      return;
    }
    form.reset();
    status.textContent = 'Demo form. Nothing was sent.';
    status.classList.add('is-shown');
  });

  form.addEventListener('input', (event) => {
    const name = event.target.name;
    if (name && event.target.hasAttribute('aria-invalid')) {
      const result = validateContact(Object.fromEntries(new FormData(form)));
      fieldError(name, result.errors[name]);
    }
  });
}

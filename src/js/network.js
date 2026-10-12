// Hero network: halftone dots joined by ink lines. The red dot is "you";
// it follows the pointer or a finger and draws lines to the nearest clients.
// The loop only runs while something is moving, the stage is on screen and
// the tab is visible. Under reduced motion a single still frame is drawn.

import { nodeCountFor, pixelRatioFor, mulberry32, buildNetwork, nearest, hopsFrom } from './lib/network-math.js';

const NAVY = '#182748';
const RED = '#fa2d1a';
const REACH = 190; // px: how far "you" can reach
const LINKS = 5; // how many clients you connect to at once

export function startNetwork(canvas, stage) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  let width = 0;
  let height = 0;
  let net = { nodes: [], edges: [], adjacency: [] };
  let state = []; // per node: ox, oy (offset from rest), vx, vy, glow, pulseAt
  let you = { x: 0, y: 0, on: false };
  let onScreen = true;
  let raf = 0;
  let last = 0;
  let introStart = 0;
  let introDone = false;
  let pulses = 0; // nodes still waiting to pulse

  function layout() {
    const rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    width = rect.width;
    height = rect.height;
    const ratio = pixelRatioFor(window.devicePixelRatio, coarse);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = nodeCountFor({ width, height, cores: navigator.hardwareConcurrency, coarse, saveData });
    net = buildNetwork(count, width, height, mulberry32(20250620));
    state = net.nodes.map(() => ({ ox: 0, oy: 0, vx: 0, vy: 0, glow: 0, pulseAt: 0 }));
    canvas.dataset.nodes = String(count);
    if (reduced.matches || introDone) {
      if (!you.on) restPosition();
      settle();
      draw(performance.now());
    } else {
      wake();
    }
  }

  function restPosition() {
    you = { x: width * 0.72, y: height * 0.8, on: true };
  }

  // Jump straight to the resting state for the current "you" position.
  function settle() {
    for (let i = 0; i < state.length; i += 1) {
      const t = target(i);
      Object.assign(state[i], { ox: t.x, oy: t.y, vx: 0, vy: 0, glow: t.glow });
    }
  }

  // Where a node wants to sit: pulled a little towards "you" when in reach.
  function target(i) {
    if (!you.on) return { x: 0, y: 0, glow: 0 };
    const n = net.nodes[i];
    const dx = you.x - n.x;
    const dy = you.y - n.y;
    const d = Math.hypot(dx, dy);
    if (d >= REACH || d < 0.001) return { x: 0, y: 0, glow: d < 0.001 ? 1 : 0 };
    const pull = (1 - d / REACH) ** 2;
    return { x: dx * pull * 0.32, y: dy * pull * 0.32, glow: pull };
  }

  function step(now, dt) {
    let moving = false;
    if (!introDone) {
      const t = (now - introStart) / 2600;
      if (t >= 1) {
        introDone = true;
        restPosition();
      } else {
        // One sweep across the stage so the idea is clear before anyone touches it.
        const e = t * t * (3 - 2 * t);
        you = {
          x: width * (0.12 + 0.6 * e),
          y: height * (0.8 - Math.sin(e * Math.PI) * 0.34),
          on: true,
        };
        moving = true;
      }
    }
    const k = Math.min(1, dt * 9);
    for (let i = 0; i < state.length; i += 1) {
      const s = state[i];
      const t = target(i);
      s.vx = (s.vx + (t.x - s.ox) * dt * 60) * 0.82;
      s.vy = (s.vy + (t.y - s.oy) * dt * 60) * 0.82;
      s.ox += s.vx * dt * 6;
      s.oy += s.vy * dt * 6;
      let glow = t.glow;
      if (s.pulseAt) {
        const age = now - s.pulseAt;
        if (age > 520) {
          s.pulseAt = 0;
          pulses -= 1;
        } else {
          if (age >= 0) glow = Math.max(glow, Math.sin((age / 520) * Math.PI));
          moving = true;
        }
      }
      s.glow += (glow - s.glow) * k;
      if (Math.abs(s.vx) + Math.abs(s.vy) > 0.02 || Math.abs(glow - s.glow) > 0.01 ||
          Math.abs(t.x - s.ox) + Math.abs(t.y - s.oy) > 0.1) moving = true;
    }
    return moving;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const { nodes, edges } = net;
    const px = (i) => nodes[i].x + state[i].ox;
    const py = (i) => nodes[i].y + state[i].oy;

    // Ink lines between neighbouring clients.
    ctx.lineCap = 'round';
    ctx.strokeStyle = NAVY;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const [a, b] of edges) {
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Your lines: thicker, red, to the nearest few.
    if (you.on) {
      const moved = nodes.map((n, i) => ({ x: px(i), y: py(i) }));
      const linked = nearest(moved, you.x, you.y, LINKS, REACH);
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const i of linked) {
        ctx.moveTo(you.x, you.y);
        ctx.lineTo(moved[i].x, moved[i].y);
      }
      ctx.stroke();
    }

    // Halftone dots: they swell when you are close or when word reaches them.
    for (let pass = 0; pass < 2; pass += 1) {
      ctx.fillStyle = pass === 0 ? NAVY : RED;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i += 1) {
        const hot = nodes[i].accent || state[i].glow > 0.45;
        if (hot !== (pass === 1)) continue;
        const r = nodes[i].r * (1 + state[i].glow * 1.5);
        const x = px(i);
        const y = py(i);
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    if (you.on) {
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(you.x, you.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(you.x + 3, you.y + 3, 13, 0, Math.PI * 2); // deliberately off-register
      ctx.stroke();
    }
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const moving = step(now, dt);
    draw();
    if (moving && canRun()) raf = requestAnimationFrame(frame);
  }

  function canRun() {
    return onScreen && !document.hidden && !reduced.matches;
  }

  function wake() {
    if (raf || !canRun()) return;
    if (!introDone && !introStart) introStart = performance.now();
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function sleep() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function place(event) {
    const rect = stage.getBoundingClientRect();
    you = { x: event.clientX - rect.left, y: event.clientY - rect.top, on: true };
    introDone = true;
  }

  // Word of mouth: a tap sends a pulse outwards along the lines, one hop at a time.
  function ripple() {
    const from = nearest(net.nodes, you.x, you.y, 1)[0];
    if (from === undefined) return;
    const hops = hopsFrom(net.adjacency, from);
    const now = performance.now();
    hops.forEach((h, i) => {
      if (h < 0 || h > 9) return;
      if (!state[i].pulseAt) pulses += 1;
      state[i].pulseAt = now + h * 80;
    });
  }

  function still() {
    settle();
    draw();
  }

  stage.addEventListener('pointermove', (event) => {
    place(event);
    if (reduced.matches) still();
    else wake();
  }, { passive: true });

  stage.addEventListener('pointerdown', (event) => {
    place(event);
    if (reduced.matches) {
      still();
      return;
    }
    ripple();
    wake();
  }, { passive: true });

  new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    if (onScreen) wake();
    else sleep();
  }).observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) sleep();
    else wake();
  });

  reduced.addEventListener('change', () => {
    sleep();
    introDone = true;
    layout();
  });

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const rect = stage.getBoundingClientRect();
      if (Math.abs(rect.width - width) > 1 || Math.abs(rect.height - height) > 1) layout();
    }, 120);
  }).observe(stage);

  if (reduced.matches) introDone = true;
  layout();
}

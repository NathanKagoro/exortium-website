// Geometry for the hero network. No DOM access here, so Node can test it.

export const NODE_MIN = 18;
export const NODE_MAX = 150;
const AREA_PER_NODE = 9000; // CSS px squared: one dot per roughly 95 x 95 px

/**
 * How many dots to draw. Scales with the stage area, then is capped by what
 * the device can comfortably animate.
 */
export function nodeCountFor({ width, height, cores = 8, coarse = false, saveData = false } = {}) {
  const w = Number(width);
  const h = Number(height);
  if (!(w > 0) || !(h > 0)) return 0;
  let cap = NODE_MAX;
  if (coarse) cap = Math.min(cap, 70); // phones and tablets
  if (cores && cores <= 4) cap = Math.min(cap, 60); // low-end processors
  if (saveData) cap = Math.min(cap, 36);
  const byArea = Math.round((w * h) / AREA_PER_NODE);
  return Math.max(NODE_MIN, Math.min(cap, byArea));
}

// Canvas backing-store scale: never more than 2x, less work on small devices.
export function pixelRatioFor(dpr = 1, coarse = false) {
  const d = Number(dpr) > 0 ? Number(dpr) : 1;
  return Math.max(1, Math.min(d, coarse ? 1.5 : 2));
}

// Small seeded generator so the layout is the same on every visit and resize.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Jittered grid of nodes joined to their nearest neighbours.
 * @returns {{nodes: {x:number,y:number,r:number,accent:boolean}[], edges: [number, number][], adjacency: number[][]}}
 */
export function buildNetwork(count, width, height, rng = Math.random, neighbours = 2) {
  const nodes = [];
  const edges = [];
  const adjacency = [];
  if (!(count > 0) || !(width > 0) || !(height > 0)) return { nodes, edges, adjacency };

  const cols = Math.max(1, Math.round(Math.sqrt((count * width) / height)));
  const rows = Math.ceil(count / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  for (let i = 0; i < count; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    nodes.push({
      x: (col + 0.5 + (rng() - 0.5) * 0.8) * cellW,
      y: (row + 0.5 + (rng() - 0.5) * 0.8) * cellH,
      r: 2.2 + rng() * 3.6,
      accent: rng() < 0.16,
    });
    adjacency.push([]);
  }

  const seen = new Set();
  const link = (a, b) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = lo * count + hi;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push([lo, hi]);
    adjacency[lo].push(hi);
    adjacency[hi].push(lo);
  };

  for (let i = 0; i < count; i += 1) {
    const near = nearest(nodes, nodes[i].x, nodes[i].y, neighbours + 1, Infinity);
    for (const j of near) link(i, j);
  }
  return { nodes, edges, adjacency };
}

// Indices of the k nodes closest to a point, nearest first, within maxDist.
export function nearest(nodes, x, y, k, maxDist = Infinity) {
  const max2 = maxDist * maxDist;
  const found = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const dx = nodes[i].x - x;
    const dy = nodes[i].y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= max2) found.push([d2, i]);
  }
  found.sort((a, b) => a[0] - b[0]);
  return found.slice(0, k).map((f) => f[1]);
}

// Breadth-first hop count from one node to every other (-1 if unreachable).
export function hopsFrom(adjacency, start) {
  const hops = new Array(adjacency.length).fill(-1);
  if (start < 0 || start >= adjacency.length) return hops;
  hops[start] = 0;
  const queue = [start];
  for (let q = 0; q < queue.length; q += 1) {
    const at = queue[q];
    for (const next of adjacency[at]) {
      if (hops[next] === -1) {
        hops[next] = hops[at] + 1;
        queue.push(next);
      }
    }
  }
  return hops;
}

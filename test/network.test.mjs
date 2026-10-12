import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nodeCountFor, pixelRatioFor, mulberry32, buildNetwork, nearest, hopsFrom, NODE_MIN, NODE_MAX,
} from '../src/js/lib/network-math.js';
import { wrapIndex, indexFromScroll } from '../src/js/lib/carousel.js';

test('node count scales with the stage area', () => {
  const phone = nodeCountFor({ width: 360, height: 520 });
  const laptop = nodeCountFor({ width: 1440, height: 760 });
  assert.ok(phone < laptop, `${phone} < ${laptop}`);
  assert.equal(nodeCountFor({ width: 900, height: 900 }), 90);
});

test('node count stays far below the original 520 and inside its limits', () => {
  for (const [width, height] of [[320, 300], [360, 640], [1440, 800], [2560, 1300], [5120, 2880]]) {
    const n = nodeCountFor({ width, height });
    assert.ok(n >= NODE_MIN && n <= NODE_MAX, `${width}x${height} gave ${n}`);
  }
  assert.equal(nodeCountFor({ width: 5120, height: 2880 }), NODE_MAX);
  assert.equal(nodeCountFor({ width: 100, height: 100 }), NODE_MIN);
  assert.ok(NODE_MAX <= 150);
});

test('touch devices, slow processors and data saver get fewer nodes', () => {
  const big = { width: 1920, height: 1080 };
  assert.equal(nodeCountFor(big), NODE_MAX);
  assert.equal(nodeCountFor({ ...big, coarse: true }), 70);
  assert.equal(nodeCountFor({ ...big, cores: 4 }), 60);
  assert.equal(nodeCountFor({ ...big, coarse: true, cores: 2 }), 60);
  assert.equal(nodeCountFor({ ...big, saveData: true }), 36);
  assert.equal(nodeCountFor({ ...big, cores: undefined }), NODE_MAX);
});

test('a stage with no size gets no nodes', () => {
  assert.equal(nodeCountFor({ width: 0, height: 500 }), 0);
  assert.equal(nodeCountFor({ width: 500, height: -1 }), 0);
  assert.equal(nodeCountFor({ width: NaN, height: 500 }), 0);
  assert.equal(nodeCountFor(), 0);
});

test('canvas pixel ratio is capped', () => {
  assert.equal(pixelRatioFor(1), 1);
  assert.equal(pixelRatioFor(3), 2);
  assert.equal(pixelRatioFor(3, true), 1.5);
  assert.equal(pixelRatioFor(0.5), 1);
  assert.equal(pixelRatioFor(undefined), 1);
});

test('seeded generator repeats and stays in [0, 1)', () => {
  const a = mulberry32(7);
  const b = mulberry32(7);
  for (let i = 0; i < 200; i += 1) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test('network has the requested nodes, all inside the stage', () => {
  const { nodes, edges, adjacency } = buildNetwork(80, 1200, 600, mulberry32(1));
  assert.equal(nodes.length, 80);
  assert.equal(adjacency.length, 80);
  for (const n of nodes) {
    assert.ok(n.x >= 0 && n.x <= 1200 && n.y >= 0 && n.y <= 600);
    assert.ok(n.r > 0);
  }
  assert.ok(edges.length >= 80, 'each node links to at least one neighbour');
});

test('edges are unique, never self-links, and mirrored in the adjacency list', () => {
  const { edges, adjacency } = buildNetwork(60, 800, 500, mulberry32(3));
  const seen = new Set();
  for (const [a, b] of edges) {
    assert.ok(a < b);
    assert.ok(!seen.has(`${a}-${b}`));
    seen.add(`${a}-${b}`);
    assert.ok(adjacency[a].includes(b) && adjacency[b].includes(a));
  }
  for (const list of adjacency) assert.ok(list.length >= 2);
});

test('the same seed gives the same layout', () => {
  const a = buildNetwork(40, 700, 400, mulberry32(9));
  const b = buildNetwork(40, 700, 400, mulberry32(9));
  assert.deepEqual(a, b);
});

test('empty or impossible networks come back empty', () => {
  assert.deepEqual(buildNetwork(0, 100, 100), { nodes: [], edges: [], adjacency: [] });
  assert.deepEqual(buildNetwork(10, 0, 100), { nodes: [], edges: [], adjacency: [] });
});

test('nearest returns the closest nodes first, within range', () => {
  const nodes = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 100, y: 0 }, { x: 3, y: 4 }];
  assert.deepEqual(nearest(nodes, 0, 0, 3), [0, 3, 1]);
  assert.deepEqual(nearest(nodes, 0, 0, 5, 6), [0, 3]);
  assert.deepEqual(nearest(nodes, 500, 500, 2, 10), []);
  assert.deepEqual(nearest([], 0, 0, 2), []);
});

test('hop counts spread outwards one link at a time', () => {
  const chain = [[1], [0, 2], [1, 3], [2], []];
  assert.deepEqual(hopsFrom(chain, 0), [0, 1, 2, 3, -1]);
  assert.deepEqual(hopsFrom(chain, 2), [2, 1, 0, 1, -1]);
  assert.deepEqual(hopsFrom(chain, 9), [-1, -1, -1, -1, -1]);
});

test('carousel index wraps in both directions', () => {
  assert.equal(wrapIndex(3, 3), 0);
  assert.equal(wrapIndex(-1, 3), 2);
  assert.equal(wrapIndex(-4, 3), 2);
  assert.equal(wrapIndex(1, 3), 1);
  assert.equal(wrapIndex(5, 0), 0);
});

test('carousel index follows the scroll position', () => {
  assert.equal(indexFromScroll(0, 400, 3), 0);
  assert.equal(indexFromScroll(190, 400, 3), 0);
  assert.equal(indexFromScroll(210, 400, 3), 1);
  assert.equal(indexFromScroll(800, 400, 3), 2);
  assert.equal(indexFromScroll(5000, 400, 3), 2);
  assert.equal(indexFromScroll(-50, 400, 3), 0);
  assert.equal(indexFromScroll(100, 0, 3), 0);
});

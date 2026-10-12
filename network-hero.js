(() => {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const settings = {
    nodeCount: 520,
    edgeDistance: 145,
    connectionNeighbors: 3,
    worldScale: 2.8,
    driftSpeedX: 28,
    driftSpeedY: 19,
    jitterAmplitude: 14,
    jitterSpeed: 0.00055,
    pulseSpeed: 0.0013,
  };

  let w = 0;
  let h = 0;
  let ratio = 1;
  let worldW = 0;
  let worldH = 0;
  let cameraX = 0;
  let cameraY = 0;
  let cameraVX = settings.driftSpeedX;
  let cameraVY = settings.driftSpeedY;
  let rafId = 0;
  let prevTs = performance.now();

  const nodes = [];
  const edges = [];

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function rebuildNodes() {
    nodes.length = 0;
    edges.length = 0;

    const cols = Math.ceil(Math.sqrt((settings.nodeCount * worldW) / worldH));
    const rows = Math.ceil(settings.nodeCount / cols);
    const cellW = worldW / cols;
    const cellH = worldH / rows;
    const jitterX = cellW * 0.42;
    const jitterY = cellH * 0.42;

    for (let i = 0; i < settings.nodeCount; i += 1) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const centerX = (col + 0.5) * cellW;
      const centerY = (row + 0.5) * cellH;
      nodes.push({
        baseX: Math.max(0, Math.min(worldW, centerX + random(-jitterX, jitterX))),
        baseY: Math.max(0, Math.min(worldH, centerY + random(-jitterY, jitterY))),
        phaseX: random(0, Math.PI * 2),
        phaseY: random(0, Math.PI * 2),
        size: random(1.2, 2.9),
      });
    }

    const edgeKeys = new Set();
    function addEdge(a, b) {
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      const key = `${min}-${max}`;
      if (min === max || edgeKeys.has(key)) return;
      edgeKeys.add(key);
      edges.push([min, max]);
    }

    // Spanning tree guarantees one connected network across all nodes.
    for (let i = 1; i < nodes.length; i += 1) {
      let bestIdx = 0;
      let bestDist2 = Infinity;
      for (let j = 0; j < i; j += 1) {
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          bestIdx = j;
        }
      }
      addEdge(i, bestIdx);
    }

    // Add local links for density and richer visual structure.
    for (let i = 0; i < nodes.length; i += 1) {
      const nearest = [];
      for (let j = 0; j < nodes.length; j += 1) {
        if (i === j) continue;
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const d2 = dx * dx + dy * dy;
        nearest.push({ idx: j, d2 });
      }

      nearest.sort((a, b) => a.d2 - b.d2);
      for (let k = 0; k < settings.connectionNeighbors; k += 1) {
        addEdge(i, nearest[k].idx);
      }
    }

    cameraX = random(worldW * 0.2, worldW * 0.6);
    cameraY = random(worldH * 0.2, worldH * 0.6);
  }

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    worldW = Math.max(w * settings.worldScale, 1800);
    worldH = Math.max(h * settings.worldScale, 1300);
    rebuildNodes();
  }

  function updateCamera(dt) {
    cameraX += cameraVX * dt;
    cameraY += cameraVY * dt;

    const minX = 0;
    const minY = 0;
    const maxX = worldW - w;
    const maxY = worldH - h;

    if (cameraX <= minX || cameraX >= maxX) cameraVX *= -1;
    if (cameraY <= minY || cameraY >= maxY) cameraVY *= -1;

    cameraX = Math.max(minX, Math.min(cameraX, maxX));
    cameraY = Math.max(minY, Math.min(cameraY, maxY));
  }

  function draw(ts) {
    const dt = Math.min((ts - prevTs) / 1000, 0.04);
    prevTs = ts;

    updateCamera(dt);
    ctx.clearRect(0, 0, w, h);

    const projected = new Array(nodes.length);
    const visibleIndexes = [];

    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[i];
      const x = n.baseX + Math.cos(ts * settings.jitterSpeed + n.phaseX) * settings.jitterAmplitude;
      const y = n.baseY + Math.sin(ts * settings.jitterSpeed + n.phaseY) * settings.jitterAmplitude;
      const sx = x - cameraX;
      const sy = y - cameraY;
      const visible = sx > -160 && sx < w + 160 && sy > -160 && sy < h + 160;

      projected[i] = { x: sx, y: sy, size: n.size, pulse: n.phaseX, visible };
      if (visible) visibleIndexes.push(i);
    }

    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      const a = projected[edge[0]];
      const b = projected[edge[1]];
      if (!a.visible && !b.visible) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      const maxRenderDist = settings.edgeDistance * settings.edgeDistance * 3.4;
      if (d2 > maxRenderDist) continue;

      const d = Math.sqrt(d2);
      const alpha = Math.max(0.28, 1 - d / (settings.edgeDistance * 1.85));
      ctx.strokeStyle = alpha > 0.62 ? `rgba(79, 191, 255, ${alpha * 0.86})` : `rgba(22, 106, 255, ${alpha * 0.48})`;
      ctx.lineWidth = alpha > 0.62 ? 1.45 : 0.9;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (let i = 0; i < visibleIndexes.length; i += 1) {
      const n = projected[visibleIndexes[i]];
      const pulse = 0.75 + Math.sin(ts * settings.pulseSpeed + n.pulse) * 0.25;

      ctx.fillStyle = `rgba(69, 178, 255, ${0.72 + pulse * 0.24})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(40, 125, 255, ${0.22 + pulse * 0.26})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size * 2.7, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  rafId = requestAnimationFrame(draw);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
  });
})();

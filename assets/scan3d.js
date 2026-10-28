/* 3D 점검 네트워크 배경(장식). 의존 라이브러리 없음 · 캔버스 2D 원근 투영.
   노드 49개 = 기본 점검 항목 수. 스캔 면이 지나가면 노드가 점멸합니다. */
(function () {
  'use strict';
  var host = document.querySelector('[data-scan]');
  if (!host || host.querySelector('canvas')) return;
  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  var ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return;
  host.insertBefore(cv, host.firstChild);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;

  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var r = rng(7), counts = [8, 4, 3, 9, 5, 5, 2, 1, 7, 2, 3], nodes = [], cols = ['#34d399', '#fbbf24', '#f87171'];
  counts.forEach(function (n, ci) {
    var a = ci / counts.length * Math.PI * 2, cx = Math.cos(a) * 330, cy = (r() - 0.5) * 220, cz = Math.sin(a) * 330;
    for (var k = 0; k < n; k++) nodes.push({ x: cx + (r() - 0.5) * 150, y: cy + (r() - 0.5) * 110, z: cz + (r() - 0.5) * 150, c: cols[Math.floor(r() * 3)], s: 2.2 + r() * 2.4, ph: r() * 6.28 });
  });
  var edges = [];
  for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
    var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
    if (dx * dx + dy * dy + dz * dz < 150 * 150) edges.push([i, j]);
  }
  var dust = []; for (var d = 0; d < 70; d++) dust.push({ x: (r() - 0.5) * 1100, y: (r() - 0.5) * 600, z: (r() - 0.5) * 1100 });

  var rotY = 0.4, rotX = 0.18, tY = 0.4, tX = 0.18, scrollK = 0, t0 = performance.now(), running = false, raf = 0, visible = true;

  function resize() {
    var b = host.getBoundingClientRect(); W = Math.max(1, b.width); H = Math.max(1, b.height);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function proj(p, cy, sy, cx, sx) {
    var x = p.x * cy + p.z * sy, z = -p.x * sy + p.z * cy, y = p.y * cx - z * sx; z = p.y * sx + z * cx;
    var f = 760 / (760 + z + 120 - scrollK * 120); var m = W < 700; return { x: W * (m ? 0.55 : 0.68) + x * f * (m ? 0.5 : 0.95), y: H * (m ? 0.82 : 0.5) + y * f * (m ? 0.5 : 0.95), f: f, z: z };
  }
  function frame(now) {
    var tm = (now - t0) / 1000;
    if (!reduce) { tY += 0.0016; }
    rotY += (tY - rotY) * 0.06; rotX += (tX - rotX) * 0.06;
    ctx.clearRect(0, 0, W, H);
    var cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
    var scan = ((tm * 0.22) % 1.4) - 0.2; // 0~1 구간을 위에서 아래로 훑는다
    var P = nodes.map(function (n) { return proj(n, cy, sy, cx, sx); });
    ctx.lineWidth = 1;
    edges.forEach(function (e) { var a = P[e[0]], b = P[e[1]]; ctx.strokeStyle = 'rgba(34,211,238,' + (0.1 + 0.18 * Math.min(a.f, b.f)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    dust.forEach(function (d) { var p = proj(d, cy, sy, cx, sx); ctx.fillStyle = 'rgba(148,163,184,' + (0.12 + 0.2 * p.f).toFixed(3) + ')'; ctx.fillRect(p.x, p.y, 1.4, 1.4); });
    var order = nodes.map(function (_, k) { return k; }).sort(function (a, b) { return P[b].z - P[a].z; });
    order.forEach(function (k) {
      var n = nodes[k], p = P[k], yy = (p.y / H), hit = Math.max(0, 1 - Math.abs(yy - scan) * 7);
      if (reduce) hit = 0;
      var rad = n.s * p.f * (1.5 + hit * 2.2), glow = 0.45 + 0.35 * Math.sin(tm * 1.4 + n.ph) * (reduce ? 0 : 1) + hit;
      ctx.globalAlpha = Math.min(1, 0.35 + 0.5 * p.f + hit * 0.5);
      ctx.fillStyle = n.c; ctx.shadowColor = n.c; ctx.shadowBlur = (6 + hit * 22) * p.f * Math.min(1.2, glow + 0.4);
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, rad), 0, 6.283); ctx.fill();
      if (hit > 0.25) { ctx.shadowBlur = 0; ctx.strokeStyle = n.c; ctx.globalAlpha = hit * 0.7; ctx.beginPath(); ctx.arc(p.x, p.y, rad + 6 + hit * 8, 0, 6.283); ctx.stroke(); }
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    var sy0 = scan * H; if (!reduce && scan > 0 && scan < 1) { var g = ctx.createLinearGradient(0, sy0 - 40, 0, sy0 + 2); g.addColorStop(0, 'rgba(34,211,238,0)'); g.addColorStop(1, 'rgba(34,211,238,.22)'); ctx.fillStyle = g; ctx.fillRect(0, sy0 - 40, W, 42); }
  }
  function loop(now) { if (!running) return; frame(now); raf = requestAnimationFrame(loop); }
  function start() { if (reduce || running || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize(); frame(performance.now()); host.classList.add('is-live');
  if (!reduce) {
    host.addEventListener('pointermove', function (e) { var b = host.getBoundingClientRect(); tY = 0.4 + ((e.clientX - b.left) / b.width - 0.5) * 1.1; tX = 0.18 + ((e.clientY - b.top) / b.height - 0.5) * 0.5; }, { passive: true });
    window.addEventListener('scroll', function () { var k = Math.min(1, window.scrollY / Math.max(1, H)); scrollK = k; }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(host);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  }
  window.addEventListener('resize', function () { resize(); if (!running) frame(performance.now()); });
})();

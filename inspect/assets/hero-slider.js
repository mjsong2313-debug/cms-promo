/* 첫 화면 자동 넘김(3장). 마우스를 올리거나 키보드로 들어오면 멈추고, 일시정지 버튼이 있으며,
   '움직임 줄이기' 설정이면 자동으로 넘기지 않습니다. 3번째 장의 움직이는 배경은 그 장이 보일 때만 그립니다. */
(function () {
  'use strict';
  var root = document.querySelector('[data-hs]');
  if (!root) return;
  var slides = [].slice.call(root.querySelectorAll('.hs-slide'));
  var N = slides.length; if (N < 2) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INTERVAL = 8000;
  var cur = 0, timer = null, paused = reduce, hover = false, hidden = false;
  var bars = [].slice.call(root.querySelectorAll('.hs-dot'));
  var count = root.querySelector('.hs-count');
  var pauseBtn = root.querySelector('.hs-pause');
  var live = root.querySelector('.hs-track');
  root.classList.add('hs-ready');

  function show(i, user) {
    i = (i + N) % N; cur = i;
    slides.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) s.removeAttribute('inert'); else s.setAttribute('inert', '');
    });
    bars.forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (count) count.textContent = '0' + (i + 1) + ' / 0' + N;
    root.setAttribute('data-theme-now', slides[i].getAttribute('data-theme') || '');
    restart();
    net.toggle(slides[i].hasAttribute('data-net'));
    if (user) live.setAttribute('aria-live', 'polite');
  }
  function restart() {
    root.classList.remove('hs-run'); void root.offsetWidth;
    if (!paused) root.classList.add('hs-run');
    clearTimeout(timer);
    if (!paused && !hover && !hidden && cur < N - 1) timer = setTimeout(function () { show(cur + 1); }, INTERVAL);
  }
  function setPaused(p) {
    paused = p; root.classList.toggle('is-paused', p);
    if (pauseBtn) { pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false'); pauseBtn.setAttribute('aria-label', p ? '자동 넘김 다시 시작' : '자동 넘김 멈춤'); pauseBtn.querySelector('span').textContent = p ? '▶' : '❚❚'; }
    live.setAttribute('aria-live', p ? 'polite' : 'off');
    restart();
  }

  /* ---- 움직이는 배경(3번째 장): 점들이 이어지고 용어가 떠다닙니다 ---- */
  var net = (function () {
    var cv = root.querySelector('.hs-net'); if (!cv || !cv.getContext) return { toggle: function () {} };
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, pts = [], run = false, raf = 0, mx = 0, my = 0, tx = 0, ty = 0, inView = true;
    var LIGHT = cv.hasAttribute('data-light');
    var WORDS = (cv.getAttribute('data-words') || '').split('|').filter(Boolean);
    function size() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      var narrow = W < 700, n = narrow ? 22 : 44; pts = [];
      var cols = narrow ? 2 : 3, x0 = narrow ? .08 : (LIGHT ? .53 : .46), x1 = narrow ? .6 : (LIGHT ? .86 : .8), rows = Math.ceil(WORDS.length / cols);
      for (var i = 0; i < n; i++) {
        var lab = i < WORDS.length ? WORDS[i] : '', px, py;
        if (lab) { var cx = i % cols, cy = Math.floor(i / cols); px = (x0 + (cx + .15 + Math.random() * .6) / cols * (x1 - x0)) * W; py = (.07 + (cy + .15 + Math.random() * .6) / rows * .86) * H; }
        else { px = (.02 + Math.random() * .95) * W; py = (.08 + Math.random() * .86) * H; }
        pts.push({ x: px, y: py, vx: (Math.random() - .5) * (lab ? .12 : .22), vy: (Math.random() - .5) * (lab ? .12 : .22), r: lab ? 3.4 : 1.4 + Math.random() * 1.8,
          z: .5 + Math.random() * .9, lab: lab, ph: Math.random() * 6.28 });
      }
    }
    function frame(t) {
      raf = 0; if (!run || !inView) return;
      ctx.clearRect(0, 0, W, H);
      tx += (mx - tx) * .05; ty += (my - ty) * .05;
      var i, j, a, b, dx, dy, d, narrow = W < 700, maxD = narrow ? 110 : 150;
      for (i = 0; i < pts.length; i++) {
        a = pts[i]; a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
        a = pts[i]; b = pts[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d < maxD * maxD) { ctx.strokeStyle = (LIGHT ? 'rgba(31,107,255,' : 'rgba(255,150,60,') + ((LIGHT ? .42 : .34) * (1 - Math.sqrt(d) / maxD)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x + tx * a.z * 14, a.y + ty * a.z * 14); ctx.lineTo(b.x + tx * b.z * 14, b.y + ty * b.z * 14); ctx.stroke(); }
      }
      for (i = 0; i < pts.length; i++) {
        a = pts[i]; var px = a.x + tx * a.z * 14, py = a.y + ty * a.z * 14, pulse = .75 + .25 * Math.sin(t / 700 + a.ph);
        var g = ctx.createRadialGradient(px, py, 0, px, py, a.r * 5);
        g.addColorStop(0, (LIGHT ? (a.lab ? 'rgba(229,40,75,' : 'rgba(31,107,255,') : 'rgba(255,170,70,') + (.95 * pulse).toFixed(2) + ')'); g.addColorStop(1, LIGHT ? (a.lab ? 'rgba(229,40,75,0)' : 'rgba(31,107,255,0)') : 'rgba(255,110,30,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, a.r * 5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = LIGHT ? (a.lab ? '#e5284b' : '#1f6bff') : '#ffd9a8'; ctx.beginPath(); ctx.arc(px, py, a.r * .8, 0, 6.2832); ctx.fill();
        if (a.lab) {
          ctx.font = '600 ' + (narrow ? 14 : 19) + 'px "Pretendard","Noto Sans KR","Malgun Gothic",system-ui,sans-serif';
          ctx.fillStyle = (LIGHT ? 'rgba(10,23,48,' : 'rgba(255,255,255,') + (.72 + .28 * pulse).toFixed(2) + ')'; ctx.textBaseline = 'middle';
          ctx.fillText(a.lab, px + a.r * 3 + 8, py);
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!run) { run = true; size(); } if (!raf && !reduce) raf = requestAnimationFrame(frame); if (reduce) { frame(0); } }
    function stop() { run = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    if (reduce) { /* 정지 화면 한 장만 그립니다 */ }
    root.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - .5) * 2; my = ((e.clientY - r.top) / r.height - .5) * 2; });
    window.addEventListener('resize', function () { if (run) size(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView && run && !raf && !reduce) raf = requestAnimationFrame(frame); }).observe(root);
    return { toggle: function (on) { if (on) start(); else stop(); } };
  })();

  /* ---- 조작 ---- */
  var prev = root.querySelector('.hs-prev'), next = root.querySelector('.hs-next');
  if (prev) prev.addEventListener('click', function () { show(cur - 1, true); });
  if (next) next.addEventListener('click', function () { show(cur + 1, true); });
  bars.forEach(function (b, k) { b.addEventListener('click', function () { show(k, true); }); });
  if (pauseBtn) pauseBtn.addEventListener('click', function () { setPaused(!paused); });
  root.addEventListener('mouseenter', function () { hover = true; clearTimeout(timer); });
  root.addEventListener('mouseleave', function () { hover = false; restart(); });
  root.addEventListener('focusin', function () { hover = true; clearTimeout(timer); });
  root.addEventListener('focusout', function () { hover = false; restart(); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(cur - 1, true); } else if (e.key === 'ArrowRight') { show(cur + 1, true); }
  });
  var sx = 0, sy = 0, st = false;
  root.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = true; hover = true; clearTimeout(timer); }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (!st) return; st = false; hover = false; var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) show(cur + (dx < 0 ? 1 : -1), true); else restart();
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; restart(); });

  /* ---- 1번째 장의 숫자 올라가기 ---- */
  var cnt = root.querySelector('[data-hs-count]');
  if (cnt && !reduce) { var to = +cnt.getAttribute('data-hs-count') || 0, k = 0; cnt.textContent = '0';
    var iv = setInterval(function () { k++; cnt.textContent = String(Math.max(0, Math.min(k, to))); if (k >= to) k = -2; }, 1100); }

  setPaused(reduce);
  show(0);
})();

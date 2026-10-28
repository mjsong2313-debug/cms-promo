/* 움직이는 설명 그림 구동: 화면에 보이면 한 번 재생, '다시 보기'로 재생. 움직임 줄이기 설정이면 마지막 장면만 보여 줍니다. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play(el) { el.classList.remove('fin'); el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); }
  [].forEach.call(document.querySelectorAll('[data-anim]'), function (el) {
    var btn = el.querySelector('.anim-replay');
    if (btn) btn.addEventListener('click', function () { play(el); });
    if (reduce || !('IntersectionObserver' in window)) { el.classList.add('fin'); if (btn) btn.hidden = true; return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { play(el); io.unobserve(el); } }); }, { threshold: 0.3 });
    io.observe(el);
    setTimeout(function () { if (!el.classList.contains('play')) el.classList.add('fin'); }, 6000);
  });

  [].forEach.call(document.querySelectorAll('[data-skinv]'), function (v) {
    var tabs = [].slice.call(v.querySelectorAll('[role=tab]'));
    var imgs = [].slice.call(v.querySelectorAll('img[data-i]'));
    var nameEl = v.querySelector('[data-cap-name]'), descEl = v.querySelector('[data-cap-desc]');
    var names = tabs.map(function (t) { return t.textContent.trim(); });
    var DESC = JSON.parse(v.getAttribute('data-desc') || '[]'), BR = JSON.parse(v.getAttribute('data-brand') || '[]'), brEl = v.querySelector('[data-cap-brand]');
    var panes = [].slice.call(v.querySelectorAll('.skinv-pc,.phone'));
    var cur = 0, timer = 0, touched = false;
    function set(i) {
      cur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      imgs.forEach(function (im) { im.classList.toggle('on', +im.getAttribute('data-i') === i); });
      if (nameEl) nameEl.textContent = names[i];
      if (descEl) descEl.textContent = DESC[i] || '';
      if (brEl) brEl.textContent = BR[i] || '';
      panes.forEach(function (p) { p.scrollTop = 0; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { touched = true; stop(); set(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = -1;
        if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i + n - 1) % n;
        if (j >= 0) { e.preventDefault(); touched = true; stop(); set(j); tabs[j].focus(); }
      });
    });
    ['wheel', 'touchstart', 'pointerdown', 'scroll'].forEach(function (ev) { panes.forEach(function (p) { p.addEventListener(ev, function () { touched = true; stop(); }, { passive: true }); }); });
    function stop() { if (timer) { clearInterval(timer); timer = 0; } }
    function start() { if (reduce || touched || timer) return; timer = setInterval(function () { set((cur + 1) % tabs.length); }, 4200); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.4 }).observe(v);
  });
})();

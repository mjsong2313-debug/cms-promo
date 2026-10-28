/* home4.js — 두 홈 공통 움직임. 스크립트가 없어도 내용은 모두 보인다(html.js 일 때만 숨김→나타남). */
(function () {
  'use strict';
  var d = document, de = d.documentElement, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = 'IntersectionObserver' in window;

  /* 머리글 */
  var hd = $('.hd');
  function onScroll() {
    var y = window.scrollY || 0;
    if (hd) hd.classList.toggle('solid', y > 20);
    var tt = $('.totop'); if (tt) tt.classList.toggle('on', y > 900);
    var dk = $('.dock'); if (dk) dk.classList.toggle('on', y > 520);
    var pg = $('.pg');
    if (pg && !CSS.supports('animation-timeline: scroll()')) {
      var h = de.scrollHeight - innerHeight; pg.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var tt = $('.totop'); if (tt) tt.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* 나타나기 */
  var rv = $$('.rv');
  if (io && !reduce) {
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(function (n, i) { n.style.setProperty('--i', (i % 4)); o.observe(n); });
  } else rv.forEach(function (n) { n.classList.add('in'); });

  /* 한 번 보이면 켜지는 것들(보고서·주소표) */
  [['.rep', 0], ['.mig', 0]].forEach(function (p) {
    $$(p[0]).forEach(function (n) {
      if (!io) { n.classList.add('in'); return; }
      var oo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { n.classList.add('in'); oo.disconnect(); } }, { threshold: .25 });
      oo.observe(n);
    });
  });
  $$('.ar-row').forEach(function (r, i) { r.style.setProperty('--k', i % 11); });

  /* 숫자 올라가기 */
  $$('[data-count]').forEach(function (n) {
    var to = parseFloat(n.dataset.count), dec = (n.dataset.count.split('.')[1] || '').length, suf = n.dataset.suf || '';
    function fmt(v) { return v.toFixed(dec) + suf; }
    if (!io || reduce) { n.textContent = fmt(to); return; }
    n.textContent = fmt(0);
    var oc = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; oc.disconnect();
      var t0 = performance.now(), D = 1100;
      (function step(t) { var k = Math.min(1, (t - t0) / D); k = 1 - Math.pow(1 - k, 3); n.textContent = fmt(to * k); if (k < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: .6 });
    oc.observe(n);
  });

  /* 마우스 따라 빛나는 카드 */
  d.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.cd'); if (!c) return;
    var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* 메뉴: 지금 보는 구역 표시 */
  var links = $$('.nav a[href^="#"]'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if (io && links.length) {
    var os = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var i = secs.indexOf(e.target); links.forEach(function (a, j) { if (j === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) os.observe(s); });
  }
  /* 휴대폰 메뉴: 항목을 누르면 닫는다 */
  $$('.menu-m a').forEach(function (a) { a.addEventListener('click', function () { var m = a.closest('details'); if (m) m.removeAttribute('open'); }); });

  /* 탭(점검 영역 · 검색 환경) */
  $$('[data-tabs]').forEach(function (box) {
    var btns = $$('[role=tab]', box), panels = $$('[role=tabpanel]', box);
    function sel(i, focus) {
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = j !== i; });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { sel(i); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = btns.length;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); sel((i + 1) % n, 1); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); sel((i + n - 1) % n, 1); }
        else if (k === 'Home') { e.preventDefault(); sel(0, 1); } else if (k === 'End') { e.preventDefault(); sel(n - 1, 1); }
      });
    });
    sel(0);
  });

  /* 첫 화면 비교 화면 다시 재생 */
  $$('[data-replay]').forEach(function (b) {
    b.addEventListener('click', function () { var t = $(b.dataset.replay); if (!t) return; t.classList.remove('play'); void t.offsetWidth; t.classList.add('play'); });
  });
  $$('.play').forEach(function (p) { p.classList.add('play'); });

  /* 주소 이전: 누락 1건을 연결해 보여 준다 */
  $$('[data-fixmig]').forEach(function (b) {
    b.addEventListener('click', function () { var m = b.closest('.mig'); m.classList.toggle('fixed'); b.textContent = m.classList.contains('fixed') ? '↺ 처음 상태로' : '연결 추가 →'; var s = $('[data-mig-s]', m); if (s) s.textContent = m.classList.contains('fixed') ? '전부 일치' : '누락 1건 발견'; });
  });

  /* 현장 송고: 스크롤에 맞춰 휴대폰 화면이 바뀐다 */
  var story = $('.story');
  if (story) {
    var ph = $('.phone', story), arts = $$('.story-steps article', story);
    function setS(i) { ph.dataset.s = String(i + 1); arts.forEach(function (a, j) { a.classList.toggle('on', j === i); }); }
    setS(0);
    if (io) {
      var ost = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setS(arts.indexOf(e.target)); }); }, { rootMargin: '-40% 0px -40% 0px' });
      arts.forEach(function (a) { ost.observe(a); });
    }
  }
  /* 첫 화면 휴대폰: 저절로 3장 */
  var hp = $('.hero .phone');
  if (hp && !reduce) { var n = 1; setInterval(function () { n = n % 3 + 1; hp.dataset.s = String(n); }, 2600); }

  /* 자주 묻는 질문: 하나 열면 나머지는 닫는다 */
  $$('.faq details').forEach(function (dt) { dt.addEventListener('toggle', function () { if (dt.open) $$('.faq details').forEach(function (o) { if (o !== dt) o.open = false; }); }); });
})();

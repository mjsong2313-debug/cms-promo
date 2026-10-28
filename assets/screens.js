/* 긴 페이지를 '한 화면씩' 넘겨 보게 만든다. 자바스크립트가 없으면 예전처럼 전부 펼쳐 보인다.
   - 위쪽 번호 버튼, 양쪽 화살표, 화면 끝의 '이전/다음' 큰 버튼으로 이동
   - 화면마다 색이 바뀐다(data-tone 1~6)
   - 주소 뒤 #p3 처럼 특정 화면을 바로 열 수 있고, 뒤로 가기도 화면 단위로 동작한다 */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('js')) return;
  var main = document.querySelector('main');
  if (!main) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SKIP = /(^|\s)(page-head|cta-band|unit-nav)(\s|$)/;
  var TRUST = /(^|\s)trust(\s|$)/;

  function text(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function topChild(el) { while (el && el.parentNode !== main) el = el.parentNode; return el; }
  function blockLabel(b) {
    var h = b.querySelector('h2'); if (!h) return '';
    var c = h.cloneNode(true); [].forEach.call(c.querySelectorAll('small'), function (s) { s.remove(); });
    var letter = c.querySelector('.area-letter'), l = letter ? text(letter) : '';
    if (letter) letter.remove();
    return (l ? l + ' ' : '') + text(c);
  }
  function shorten(s) { s = s.replace(/^[0-9]+\.\s*/, ''); return s.length > 12 ? s.slice(0, 11) + '…' : s; }
  function labelFor(els) {
    for (var i = 0; i < els.length; i++) { var a = els[i].getAttribute('data-label'); if (a) return a; }
    for (var j = 0; j < els.length; j++) {
      if (/hero/.test(els[j].className || '')) return '처음';
      var h = els[j].querySelector('h2'); if (h) return shorten(text(h));
    }
    return '화면';
  }

  var units = [], pend = [];
  var steps = [].slice.call(main.querySelectorAll('[data-step]'));
  if (steps.length >= 2) {
    /* 신청서처럼 한 구역 안의 단계 나누기 */
    steps.forEach(function (st) { units.push({ els: [st], container: st.closest('section') || null, label: st.getAttribute('data-label') || '단계' }); });
  } else [].slice.call(main.children).forEach(function (el) {
    var tag = el.tagName; if (tag !== 'SECTION' && tag !== 'HEADER') return;
    var cls = el.className || '';
    if (SKIP.test(cls) || !text(el)) return;
    var blocks = el.querySelectorAll('.area-block');
    if (blocks.length >= 3) {
      [].forEach.call(blocks, function (b) { units.push({ els: [b], container: el, label: shorten(blockLabel(b)) }); });
      return;
    }
    var join = el.getAttribute('data-join');
    if ((join === 'prev' || TRUST.test(cls)) && units.length) { units[units.length - 1].els.push(el); return; }
    if (join === 'next') { pend.push(el); return; }
    var els = pend.concat([el]); pend = [];
    units.push({ els: els, label: labelFor(els) });
  });
  if (pend.length) units.push({ els: pend, label: labelFor(pend) });
  if (units.length < (steps.length >= 2 ? 2 : 3)) return;

  var N = units.length, cur = -1;
  var hdr = document.querySelector('.site-header') || document.querySelector('.bar');
  function setHH() { root.style.setProperty('--hh', (hdr ? hdr.offsetHeight : 0) + 'px'); }
  setHH(); window.addEventListener('resize', setHH);

  units.forEach(function (u, i) {
    u.tone = (i % 6) + 1; u.id = 'p' + (i + 1);
    u.els.forEach(function (e) { e.setAttribute('data-unit', i); e.setAttribute('data-tone', u.tone); });
  });

  /* 위쪽 이동 막대 */
  var first = topChild(units[0].els[0]);
  var anchor = document.createElement('div'); anchor.className = 'stage-anchor';
  var bar = document.createElement('div'); bar.className = 'stage-bar';
  bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', '화면 이동');
  bar.innerHTML = '<div class="wrap stage-in"><button type="button" class="stage-arrow" data-d="-1" aria-label="이전 화면">‹</button>' +
    '<ol class="stage-tabs" role="tablist" aria-label="화면 목록">' + units.map(function (u, i) {
      return '<li role="presentation"><button type="button" role="tab" class="stage-tab" style="--tc:var(--c' + u.tone + ')" data-i="' + i + '" aria-selected="false" tabindex="-1"><span class="n">' + (i + 1) + '</span>' + u.label.replace(/[<>&]/g, '') + '</button></li>';
    }).join('') + '</ol>' +
    '<button type="button" class="stage-arrow" data-d="1" aria-label="다음 화면">›</button><span class="stage-count" aria-live="polite"></span></div>';
  main.insertBefore(anchor, first); main.insertBefore(bar, first);
  main.classList.add('screens-on');

  /* 화면 끝의 큰 이동 버튼 */
  var nav = document.createElement('section'); nav.className = 'unit-nav'; nav.setAttribute('aria-label', '다음 화면으로');
  nav.innerHTML = '<div class="wrap"><button type="button" class="go-prev"><small></small><b></b></button><button type="button" class="go-next"><small></small><b></b></button></div>';
  var lastTop = topChild(units[N - 1].els[units[N - 1].els.length - 1]);
  main.insertBefore(nav, lastTop.nextSibling);

  var tabs = [].slice.call(bar.querySelectorAll('.stage-tab'));
  var arrows = [].slice.call(bar.querySelectorAll('.stage-arrow'));
  var ol = bar.querySelector('.stage-tabs'), count = bar.querySelector('.stage-count');
  var goPrev = nav.querySelector('.go-prev'), goNext = nav.querySelector('.go-next');

  function replay(u) {
    if (reduce) return;
    u.els.forEach(function (e) {
      [].forEach.call(e.querySelectorAll('[data-anim]'), function (a) {
        a.classList.remove('fin'); a.classList.remove('play'); void a.offsetWidth; a.classList.add('play');
      });
    });
  }
  function show(i, opt) {
    opt = opt || {};
    if (i < 0 || i >= N || i === cur) return;
    cur = i;
    var u = units[i];
    units.forEach(function (x, k) {
      x.els.forEach(function (e) { e.hidden = k !== i; });
      if (x.container) x.container.hidden = false;
    });
    if (u.container) u.container.setAttribute('data-tone', u.tone);
    nav.setAttribute('data-tone', u.tone);
    tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    var t = tabs[i];
    ol.scrollLeft = Math.max(0, t.offsetLeft - ol.clientWidth / 2 + t.offsetWidth / 2);
    arrows[0].disabled = i === 0; arrows[1].disabled = i === N - 1;
    count.textContent = (i + 1) + ' / ' + N;
    goPrev.hidden = i === 0; goNext.hidden = i === N - 1;
    if (i > 0) { goPrev.querySelector('small').textContent = '← 이전 화면'; goPrev.querySelector('b').textContent = units[i - 1].label; }
    if (i < N - 1) { goNext.querySelector('small').textContent = '다음 화면 →'; goNext.querySelector('b').textContent = units[i + 1].label; }
    replay(u);
    window.dispatchEvent(new Event('scroll'));
    if (!opt.keepScroll) {
      var y = anchor.getBoundingClientRect().top + window.pageYOffset - (hdr ? hdr.offsetHeight : 0);
      if (y > 0 || window.pageYOffset > 0) window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  function go(i) { if (i < 0 || i >= N || i === cur) return; location.hash = units[i].id; }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { go(i); });
    t.addEventListener('keydown', function (e) {
      var j = -1;
      if (e.key === 'ArrowRight') j = Math.min(N - 1, i + 1); else if (e.key === 'ArrowLeft') j = Math.max(0, i - 1);
      else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = N - 1;
      if (j >= 0) { e.preventDefault(); go(j); tabs[j].focus(); }
    });
  });
  arrows.forEach(function (a) { a.addEventListener('click', function () { go(cur + (+a.getAttribute('data-d'))); }); });
  goPrev.addEventListener('click', function () { go(cur - 1); });
  goNext.addEventListener('click', function () { go(cur + 1); });

  function fromHash(initial) {
    var h = decodeURIComponent((location.hash || '').slice(1)), m = /^p(\d+)$/.exec(h), i = -1, target = null;
    if (m) i = +m[1] - 1;
    else if (h) {
      target = document.getElementById(h);
      if (target) units.forEach(function (u, k) { if (i < 0 && u.els.some(function (e) { return e === target || e.contains(target); })) i = k; });
    }
    if (i < 0 || i >= N) { if (!h || cur < 0) show(0, { keepScroll: true }); return; }
    show(i, { keepScroll: initial && !target });
    if (target) setTimeout(function () { target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, 30);
  }
  /* 신청서 제출 때 빠진 칸이 다른 단계에 있으면 그 단계로 돌아간다 */
  document.addEventListener('submit', function () {
    setTimeout(function () {
      var bad = main.querySelector('.field.bad, .err:not(:empty)'); if (!bad) return;
      for (var k = 0; k < N; k++) if (units[k].els.some(function (e) { return e.contains(bad); })) { if (k !== cur) go(k); return; }
    }, 80);
  }, true);
  window.addEventListener('hashchange', function () { fromHash(false); });
  fromHash(true);
})();

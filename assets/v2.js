/* v2: 구간 이동 막대(스크롤 위치 표시), 읽기 진행 막대, 하단 고정 신청, 맨 위로. 자바스크립트가 없어도 페이지는 그대로 읽힌다. */
(function () {
  'use strict';
  var d = document, main = d.querySelector('main'); if (!main) return;
  var hdr = d.querySelector('.site-header');
  function setHH() { d.documentElement.style.setProperty('--hh', (hdr ? hdr.offsetHeight : 0) + 'px'); }
  setHH(); addEventListener('resize', setHH);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 진행 막대 (scroll-timeline 을 못 쓰는 브라우저용 대체)
  var pg = d.createElement('div'); pg.className = 'v2-progress'; pg.setAttribute('aria-hidden', 'true'); d.body.appendChild(pg);
  var tl = CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');

  // 구간 이동
  var secs = [].slice.call(main.querySelectorAll(':scope > section[data-label]')).filter(function (s) { return s.getAttribute('data-label') !== '처음'; });
  var hero = main.querySelector('.hs-section');
  var nav = null, links = [];
  if (secs.length >= 3) {
    secs.forEach(function (s, i) { if (!s.id) s.id = 'v2s' + (i + 1); if (!reduce) s.classList.add('v2-fade'); });
    nav = d.createElement('nav'); nav.className = 'v2-nav'; nav.setAttribute('aria-label', '이 페이지 구간 이동');
    nav.innerHTML = '<div class="wrap"><ul>' + secs.map(function (s) { return '<li><a href="#' + s.id + '">' + s.getAttribute('data-label').replace(/[<>&]/g, '') + '</a></li>'; }).join('') + '</ul></div>';
    hdr.parentNode.insertBefore(nav, hdr.nextSibling);
    links = [].slice.call(nav.querySelectorAll('a'));
    links.forEach(function (a) { a.addEventListener('click', function (e) { var t = d.getElementById(a.getAttribute('href').slice(1)); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', location.pathname + location.search); }); });
  }

  // 하단 고정 신청 + 맨 위로
  var pri = d.querySelector('.hs-btn.pri, .cta-band .btn');
  var other = d.querySelector('.sitesw a:not([aria-current])');
  var bar = null;
  if (pri) {
    bar = d.createElement('div'); bar.className = 'v2-cta'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', '신청');
    bar.innerHTML = '<a class="main" href="' + pri.getAttribute('href') + '">' + pri.textContent.trim() + '</a>' + (other ? '<a class="alt" href="' + other.getAttribute('href') + '">' + other.textContent.replace('↗', '').trim() + ' ↗</a>' : '');
    d.body.appendChild(bar);
  }
  var up = d.createElement('button'); up.type = 'button'; up.className = 'v2-top'; up.setAttribute('aria-label', '맨 위로'); up.textContent = '↑';
  up.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); d.body.appendChild(up);

  var footer = d.querySelector('.site-footer');
  var tick = false;
  function update() {
    tick = false;
    var y = scrollY, H = d.documentElement.scrollHeight - innerHeight;
    if (!tl) pg.style.transform = 'scaleX(' + (H > 0 ? Math.min(1, y / H) : 0) + ')';
    var past = hero ? hero.getBoundingClientRect().bottom < (hdr ? hdr.offsetHeight : 0) + 40 : y > 400;
    if (nav) nav.classList.toggle('on', past);
    var nearFoot = footer && footer.getBoundingClientRect().top < innerHeight - 40;
    if (bar) bar.classList.toggle('on', past && !nearFoot);
    up.classList.toggle('on', y > 900);
    // 현재 구간
    if (links.length) {
      var cur = -1, line = (hdr ? hdr.offsetHeight : 0) + 140;
      secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) cur = i; });
      links.forEach(function (a, i) { var on = i === cur; if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); if (on && nav.classList.contains('on')) { var ul = a.closest('ul'); ul.scrollLeft = Math.max(0, a.offsetLeft - ul.clientWidth / 2 + a.offsetWidth / 2); } });
    }
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update); update();
})();

(function(){var cs=document.querySelectorAll('.card');cs.forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true})});
  // 접힌 상자는 주소 해시 이동·검색으로 열릴 때 자동으로 펼친다
  addEventListener('hashchange',function(){var t=document.getElementById(location.hash.slice(1));var d=t&&t.closest('details.fold');if(d)d.open=true});})();

(function () {
  'use strict';
  // 다크 모드
  var btn = document.getElementById('themeBtn');
  function curTheme() { return document.documentElement.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
  if (btn) btn.hidden = false; // 자바스크립트가 켜져 있을 때만 보인다(꺼져 있으면 눌러도 반응이 없으므로)
  if (btn) btn.setAttribute('aria-pressed', curTheme() === 'dark' ? 'true' : 'false');
  if (btn) btn.addEventListener('click', function () {
    var next = curTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // 메인 슬라이더: 5초 자동, 마우스·포커스 시 정지, 오른쪽 목록과 연동
  var root = document.querySelector('[data-slider]');
  if (root) {
    var slides = [].slice.call(root.querySelectorAll('.slide'));
    var items = [].slice.call(root.querySelectorAll('.herolist li'));
    var dots = [].slice.call(root.querySelectorAll('.dots button'));
    var i = 0, timer = null, paused = false, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === i); s.inert = k !== i; });
      items.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      dots.forEach(function (s, k) { s.classList.toggle('on', k === i); if (k === i) s.setAttribute('aria-current', 'true'); else s.removeAttribute('aria-current'); });
    }
    function play() { if (reduce || paused || slides.length < 2) return; stop(); timer = setInterval(function () { go(i + 1); }, 5000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    root.querySelector('.prev').addEventListener('click', function () { go(i - 1); play(); });
    root.querySelector('.next').addEventListener('click', function () { go(i + 1); play(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.dataset.go); play(); }); });
    items.forEach(function (li) {
      li.addEventListener('mouseenter', function () { go(+li.dataset.go); });
      li.addEventListener('focusin', function () { go(+li.dataset.go); });
    });
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
    [].forEach.call(root.querySelectorAll('.arr, .dots'), function (e) { e.hidden = false; });
    var pb = root.querySelector('.pause');
    if (pb && slides.length > 1 && !reduce) { // 자동 넘김을 멈출 수 있는 버튼(자바스크립트가 켜져 있을 때만 보인다)
      pb.hidden = false;
      pb.addEventListener('click', function () { paused = !paused; pb.setAttribute('aria-pressed', paused ? 'true' : 'false'); pb.textContent = paused ? '자동 넘김 재생' : '자동 넘김 멈춤'; if (paused) stop(); else play(); });
    }
    var tx = 0;
    root.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); play(); } }, { passive: true });
    play();
  }

  // 속보 티커
  var tk = document.getElementById('ticker');
  if (tk) {
    var lis = [].slice.call(tk.children), k = 0, tt = null, tkHeld = false, tkb = document.querySelector('.tkpause');
    var show = function (n) { lis[k].classList.remove('on'); lis[k].inert = true; lis[k].setAttribute('aria-hidden', 'true'); k = n; lis[k].classList.add('on'); lis[k].inert = false; lis[k].removeAttribute('aria-hidden'); };
    var run = function () { if (!tt && !tkHeld) tt = setInterval(function () { show((k + 1) % lis.length); }, 4000); };
    var hold = function () { if (tt) clearInterval(tt); tt = null; };
    if (lis.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      run(); // 마우스를 올리거나 키보드로 들어오면 멈춘다
      if (tkb) { tkb.hidden = false; tkb.addEventListener('click', function () { tkHeld = !tkHeld; tkb.setAttribute('aria-pressed', tkHeld ? 'true' : 'false'); tkb.textContent = tkHeld ? '속보 재생' : '속보 멈춤'; if (tkHeld) hold(); else run(); }); }
      tk.addEventListener('mouseenter', hold); tk.addEventListener('mouseleave', run); tk.addEventListener('focusin', hold); tk.addEventListener('focusout', run);
    }
  }

  // 기사 도구: 링크 복사·공유·글자 크기·인쇄 (자바스크립트가 켜져 있을 때만 보인다)
  var tools = document.querySelector('.atools');
  if (tools) {
    tools.hidden = false;
    var msg = document.getElementById('atoolmsg');
    var say = function (t) { if (msg) { msg.textContent = ''; setTimeout(function () { msg.textContent = t; }, 30); } };
    var canon = document.querySelector('link[rel=canonical]');
    var link = canon ? canon.href : location.href.split('#')[0].split('?')[0];
    var shareBtn = tools.querySelector('[data-act=share]');
    if (shareBtn && navigator.share) shareBtn.hidden = false;
    var order = ['s', 'm', 'l', 'xl'], names = { s: '작게', m: '보통', l: '크게', xl: '아주 크게' };
    var curFs = function () { var v = document.documentElement.getAttribute('data-fs'); return order.indexOf(v) < 0 ? 'm' : v; };
    var setFs = function (v) {
      if (v === 'm') document.documentElement.removeAttribute('data-fs'); else document.documentElement.setAttribute('data-fs', v);
      try { if (v === 'm') localStorage.removeItem('fs'); else localStorage.setItem('fs', v); } catch (e) {}
      say('글자 크기: ' + names[v]);
    };
    tools.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-act]') : null; if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'print') window.print();
      else if (act === 'fs+') { var i = order.indexOf(curFs()); setFs(order[Math.min(order.length - 1, i + 1)]); }
      else if (act === 'fs-') { var j = order.indexOf(curFs()); setFs(order[Math.max(0, j - 1)]); }
      else if (act === 'share') { navigator.share({ title: document.title, url: link }).catch(function () {}); }
      else if (act === 'copy') {
        var done = function () { say('링크를 복사했습니다.'); };
        var fallback = function () {
          var ta = document.createElement('textarea'); ta.value = link; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (x) {} document.body.removeChild(ta);
          if (ok) done(); else say('복사하지 못했습니다. 주소창의 주소를 복사해 주세요.');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, fallback); else fallback();
      }
    });
  }

  // 전체 메뉴(삼선 단추): 왼쪽에서 열리는 서랍. 자바스크립트가 켜져 있을 때만 단추가 보인다
  (function () {
    var mb = document.getElementById('menuBtn'), dr = document.getElementById('drawer'), bg = document.getElementById('drawerBg'), cl = document.getElementById('drawerClose');
    if (!mb || !dr || !bg) return;
    mb.hidden = false;
    function open() { dr.hidden = false; bg.hidden = false; document.body.classList.add('drawer-open'); mb.setAttribute('aria-expanded', 'true'); if (cl) cl.focus(); }
    function close() { dr.hidden = true; bg.hidden = true; document.body.classList.remove('drawer-open'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); }
    mb.addEventListener('click', function () { if (dr.hidden) open(); else close(); });
    bg.addEventListener('click', close);
    if (cl) cl.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dr.hidden) close(); });
  })();
})();

// 본문 유튜브 영상: 누르기 전에는 유튜브에 접속하지 않는다. 누르면 그 자리에서 재생(스크립트가 없으면 유튜브 링크가 열린다)
document.addEventListener('click', function (e) {
  var a = e.target.closest ? e.target.closest('a.vplay[data-yt]') : null; if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
  var id = a.getAttribute('data-yt'); if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  e.preventDefault();
  var f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  f.title = '유튜브 영상'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.setAttribute('allowfullscreen', ''); f.referrerPolicy = 'strict-origin-when-cross-origin';
  a.parentNode.replaceChild(f, a); f.focus();
});

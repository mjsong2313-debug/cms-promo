/* 접속하면 바로 뜨는 영상 팝업. 소리를 켠 채 재생을 시도하고, 브라우저가 막으면 소리 없이 시작해 첫 누름에 소리를 켠다.
   닫기·X·바깥 클릭·Esc 로 닫는다. 페이지를 열 때마다 뜬다. 영상·문구는 promo-data.js. */
(function () {
  'use strict';
  var all = window.__PROMO__;
  var setKey = document.documentElement.getAttribute('data-promo') || 'inspect';
  var set = all && all.sets && all.sets[setKey];
  if (!set) return;
  if (!document.documentElement.hasAttribute('data-promo-entry')) return;

  var nextSet = set.next || null, skipNext = false;
  var ov = null, v = null, lastFocus = null, hiddenEls = [], gestureOn = null;
  var EV = ['pointerdown', 'touchend', 'click', 'keydown'];

  function lock(on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) {
      hiddenEls = [].filter.call(document.body.children, function (el) { return el !== ov && !el.hasAttribute('inert') && el.tagName !== 'SCRIPT'; });
      hiddenEls.forEach(function (el) { el.setAttribute('inert', ''); });
    } else { hiddenEls.forEach(function (el) { el.removeAttribute('inert'); }); hiddenEls = []; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function play() { try { var p = v.play(); if (p && p.catch) return p; } catch (e) {} return null; }

  function startMedia() {
    var hint = ov.querySelector('.pp-hint');
    v.muted = false; v.volume = 1;
    var p = play();
    if (!p) return;
    p.catch(function () {
      v.muted = true; play(); hint.hidden = false;
      gestureOn = function () {
        EV.forEach(function (t) { document.removeEventListener(t, gestureOn, true); });
        gestureOn = null;
        if (!ov) return;
        hint.hidden = true; v.muted = false; v.volume = 1; play();
        var t0 = Date.now();
        var keep = function () { if (ov && Date.now() - t0 < 700) play(); else v.removeEventListener('pause', keep); };
        v.addEventListener('pause', keep);
      };
      EV.forEach(function (t) { document.addEventListener(t, gestureOn, true); });
    });
  }

  function close() {
    if (gestureOn) { EV.forEach(function (t) { document.removeEventListener(t, gestureOn, true); }); gestureOn = null; }
    try { v.pause(); } catch (e) {}
    if (ov) { ov.remove(); ov = null; }
    lock(false);
    document.removeEventListener('keydown', onKey, true);
    if (nextSet && !skipNext) { set = nextSet; nextSet = set.next || null; setTimeout(open, 250); return; }
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function onKey(e) {
    if (!ov) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      var f = [].slice.call(ov.querySelectorAll('a[href],button:not([disabled]),video')); if (!f.length) return;
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || a === ov.querySelector('.pp-dlg'))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    }
  }

  function open() {
    if (ov) return;
    lastFocus = document.activeElement;
    ov = document.createElement('div'); ov.className = 'pp-ov';
    ov.innerHTML = '<div class="pp-dlg" role="dialog" aria-modal="true" aria-labelledby="pp-t" tabindex="-1">' +
      '<button type="button" class="pp-x" aria-label="팝업 닫기">✕</button>' +
      '<div class="pp-top"><span class="pp-kicker">' + esc(set.kicker) + '</span><h2 id="pp-t">' + esc(set.title) + '</h2></div>' +
      '<div class="pp-media"><div class="pp-hint" hidden aria-live="polite">🔊 화면을 한 번 누르면 소리가 켜집니다</div>' +
      '<video playsinline controls preload="auto" poster="' + esc(set.poster) + '"><source src="' + esc(set.mp4) + '" type="video/mp4"><source src="' + esc(set.webm) + '" type="video/webm"></video></div>' +
      '<div class="pp-acts"><a class="pp-go" href="' + esc(set.href) + '">' + esc(set.cta) + '</a><button type="button" class="pp-cl">닫기</button></div></div>';
    document.body.appendChild(ov);
    v = ov.querySelector('video');
    lock(true);
    ov.querySelector('.pp-x').addEventListener('click', close);
    ov.querySelector('.pp-cl').addEventListener('click', close);
    ov.querySelector('.pp-go').addEventListener('click', function () { skipNext = true; close(); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', onKey, true);
    ov.querySelector('.pp-x').focus({ preventScroll: true });
    startMedia();
  }

  function start() { var d = +all.delayMs || 0; if (d > 0) setTimeout(open, d); else open(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

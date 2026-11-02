/* 접속하면 바로 뜨는 영상 팝업. 닫기·X·바깥 클릭·Esc 로 닫는다. 페이지를 다시 열면 다시 뜬다. */
(function () {
  'use strict';
  var ov = document.getElementById('vpOv'); if (!ov) return;
  var v = document.getElementById('vpV'), last = null;
  function open() {
    last = document.activeElement;
    ov.hidden = false;
    document.getElementById('vpX').focus({ preventScroll: true });
    v.muted = false; v.volume = 1;
    var p; try { p = v.play(); } catch (e) {}
    if (p && p.catch) p.catch(function () {
      /* 브라우저가 소리 있는 자동 재생을 막으면 소리 없이 먼저 재생하고, 처음 누르거나 만지는 순간 소리를 켠다. */
      v.muted = true;
      var hint = document.getElementById('vpHint'); if (hint) hint.hidden = false;
      try { var q = v.play(); if (q && q.catch) q.catch(function () {}); } catch (e) {}
      var on = function () {
        ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (t) { document.removeEventListener(t, on, true); });
        if (ov.hidden) return;
        if (hint) hint.hidden = true;
        v.muted = false; v.volume = 1;
        /* 영상을 눌러 소리를 켠 경우 브라우저가 일시정지로 바꾸므로, 곧바로 다시 재생한다. */
        var t0 = Date.now();
        var keep = function () { if (Date.now() - t0 < 700 && !ov.hidden) { try { v.play(); } catch (e) {} } else v.removeEventListener('pause', keep); };
        v.addEventListener('pause', keep);
        try { var r = v.play(); if (r && r.catch) r.catch(function () {}); } catch (e) {}
      };
      ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (t) { document.addEventListener(t, on, true); });
    });
  }
  function close() {
    try { v.pause(); } catch (e) {}
    ov.hidden = true;
    if (last && last.focus) { try { last.focus({ preventScroll: true }); } catch (e) {} }
  }
  ['vpX', 'vpClose', 'vpGo'].forEach(function (id) { document.getElementById(id).addEventListener('click', close); });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) { if (!ov.hidden && e.key === 'Escape') close(); });
  open();
})();

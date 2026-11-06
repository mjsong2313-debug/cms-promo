/* 접속하면 바로 뜨는 영상 팝업. 닫기·X·바깥 클릭·Esc 로 닫는다. 페이지를 다시 열면 다시 뜬다. */
(function () {
  'use strict';
  var ov = document.getElementById('vpOv'); if (!ov) return;
  var v = document.getElementById('vpV'), last = null;
  function open() {
    last = document.activeElement;
    ov.hidden = false;
    document.getElementById('vpX').focus({ preventScroll: true });
    /* 소리 나는 영상을 저절로 틀지 않는다. 보고 싶은 사람이 재생 버튼을 누른다. */
    v.muted = false; v.volume = 1;
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

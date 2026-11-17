/* 접속하면 바로 뜨는 영상 팝업 2개. 첫 팝업(기존 영상)이 먼저 뜨고, 닫으면 두 번째 팝업(공보실·홍보실 영상)이 뜬다.
   닫기·X·바깥 클릭·Esc 로 닫는다. '진단 신청'을 누르면 신청란으로 이동하고 두 번째 팝업은 띄우지 않는다. 페이지를 다시 열면 처음부터 다시 뜬다. */
(function () {
  'use strict';
  function make(n, onClosed) {
    var s = n ? '2' : '';
    var ov = document.getElementById('vpOv' + s); if (!ov) return null;
    var v = document.getElementById('vpV' + s), last = null;
    function open() {
      last = document.activeElement;
      ov.hidden = false;
      document.getElementById('vpX' + s).focus({ preventScroll: true });
      /* 소리 나는 영상을 저절로 틀지 않는다. 보고 싶은 사람이 재생 버튼을 누른다. */
      v.muted = false; v.volume = 1;
    }
    function close(skipNext) {
      if (ov.hidden) return;
      try { v.pause(); } catch (e) {}
      ov.hidden = true;
      if (onClosed && skipNext !== true) { onClosed(); return; }
      if (last && last.focus) { try { last.focus({ preventScroll: true }); } catch (e) {} }
    }
    ['vpX', 'vpClose'].forEach(function (id) { document.getElementById(id + s).addEventListener('click', function () { close(); }); });
    document.getElementById('vpGo' + s).addEventListener('click', function () { close(true); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) { if (!ov.hidden && e.key === 'Escape') close(); });
    return { open: open };
  }
  var second = make(1, null);
  var first = make(0, function () { if (second) second.open(); });
  if (first) first.open(); else if (second) second.open();
})();

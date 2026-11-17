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
  /* 영상 두 개: 첫 영상이 기본. 탭을 누르면 영상만 바꾼다(소리는 눌러야 켜짐). */
  var note = document.getElementById('vpNote'), note0 = note ? note.textContent : '';
  var hd = document.getElementById('vpT'), sm = document.querySelector('.vp-sum'), hd0 = hd ? hd.textContent : '', sm0 = sm ? sm.textContent : '';
  var vids = [
    { poster: 'assets/video/poster.jpg?v=2', mp4: 'assets/video/smart-edge.mp4?v=3', webm: 'assets/video/smart-edge.webm?v=3' },
    { hd: '매일 반복하는 기사 검색·스크랩, 버튼으로 줄입니다', sm: '신문사와 검색어를 지정해 두면 우리 지역 기사와 보도자료 게재 여부를 한 화면에서 보고, 워드·PDF로 받습니다. 판단은 담당자가 합니다.', note: '② 영상의 화면은 시험용 가상 화면입니다. 신문사가 공개한 기사 목록 안에서 찾으며, 시험 단계입니다.', poster: 'assets/video/gongbo-poster.jpg?v=1', mp4: 'assets/video/gongbo.mp4?v=1', webm: 'assets/video/gongbo.webm?v=1' }
  ];
  Array.prototype.forEach.call(document.querySelectorAll('.vp-tab'), function (b) {
    b.addEventListener('click', function () {
      var d = vids[+b.getAttribute('data-v')]; if (!d) return;
      try { v.pause(); } catch (e) {}
      Array.prototype.forEach.call(document.querySelectorAll('.vp-tab'), function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
      v.poster = d.poster; if (note) note.textContent = d.note || note0; if (hd) hd.textContent = d.hd || hd0; if (sm) sm.textContent = d.sm || sm0;
      v.innerHTML = '<source src="' + d.mp4 + '" type="video/mp4"><source src="' + d.webm + '" type="video/webm">';
      v.load();
    });
  });
  ['vpX', 'vpClose', 'vpGo'].forEach(function (id) { document.getElementById(id).addEventListener('click', close); });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) { if (!ov.hidden && e.key === 'Escape') close(); });
  open();
})();

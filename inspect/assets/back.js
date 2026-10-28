/* 뒤로 가기. 이 사이트 안에서 지나온 화면을 탭마다 기록해 두고(sessionStorage) 그 기록을 따른다.
   [data-back]   : 바로 앞에 보던 화면으로 돌아간다. 기록이 없으면(처음 들어온 화면) 단추의 주소로 간다.
   [data-replace]: 기록을 쌓지 않고 바꿔 연다(디자인 이전·다음·다른 디자인). 뒤로 가면 목록으로 돌아온다.
   [data-unwind="파일이름 파일이름"]: 지나온 기록에서 가장 가까운 그 화면을 찾아 그 자리로 되돌아간다(없으면 링크 주소로 이동). */
(function () {
  'use strict';
  var KEY = 'navStack', RK = 'navReplace', S = null;
  try { S = window.sessionStorage; S.getItem(KEY); } catch (x) { S = null; }
  function get() { try { var a = JSON.parse(S.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (x) { return []; } }
  function put(a) { try { S.setItem(KEY, JSON.stringify(a.slice(-60))); } catch (x) {} }
  var cur = location.pathname + location.search;
  function sync(kind) {
    if (!S) return;
    var st = get(), i;
    if (kind === 'back') { i = st.lastIndexOf(cur); if (i >= 0) st = st.slice(0, i + 1); else st.push(cur); }
    else if (kind === 'reload') { if (st[st.length - 1] !== cur) { i = st.lastIndexOf(cur); if (i >= 0) st = st.slice(0, i + 1); else st.push(cur); } }
    else {
      var rep = false; try { rep = S.getItem(RK) === '1'; S.removeItem(RK); } catch (x) {}
      if (rep && st.length) st[st.length - 1] = cur; else if (st[st.length - 1] !== cur) st.push(cur);
    }
    put(st);
  }
  var type = 'navigate';
  try { var n = performance.getEntriesByType('navigation')[0]; if (n && n.type) type = n.type; } catch (x) {}
  sync(type === 'back_forward' ? 'back' : type === 'reload' ? 'reload' : 'nav');
  /* 새 화면을 열면 늘 맨 위에서 시작한다. 이전 화면에서 내려가 있던 자리가 그대로 남거나(미리보기 창 안에서 특히),
     사진이 늦게 뜨면서 위치가 밀리는 일을 막는다. 주소에 #표시가 있으면 그 자리로 가야 하므로 건드리지 않는다. */
  function toTop() {
    if (location.hash) return;
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (x) { try { window.scrollTo(0, 0); } catch (y) {} }
    try { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch (x) {}
  }
  if (type === 'navigate') {
    toTop();
    try { var de = document.documentElement, sp = de.style.scrollPaddingTop; de.style.scrollPaddingTop = '0px'; de.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' }); de.style.scrollPaddingTop = sp; } catch (x) {} // 바깥 틀(미리보기 창)도 함께 맨 위로
    document.addEventListener('DOMContentLoaded', toTop);
    window.addEventListener('load', function () { toTop(); setTimeout(toTop, 120); setTimeout(toTop, 450); });
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) sync('back'); }); // 앞뒤 이동 캐시에서 되살아난 경우
  function nameOf(p) { return String(p || '').split('?')[0].split('/').pop(); }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('[data-back]');
    if (b) {
      var st = get();
      if (S && st.length >= 2 && st[st.length - 1] === cur) { e.preventDefault(); history.back(); }
      return;
    }
    var u = t.closest('[data-unwind]');
    if (u) {
      var want = (u.getAttribute('data-unwind') || '').split(/\s+/), s2 = get(), k = -1;
      for (var j = s2.length - 2; j >= 0 && k < 0; j--) if (want.indexOf(nameOf(s2[j])) >= 0) k = j;
      if (S && k >= 0 && s2[s2.length - 1] === cur) { e.preventDefault(); history.go(k - (s2.length - 1)); }
      return;
    }
    var rp = t.closest('[data-replace]');
    if (rp && rp.href) { e.preventDefault(); try { S && S.setItem(RK, '1'); } catch (x) {} location.replace(rp.href); }
  });
})();

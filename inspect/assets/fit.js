/* PC에서 메뉴로 이동했을 때 한 구역이 화면 높이에 맞게 들어오도록 구역 안쪽 글자·간격을 화면에 맞춰 키우거나 줄인다. */
(function () {
  'use strict';
  var MIN = 0.7, MAX = 1.25, HEAD = 65, SLACK = 34, t;
  function fit() {
    var wide = window.innerWidth >= 981;
    var secs = document.querySelectorAll('.sec[id]');
    for (var i = 0; i < secs.length; i++) {
      var w = secs[i].querySelector(':scope > .wrap');
      if (!w) continue;
      w.style.zoom = ''; secs[i].style.minHeight = '';
      if (!wide || secs[i].hasAttribute('data-nofit')) continue;
      w.style.zoom = '1';
      var h = w.getBoundingClientRect().height;
      var z = (window.innerHeight - HEAD - SLACK) / h;
      w.style.zoom = String(Math.max(MIN, Math.min(MAX, Math.round(z * 100) / 100)));
      secs[i].style.minHeight = (window.innerHeight - 58) + 'px';
    }
  }
  function later() { clearTimeout(t); t = setTimeout(fit, 120); }
  window.addEventListener('resize', later);
  window.addEventListener('load', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  if (document.readyState !== 'loading') fit(); else document.addEventListener('DOMContentLoaded', fit);
})();

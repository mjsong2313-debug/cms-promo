/* smooth.js — 스크롤 중에는 장식 애니메이션을 멈추고, 화면 밖 장식은 돌리지 않는다. */
(function () {
  'use strict';
  var de = document.documentElement, t = 0;
  /* 휴대폰·터치 화면: 마우스 올림 효과가 없고 장식 애니메이션도 CSS 로 이미 꺼 두었다.
     스크롤 때마다 html 클래스를 바꾸면 문서 전체 스타일을 다시 계산해 오히려 끊기므로 아무것도 하지 않는다. */
  if (matchMedia('(max-width:900px), (pointer:coarse)').matches) return;
  addEventListener('scroll', function () {
    if (!t) de.classList.add('sc'); else clearTimeout(t);
    t = setTimeout(function () { t = 0; de.classList.remove('sc'); }, 140);
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('off', !e.isIntersecting); }); });
    [].forEach.call(document.querySelectorAll('.win'), function (w) { io.observe(w); });
  }
})();

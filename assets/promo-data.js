/* 접속 팝업(영상). 화면마다 data-promo 값(inspect·cms)으로 하나를 고른다. */
window.__PROMO__ = {
  delayMs: 0,
  sets: {
    inspect: { kicker: '점검', title: '아직도 구형 CMS입니까?', mp4: 'assets/video/inspect.mp4', webm: 'assets/video/inspect.webm', poster: 'assets/video/inspect.jpg', cta: '무료 점검 신청', href: 'apply.html' },
    cms:     { kicker: '신문사 CMS', title: '이제 현장송고 시스템입니다.', mp4: 'assets/video/cms.mp4', webm: 'assets/video/cms.webm', poster: 'assets/video/cms.jpg', cta: '도입 상담 신청', href: 'apply.html',
      next: { kicker: '신문사 CMS', title: '현장 송고와 검색 로봇이 읽는 구조', mp4: 'assets/video/cms2.mp4', webm: 'assets/video/cms2.webm', poster: 'assets/video/cms2.jpg', cta: '도입 상담 신청', href: 'apply.html' } }
  }
};

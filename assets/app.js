/* 보조 동작(없어도 모든 내용이 읽히고 링크가 눌립니다): 보고서 탭, 등장 효과, 카드 기울임, 신청 양식 검사, 3D 배경 지연 로드 */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 메뉴: 링크를 누르면 닫기 */
  var menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.removeAttribute('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.removeAttribute('open'); });
  }

  /* 보고서 탭 */
  document.querySelectorAll('[data-viewer]').forEach(function (v) {
    var tabs = [].slice.call(v.querySelectorAll('[role=tab]'));
    var panels = [].slice.call(v.querySelectorAll('[role=tabpanel]'));
    function show(i, focus) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (focus) tabs[i].focus();
      v.querySelector('.rv-body').scrollTop = 0;
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length;
        if (e.key === 'ArrowRight') { e.preventDefault(); show((i + 1) % n, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); show((i + n - 1) % n, true); }
      });
    });
    show(0);
  });

  /* 등장 효과 */
  var rv = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* 카드 입체 기울임(마우스가 있는 기기에서만) */
  if (!reduce && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var raf = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.add('is-tilting');
          el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 9).toFixed(2) + 'deg) translateZ(0)';
          el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
        });
      });
      el.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
  }

  /* 3D 점검 네트워크: 첫 화면을 막지 않도록 한가할 때 불러온다 */
  if (document.querySelector('[data-scan]')) {
    var load = function () { var s = document.createElement('script'); s.src = 'assets/scan3d.js'; s.async = true; document.head.appendChild(s); };
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1500 }); else setTimeout(load, 400);
  }

  /* 점검 신청 양식 */
  var form = document.getElementById('apply-form');
  if (form) {
    var status = document.getElementById('form-status');
    var blocked = /^(localhost|0\.0\.0\.0|.*\.local|.*\.localhost|.*\.internal|.*\.lan|.*\.home|.*\.corp)$/i;
    function urlProblem(v) {
      v = v.trim();
      if (!v) return '사이트 주소를 입력해 주세요.';
      var u;
      try { u = new URL(v); } catch (e) { return 'https://로 시작하는 올바른 주소를 입력해 주세요.'; }
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'http 또는 https 주소만 받습니다.';
      if (u.username || u.password) return '아이디·비밀번호가 들어간 주소는 받지 않습니다.';
      var h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
      if (blocked.test(h)) return '내부망 주소는 점검할 수 없습니다.';
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.indexOf(':') >= 0 || /^\d+$/.test(h) || /^0x/i.test(h)) return 'IP 주소를 직접 입력할 수 없습니다. 도메인 주소를 입력해 주세요.';
      if (h.indexOf('.') < 0) return '올바른 도메인 주소를 입력해 주세요.';
      return '';
    }
    function setErr(field, msg) {
      var box = field.closest('.field'), err = box.querySelector('.err');
      box.classList.toggle('bad', !!msg);
      if (err) err.textContent = msg || '';
      return !msg;
    }
    function validate() {
      var ok = true;
      var url = form.elements.site_url; ok = setErr(url, urlProblem(url.value)) && ok;
      var kind = form.elements.site_kind; ok = setErr(kind, kind.value ? '' : '사이트 종류를 선택해 주세요.') && ok;
      var nm = form.elements.contact_name; ok = setErr(nm, nm.value.trim() ? '' : '담당자 이름을 입력해 주세요.') && ok;
      var em = form.elements.email; ok = setErr(em, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()) ? '' : '올바른 이메일을 입력해 주세요.') && ok;
      var tl = form.elements.phone; ok = setErr(tl, tl.value.replace(/\D/g, '').length >= 8 ? '' : '연락처를 입력해 주세요.') && ok;
      var o = form.elements.owner_confirm; ok = setErr(o, o.checked ? '' : '소유자이거나 점검 권한이 있어야 신청할 수 있습니다.') && ok;
      var p = form.elements.privacy_agree; ok = setErr(p, p.checked ? '' : '개인정보 수집·이용에 동의해 주세요.') && ok;
      return ok;
    }
    form.addEventListener('submit', function (e) {
      var endpoint = form.getAttribute('data-endpoint'), mailto = form.getAttribute('data-mailto'), api = form.getAttribute('data-api');
      if (api) {
        e.preventDefault();
        if (!validate()) { status.textContent = '입력 내용을 다시 확인해 주세요.'; var b0 = form.querySelector('.bad input,.bad select'); if (b0) b0.focus(); return; }
        var g = form.elements;
        postApi(api, {
          type: 'inspect', url: g.site_url.value.trim(), name: g.contact_name.value.trim(), phone: g.phone.value.trim(), email: g.email.value.trim(),
          consent: g.privacy_agree.checked,
          extra: { site_kind: g.site_kind.value, owner_confirm: true, extra_materials: [].slice.call(form.querySelectorAll('input[name=extra_materials]:checked')).map(function (x) { return x.value; }), message: g.message.value.trim() }
        }, status, form);
        return;
      }
      if (!endpoint && !mailto) { e.preventDefault(); status.textContent = '접수 주소가 설정되지 않아 제출할 수 없습니다.'; return; }
      if (!validate()) { e.preventDefault(); status.textContent = '입력 내용을 다시 확인해 주세요.'; var b = form.querySelector('.bad input,.bad select'); if (b) b.focus(); return; }
      if (!endpoint && mailto) {
        e.preventDefault();
        var f = form.elements, lines = ['사이트 주소: ' + f.site_url.value.trim(), '사이트 종류: ' + f.site_kind.value, '담당자: ' + f.contact_name.value.trim(), '이메일: ' + f.email.value.trim(), '연락처: ' + f.phone.value.trim(), '소유·점검 권한 확인: 예', '개인정보 수집·이용 동의: 예', '추가 확인용 자료 제공: ' + (Array.prototype.slice.call(form.querySelectorAll('input[name=extra_materials]:checked')).map(function (x) { return x.value; }).join(', ') || '없음'), '문의 내용: ' + f.message.value.trim()];
        location.href = 'mailto:' + mailto + '?subject=' + encodeURIComponent('진단 신청') + '&body=' + encodeURIComponent(lines.join('\n'));
        status.textContent = '메일 작성 화면을 열었습니다. 메일을 보내야 신청이 완료됩니다.';
      }
    });
    form.addEventListener('change', function (e) { var t = e.target; if (t && t.closest('.field') && t.closest('.field').classList.contains('bad')) validate(); });
  }

  /* ---- 접수 서버(api) 공용 ---- */
  function postApi(api, data, statusEl, form) {
    var btn = form.querySelector('button[type=submit]'), label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '접수 중…'; }
    statusEl.className = 'form-status'; statusEl.textContent = '';
    fetch(api + '/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok) {
          statusEl.className = 'form-status ok';
          statusEl.textContent = (x.j.message || '접수되었습니다.') + (x.j.no ? ' 접수번호 ' + x.j.no + ' — 적어 두시면 접수 조회 페이지에서 진행 상태를 볼 수 있습니다.' : '');
          form.reset();
        } else { statusEl.className = 'form-status bad'; statusEl.textContent = (x.j && x.j.error) || '접수에 실패했습니다. 잠시 뒤 다시 시도해 주세요.'; }
      })
      .catch(function () { statusEl.className = 'form-status bad'; statusEl.textContent = '연결이 되지 않았습니다. 잠시 뒤 다시 시도해 주세요.'; })
      .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
  }
  function fieldErr(el, msg) {
    var box = el.closest('.field'), err = box && box.querySelector('.err');
    if (box) box.classList.toggle('bad', !!msg);
    if (err) err.textContent = msg || '';
    return !msg;
  }

  /* ---- CMS 도입 상담 양식 ---- */
  var cms = document.getElementById('cms-form');
  if (cms) {
    var cst = document.getElementById('cms-status');
    cms.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = cms.elements, ok = true;
      ok = fieldErr(f.paper, f.paper.value.trim() ? '' : '매체명을 입력해 주세요.') && ok;
      var u = f.site_url.value.trim(), uok = true;
      try { var uu = new URL(u); uok = /^https?:$/.test(uu.protocol) && uu.hostname.indexOf('.') > 0 && !uu.username; } catch (x) { uok = false; }
      ok = fieldErr(f.site_url, uok ? '' : 'https://로 시작하는 올바른 주소를 입력해 주세요.') && ok;
      ok = fieldErr(f.cur_cms, f.cur_cms.value ? '' : '지금 쓰는 CMS를 선택해 주세요.') && ok;
      ok = fieldErr(f.contact_name, f.contact_name.value.trim() ? '' : '담당자 이름을 입력해 주세요.') && ok;
      ok = fieldErr(f.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()) ? '' : '올바른 이메일을 입력해 주세요.') && ok;
      ok = fieldErr(f.phone, f.phone.value.replace(/\D/g, '').length >= 8 ? '' : '연락처를 입력해 주세요.') && ok;
      ok = fieldErr(f.privacy_agree, f.privacy_agree.checked ? '' : '개인정보 수집·이용에 동의해 주세요.') && ok;
      if (!ok) { cst.className = 'form-status bad'; cst.textContent = '입력 내용을 다시 확인해 주세요.'; var b = cms.querySelector('.bad input,.bad select'); if (b) b.focus(); return; }
      var api = cms.getAttribute('data-api');
      if (!api) { cst.className = 'form-status bad'; cst.textContent = '접수 주소가 설정되지 않아 제출할 수 없습니다.'; return; }
      postApi(api, {
        type: 'cms', paper: f.paper.value.trim(), url: u, name: f.contact_name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
        consent: f.privacy_agree.checked, company_site: f.company_site.value,
        extra: { cur_cms: f.cur_cms.value, volume: f.volume.value, interests: [].slice.call(cms.querySelectorAll('input[name=interest]:checked')).map(function (x) { return x.value; }), message: f.message.value.trim() }
      }, cst, cms);
    });
  }

  /* ---- 접수 조회 ---- */
  var sf = document.getElementById('status-form');
  if (sf) {
    var sr = document.getElementById('status-result');
    sf.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = sf.elements, api = sf.getAttribute('data-api'), ok = true;
      ok = fieldErr(f.no, f.no.value.trim() ? '' : '접수번호를 입력해 주세요.') && ok;
      ok = fieldErr(f.phone4, /^\d{4}$/.test(f.phone4.value.trim()) ? '' : '연락처 뒤 네 자리 숫자를 입력해 주세요.') && ok;
      if (!ok) return;
      if (!api) { sr.className = 'form-status bad'; sr.textContent = '조회 서버가 설정되지 않았습니다.'; return; }
      sr.className = 'form-status'; sr.textContent = '조회 중…';
      fetch(api + '/status-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ no: f.no.value.trim(), phone4: f.phone4.value.trim() }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.ok) { sr.className = 'form-status ok'; sr.textContent = '접수번호 ' + x.j.no + ' · 현재 상태: ' + x.j.label + ' · 접수일 ' + x.j.at; }
          else { sr.className = 'form-status bad'; sr.textContent = (x.j && x.j.error) || '조회하지 못했습니다.'; }
        })
        .catch(function () { sr.className = 'form-status bad'; sr.textContent = '연결이 되지 않았습니다. 잠시 뒤 다시 시도해 주세요.'; });
    });
  }
})();

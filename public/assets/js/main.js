/* 문구 세기 전환(?copy=hard) · 주소 이어받기 · robots.txt 열기 링크 · 신청 양식(전송·저장 없음) */
(function(){
  'use strict';
  var $=function(s){return document.querySelector(s)};
  try{if(new URLSearchParams(location.search).get('review')==='1')document.documentElement.setAttribute('data-review','');var q=new URLSearchParams(location.search).get('copy');if(q==='hard'||q==='soft')document.documentElement.dataset.copy=q}catch(e){}
  function norm(v){v=(v||'').trim();if(!v)return '';if(!/^https?:\/\//i.test(v))v='https://'+v;try{var u=new URL(v);return /\./.test(u.hostname)?u.origin:''}catch(e){return ''}}
  var hu=$('#heroUrl'),rl=$('#robotsLink'),rh=$('#robotsHint'),au=$('#applyUrl');
  function sync(){
    var o=norm(hu&&hu.value);
    if(o){rl.href=o+'/robots.txt';rh.textContent=o+'/robots.txt 를 새 창에서 엽니다.'}
    else{rl.href='#apply';rl.removeAttribute('target');rh.textContent='위 칸에 주소를 넣으면 열립니다.'}
    if(o)rl.target='_blank';
  }
  if(hu)hu.addEventListener('input',sync);
  rl.addEventListener('click',function(e){if(!norm(hu&&hu.value)){e.preventDefault();hu.focus();hu.scrollIntoView({block:'center'})}});
  var hf=$('#heroForm');
  if(hf)hf.addEventListener('submit',function(e){e.preventDefault();var o=norm(hu.value);if(o&&au)au.value=o;var t=$('#apply');t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});setTimeout(function(){var f=$('#applyForm select');if(f)f.focus({preventScroll:true})},500)});
  var a=$('#applyForm'),m=$('#applyMsg'),fb=$('#applyFallback'),ft=$('#applyText');
  function lab(i){if(i.type==='checkbox')return '개인정보 수집·이용 동의';var l=i.closest('label');return l?l.firstChild.textContent.trim()||l.textContent.trim().slice(0,12):i.name}
  if(a)a.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=[].slice.call(a.querySelectorAll('[required]')).filter(function(i){return i.type==='checkbox'?!i.checked:!i.value.trim()});
    m.hidden=false;fb.hidden=true;
    if(bad.length){m.textContent='빈 칸이 있습니다: '+bad.map(lab).join(', ');bad[0].focus();return}
    if(a.elements.website_hp.value){return}
    var d={kind:a.kind.value,org:a.org.value.trim(),who:a.who.value.trim(),tel:a.tel.value.trim(),url:a.url.value.trim(),agree:true,at:new Date().toISOString()};
    var ep=(a.getAttribute('data-endpoint')||'').trim();
    function manual(why){
      ft.value='[긴급 진단 신청]\n기관 분류: '+d.kind+'\n기관명: '+d.org+'\n담당 부서·성명: '+d.who+'\n연락처: '+d.tel+'\n웹사이트: '+d.url+'\n개인정보 수집·이용 동의: 예';
      fb.hidden=false;m.textContent=why;
    }
    if(!/^https:\/\//i.test(ep)){manual('신청 서버가 아직 연결되지 않아 전송하지 않았습니다. 아래 내용을 복사해 메일로 보내 주십시오.');return}
    m.textContent='보내는 중입니다…';
    fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d),referrerPolicy:'no-referrer'})
      .then(function(r){if(!r.ok)throw 0;m.textContent='신청이 접수되었습니다. 영업일 기준 1~2일 안에 입력하신 연락처로 진단서를 보내 드립니다.';a.reset()})
      .catch(function(){manual('전송하지 못했습니다. 아래 내용을 복사해 메일로 보내 주십시오.')});
  });
  var cp=$('#applyCopy');
  if(cp)cp.addEventListener('click',function(){
    function sel(){ft.focus();ft.select();m.textContent='내용을 선택했습니다. 복사(Ctrl+C) 후 메일에 붙여 넣으십시오.'}
    try{navigator.clipboard.writeText(ft.value).then(function(){m.textContent='복사했습니다. 메일에 붙여 넣어 보내 주십시오.'},sel)}catch(e){sel()}
  });
})();

/* PC: 구역 내용이 화면 높이에 맞게 글자·간격을 함께 키우거나 줄인다 */
(function(){
  var MIN=.72,MAX=1.5,HEAD=62;
  function fit(){
    var w=document.querySelectorAll('.s[id]>.wrap');
    for(var i=0;i<w.length;i++){w[i].style.zoom=''}
    if(innerWidth<981)return;
    var avail=innerHeight-HEAD-50;
    for(var j=0;j<w.length;j++){
      if(w[j].parentNode.id==='hit')continue;
      var z=1;
      for(var k=0;k<4;k++){
        var h=w[j].getBoundingClientRect().height/z;
        var nz=Math.min(MAX,(innerWidth-36)/1180,Math.max(MIN,avail/h));
        if(Math.abs(nz-z)<.015)break;
        z=nz;w[j].style.zoom=z.toFixed(3);
      }
    }
  }
  addEventListener('load',fit);addEventListener('resize',fit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  fit();
})();

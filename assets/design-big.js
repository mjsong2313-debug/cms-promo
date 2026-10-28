/* 디자인 10종: PC 화면 / 휴대폰 화면 전환. 휴대폰 화면은 실제 샘플을 폭 390으로 띄워 보여 준다. */
(function(){
  'use strict';
  var root=document.documentElement,btns=[].slice.call(document.querySelectorAll('[data-dv]')),rows=[].slice.call(document.querySelectorAll('.dbg-row'));
  if(!btns.length||!rows.length)return;
  var note=document.querySelector('.dbg-note'),built=false,io=null;
  function build(){
    if(built)return;built=true;
    rows.forEach(function(r){
      var a=r.querySelector('a.dsg-card'),ph=document.createElement('span');
      ph.className='dbg-ph';ph.setAttribute('aria-hidden','true');
      ph.innerHTML='<span class="dbg-ph-in"><i class="dbg-notch"></i></span>';
      a.insertBefore(ph,a.firstChild);
    });
    function fit(ph){var w=ph.clientWidth-16;var in_=ph.firstChild;in_.style.setProperty('--sc',(w/390).toFixed(4))}
    if('ResizeObserver' in window){var ro=new ResizeObserver(function(es){es.forEach(function(e){fit(e.target)})});rows.forEach(function(r){ro.observe(r.querySelector('.dbg-ph'))})}
    else addEventListener('resize',function(){rows.forEach(function(r){fit(r.querySelector('.dbg-ph'))})});
    rows.forEach(function(r){fit(r.querySelector('.dbg-ph'))});
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){load(e.target);io.unobserve(e.target)}})},{rootMargin:'400px 0px'});
      rows.forEach(function(r){io.observe(r)});
    }else rows.forEach(load);
  }
  function load(r){
    var in_=r.querySelector('.dbg-ph-in');if(in_.querySelector('iframe'))return;
    var f=document.createElement('iframe');f.title='휴대폰 화면 미리보기';f.tabIndex=-1;f.setAttribute('loading','lazy');
    f.addEventListener('load',function(){try{[].forEach.call(f.contentDocument.querySelectorAll('a[href$="design.html"]'),function(x){if(/fixed/.test(x.getAttribute('style')||''))x.style.display='none'})}catch(e){}});f.src=r.querySelector('a.dsg-card').getAttribute('href');in_.appendChild(f);
  }
  function set(v){
    if(v==='m')build();
    root.dataset.dview=v==='m'?'m':'pc';
    btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.dv===v))});
    if(note)note.textContent=v==='m'?'휴대폰에서 보이는 모습 그대로입니다. 누르면 큰 창으로 열립니다.':'화면을 누르면 큰 창이 열립니다.';
    try{sessionStorage.setItem('dsgView',v)}catch(e){}
  }
  btns.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.dv)})});
  var h=location.hash==='#phone'||location.search.indexOf('view=m')>-1,sv='';try{sv=sessionStorage.getItem('dsgView')||''}catch(e){}
  if(h||sv==='m')set('m');
})();

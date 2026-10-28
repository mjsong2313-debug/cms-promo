/* 디자인 10종: 카드를 누르면 큰 창으로 실제 샘플 화면을 띄운다. 자바스크립트가 안 되면 카드는 예전처럼 링크로 열린다. */
(function(){
  'use strict';
  var cards=[].slice.call(document.querySelectorAll('a.dsg-card'));
  if(!cards.length||!window.HTMLElement) return;
  var m=null,fr=null,load=null,idx=0,opener=null,timer=null,view='pc';
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
  function build(){
    m=el('div','dm');m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','디자인 실제 화면');m.dataset.view='pc';
    m.innerHTML='<div class="dm-bar"><div class="dm-title"><span id="dmT"></span><small id="dmS"></small></div><span class="dm-count" id="dmC"></span>'+
      '<div class="dm-grp" role="group" aria-label="화면 크기"><button type="button" class="dm-btn" data-v="pc" aria-pressed="true">PC 화면</button><button type="button" class="dm-btn" data-v="m" aria-pressed="false">휴대폰 화면</button></div>'+
      '<div class="dm-grp"><button type="button" class="dm-btn" data-go="-1" aria-label="이전 디자인">← 이전</button><button type="button" class="dm-btn" data-go="1" aria-label="다음 디자인">다음 →</button></div>'+
      '<a class="dm-btn" id="dmN" target="_blank" rel="noopener">새 창 ↗</a><button type="button" class="dm-btn dm-close" id="dmX" aria-label="닫기">✕ 닫기</button></div>'+
      '<div class="dm-stage"><div class="dm-frame"><iframe title="샘플 화면" loading="eager"></iframe><div class="dm-load"><i></i>화면을 불러오는 중</div></div></div>';
    document.body.appendChild(m);fr=m.querySelector('iframe');load=m.querySelector('.dm-load');
    m.addEventListener('click',function(e){
      var b=e.target.closest('button,a');
      if(e.target.classList.contains('dm-stage')||e.target===m){close();return}
      if(!b)return;
      if(b.id==='dmX')close();
      else if(b.dataset.v){view=b.dataset.v;m.dataset.view=view;[].forEach.call(m.querySelectorAll('[data-v]'),function(x){x.setAttribute('aria-pressed',String(x===b))})}
      else if(b.dataset.go)show((idx+parseInt(b.dataset.go,10)+cards.length)%cards.length);
    });
    fr.addEventListener('load',function(){
      if(!m.classList.contains('on')||/^about:blank/.test(fr.getAttribute('src')||''))return;
      clearTimeout(timer);
      try{
        var d=fr.contentDocument; if(!d||!d.body||!d.body.children.length)throw 0;
        d.addEventListener('keydown',function(e){if(e.key==='Escape'||e.key==='ArrowLeft'||e.key==='ArrowRight')onKey(e)});
        [].forEach.call(d.querySelectorAll('a[href$="design.html"]'),function(a){if(/fixed/.test(a.getAttribute('style')||''))a.style.display='none'});
        load.classList.add('off');
      }catch(x){fail()}
    });
  }
  function fail(){ // 창 안에 못 띄우면 예전처럼 같은 화면에서 연다
    var h=cards[idx].href;close(true);location.href=h;
  }
  function show(i){
    idx=i;var c=cards[i],t=c.querySelector('.dsg-t b'),s=c.querySelector('.dsg-t small');
    m.querySelector('#dmT').textContent=t?t.textContent:'';m.querySelector('#dmS').textContent=s?s.textContent:'';
    m.querySelector('#dmC').textContent=(i+1)+' / '+cards.length;m.querySelector('#dmN').href=c.href;
    load.classList.remove('off');clearTimeout(timer);timer=setTimeout(fail,9000);fr.src=c.href;
  }
  function open(i,from){
    if(!m)build();opener=from;idx=i;var pv=document.documentElement.dataset.dview;if(pv){var bb=m.querySelector('[data-v='+(pv==='m'?'m':'pc')+']');if(bb)bb.click()}
    document.documentElement.classList.add('dm-lock');
    show(i);requestAnimationFrame(function(){m.classList.add('on');m.querySelector('#dmX').focus()});
  }
  function close(quiet){
    if(!m)return;clearTimeout(timer);m.classList.remove('on');document.documentElement.classList.remove('dm-lock');
    setTimeout(function(){if(fr&&!m.classList.contains('on'))fr.src='about:blank'},300);
    if(!quiet&&opener&&opener.focus)opener.focus();
  }
  cards.forEach(function(c,i){c.addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();open(i,c)})});
  function onKey(e){
    if(!m||!m.classList.contains('on'))return;
    if(e.key==='Escape'){close()}
    else if(e.key==='ArrowRight')show((idx+1)%cards.length);
    else if(e.key==='ArrowLeft')show((idx-1+cards.length)%cards.length);
    else if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('button,a[href]'));var a=document.activeElement;if(!m.contains(a)){e.preventDefault();f[0].focus()}else if(e.shiftKey&&a===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&a===f[f.length-1]){e.preventDefault();f[0].focus()}}
  }
  addEventListener('keydown',onKey);
})();

/* ux.js — 공통 화면 효과. 오류가 나도 페이지 본문은 그대로 동작하도록 모든 기능을 따로 감싼다. */
(function(){
'use strict';
var d=document,de=d.documentElement,W=function(){return innerWidth};
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
var fine=false;try{fine=matchMedia('(hover:hover)').matches}catch(e){}
function safe(f){try{f()}catch(e){}}

/* 1) 토스트 */
safe(function(){
 var t=d.createElement('div');t.id='ux-toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');d.body.appendChild(t);
 var tm=null;
 window.uxToast=function(msg){if(!msg)return;t.textContent=msg;t.classList.add('on');clearTimeout(tm);tm=setTimeout(function(){t.classList.remove('on')},2800)};
 var sel='#f-msg,#c-msg,#applyMsg,#atoolmsg,.form .msg';
 [].forEach.call(d.querySelectorAll(sel),function(el){
  var last='';
  new MutationObserver(function(){var s=(el.textContent||'').trim();if(s&&!el.hidden&&s!==last){last=s;window.uxToast(s.length>90?s.slice(0,88)+'…':s)}if(!s)last=''}).observe(el,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 });
});

/* 2) 툴팁: 글자가 없거나 한두 글자뿐인 단추에 aria-label/title 을 말풍선으로 */
safe(function(){
 if(!fine)return;
 var tip=d.createElement('div');tip.id='ux-tip';tip.setAttribute('role','tooltip');d.body.appendChild(tip);
 var cur=null;
 function label(el){var tx=(el.textContent||'').trim();if(tx.length>2)return '';return el.getAttribute('aria-label')||el.getAttribute('data-tip')||el.getAttribute('title')||''}
 function show(el){var s=label(el);if(!s)return;cur=el;if(el.title){el.setAttribute('data-tip',el.title);el.removeAttribute('title')}tip.textContent=s;var r=el.getBoundingClientRect();tip.classList.add('on');var w=tip.offsetWidth;var x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2));var y=r.bottom+8;if(y+34>innerHeight)y=r.top-34;tip.style.left=x+'px';tip.style.top=y+'px';el.addEventListener('mouseleave',hide,{once:true})}
 function hide(){cur=null;tip.classList.remove('on')}
 d.addEventListener('mouseover',function(e){var el=e.target.closest&&e.target.closest('button,a,[role=button]');if(el&&el!==cur&&label(el))show(el)});
 d.addEventListener('focusin',function(e){var el=e.target;if(el&&el.matches&&el.matches('button,a,[role=button]')&&label(el))show(el)});
 d.addEventListener('focusout',hide);d.addEventListener('scroll',hide,{passive:true});
});

/* 3) 스켈레톤: 아직 안 온 그림에 반짝이는 윤곽 */
safe(function(){
 function mark(img){if(img.complete&&img.naturalWidth>0)return;img.classList.add('ux-sk');var done=function(){img.classList.remove('ux-sk')};img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true})}
 [].forEach.call(d.querySelectorAll('img'),mark);
 var v=d.querySelectorAll('video[poster]');[].forEach.call(v,function(x){if(x.readyState<2){x.classList.add('ux-sk');var f=function(){x.classList.remove('ux-sk')};x.addEventListener('loadeddata',f,{once:true});x.addEventListener('error',f,{once:true});setTimeout(f,6000)}});
});

/* 4) 패럴랙스: 첫 화면 뒤 빛이 느리게 따라옴(PC) */
safe(function(){
 if(reduce||W()<981)return;
 if(d.body.classList.contains('skin-clean'))return;var h=d.querySelector('.hero');if(!h)return;
 var px=d.createElement('div');px.className='ux-px';px.setAttribute('aria-hidden','true');h.classList.add('ux-has-px');h.insertBefore(px,h.firstChild);
 var tick=false;
 function upd(){tick=false;var r=h.getBoundingClientRect();if(r.bottom<-200||r.top>innerHeight)return;px.style.transform='translate3d(0,'+(-r.top*0.18).toFixed(1)+'px,0)'}
 addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});upd();
});

/* 5) 눌렀을 때 물결 반응 */
safe(function(){
 d.addEventListener('pointerdown',function(e){
  var b=e.target.closest&&e.target.closest('.btn,button.btn,a.btn');if(!b||reduce)return;
  if(getComputedStyle(b).position==='static')b.style.position='relative';
  b.classList.add('ux-rpbox');
  var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,o=d.createElement('span');o.className='ux-rp';
  o.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
  b.appendChild(o);setTimeout(function(){o.remove()},600);
 },{passive:true});
});

/* 6) 시간차 등장(공공기관 페이지) · 한결일보 카드 시간차 */
safe(function(){
 var hk=d.querySelectorAll('.hk-rv');
 if(hk.length){[].forEach.call(hk,function(el,i){el.style.setProperty('--ux-i',String(i%6))})}
 var body=d.body;if(!(body&&d.querySelector('.hero')&&d.querySelector('.s[id]')))return;
 if(reduce||W()<981||!('IntersectionObserver' in window))return;
 var items=d.querySelectorAll('.s[id] .card,.s[id] .steps li,.s[id] .node,.s[id] .contract');
 if(!items.length)return;
 var groups=new Map();
 [].forEach.call(items,function(el){var p=el.parentElement;var n=groups.get(p)||0;groups.set(p,n+1);el.style.setProperty('--ux-i',String(n));el.classList.add('ux-rv')});
 de.classList.add('ux-js');
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('ux-in');io.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -4% 0px'});
 [].forEach.call(items,function(el){io.observe(el)});
 setTimeout(function(){[].forEach.call(items,function(el){el.classList.add('ux-in')})},4000);
});

/* 7) 스크롤 스냅(PC, 느슨하게). 스크롤로 움직이는 무대(data-nofit)가 있는 사이트는 켜지 않는다. */
safe(function(){
 if(reduce||!fine||W()<981)return;
 if(d.querySelector('[data-nofit]'))return;
 if(!d.querySelector('.sec[id],.s[id]'))return;
 de.classList.add('ux-snap');
});
})();
/* 구역 위치 점(오른쪽 가장자리, PC) */
(function(){try{var d=document;if(!window.IntersectionObserver)return;
var secs=[].slice.call(d.querySelectorAll('section[id].sec,section[id].s,.s[id],.sec[id]'));var seen={};secs=secs.filter(function(s){if(seen[s.id])return false;seen[s.id]=1;return true});if(secs.length<3)return;
function lab(s){var l=s.getAttribute('data-label');if(l)return l;var a=d.querySelector('.nav a[href="#'+s.id+'"],nav a[href="#'+s.id+'"]');return a?a.textContent.trim():s.id}
var nav=d.createElement('nav');nav.id='ux-dots';nav.setAttribute('aria-label','구역 이동');
var btn=secs.map(function(s){var a=d.createElement('a');a.href='#'+s.id;a.setAttribute('data-l',lab(s));a.setAttribute('aria-label',lab(s));nav.appendChild(a);return a});
d.body.appendChild(nav);
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){btn.forEach(function(b){b.classList.remove('on')});var i=secs.indexOf(e.target);if(i>-1)btn[i].classList.add('on')}})},{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(function(s){io.observe(s)})}catch(e){}})();

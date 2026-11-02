/* 탭 · 서랍 메뉴 · 드롭다운 · 절차 캐러셀 */
(function(){'use strict';var d=document,$=function(s,r){return(r||d).querySelector(s)},A=function(s,r){return[].slice.call((r||d).querySelectorAll(s))};
try{
/* 탭 */
var tabs=A('[role=tab]');function sel(t){tabs.forEach(function(b){var on=b===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;var p=d.getElementById(b.getAttribute('aria-controls'));if(p)p.hidden=!on});}
tabs.forEach(function(b,i){b.addEventListener('click',function(){sel(b)});b.addEventListener('keydown',function(e){var k=e.key,n=-1;if(k==='ArrowRight'||k==='ArrowDown')n=(i+1)%tabs.length;else if(k==='ArrowLeft'||k==='ArrowUp')n=(i+tabs.length-1)%tabs.length;if(n>-1){e.preventDefault();tabs[n].focus();sel(tabs[n])}})});
/* 서랍 */
var dr=$('#drawer'),ov=$('#drOv'),bg=$('#burger');
function openD(o){dr.classList.toggle('on',o);dr.setAttribute('aria-hidden',!o);ov.hidden=!o;bg.setAttribute('aria-expanded',o);d.body.style.overflow=o?'hidden':''}
if(dr){bg.addEventListener('click',function(){openD(true)});$('#drX').addEventListener('click',function(){openD(false)});ov.addEventListener('click',function(){openD(false)});A('a',dr).forEach(function(a){a.addEventListener('click',function(){openD(false)})});d.addEventListener('keydown',function(e){if(e.key==='Escape'&&dr.classList.contains('on'))openD(false)})}
/* 드롭다운 */
var dd=$('.dd'),db=$('#ddB');
if(dd){db.addEventListener('click',function(e){e.stopPropagation();var o=!dd.classList.contains('on');dd.classList.toggle('on',o);db.setAttribute('aria-expanded',o)});
d.addEventListener('click',function(){dd.classList.remove('on');db.setAttribute('aria-expanded',false)});d.addEventListener('keydown',function(e){if(e.key==='Escape'){dd.classList.remove('on');db.setAttribute('aria-expanded',false)}});
A('#ddM a').forEach(function(a){a.addEventListener('click',function(){var s=$('#applyForm select');if(s){var k=a.getAttribute('data-k');for(var i=0;i<s.options.length;i++){if(s.options[i].text===k){s.selectedIndex=i;break}}}})})}
/* 절차 캐러셀 */
var L=$('#stepsL'),P=$('#carP'),N=$('#carN');
if(L&&P&&N){var st=function(){var li=L.querySelector('li');return li?li.getBoundingClientRect().width+12:240};P.addEventListener('click',function(){L.scrollBy({left:-st(),behavior:'smooth'})});N.addEventListener('click',function(){L.scrollBy({left:st(),behavior:'smooth'})})}
}catch(e){}})();

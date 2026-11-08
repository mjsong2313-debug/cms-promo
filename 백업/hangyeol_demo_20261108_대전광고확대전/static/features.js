(function(){'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
/* 슬라이더 */
function slider(el){var vp=$('.sl-vp',el),tr=$('.sl-track',el),sl=[].slice.call(tr.children),per=+el.dataset.per||1,gap=+el.dataset.gap||0,idx=0,tm=null,auto=+el.dataset.auto||0,paused=false,sc=el.closest('.sl-sec')||el,cnt=$('.sl-count',sc);
 var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function cur(){var p=per;if(matchMedia('(max-width:860px)').matches)p=+el.dataset.perTab||p;if(matchMedia('(max-width:520px)').matches)p=+el.dataset.perMob||1;return Math.min(p,sl.length)}
 function pages(){return Math.max(1,sl.length-cur()+1)}
 function lay(){var p=cur(),w=(vp.clientWidth-(p-1)*gap)/p;sl.forEach(function(s){s.style.flex='0 0 '+w+'px';s.style.marginRight=gap+'px'});go(idx,true)}
 function go(i,now){var n=pages();idx=((i%n)+n)%n;var w=sl[0].getBoundingClientRect().width+gap;tr.style.transition=now?'none':'';tr.style.transform='translateX('+(-idx*w)+'px)';var p=cur();sl.forEach(function(s,k){var v=k>=idx&&k<idx+p;if(v){s.removeAttribute('inert');s.removeAttribute('aria-hidden')}else{s.setAttribute('inert','');s.setAttribute('aria-hidden','true')}});if(cnt)cnt.textContent=(idx+1)+' / '+n}
 function stop(){if(tm){clearInterval(tm);tm=null}}
 function start(){stop();if(auto&&!rm&&!paused&&pages()>1)tm=setInterval(function(){go(idx+1)},auto)}
 $('.sl-prev',sc)&&$('.sl-prev',sc).addEventListener('click',function(){go(idx-1);start()});
 $('.sl-next',sc)&&$('.sl-next',sc).addEventListener('click',function(){go(idx+1);start()});
 el.addEventListener('mouseenter',stop);el.addEventListener('mouseleave',start);el.addEventListener('focusin',stop);el.addEventListener('focusout',start);
 document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
 var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(lay,120)});lay();start()}
$$('[data-sl]').forEach(slider);
/* 페이지 넘김 */
function pager(box,rows,size,onPage){var n=Math.ceil(rows.length/size);if(n<2)return;var nav=document.createElement('nav');nav.className='pager';nav.setAttribute('aria-label','페이지 이동');box.parentNode.insertBefore(nav,box.nextSibling);
 function show(p,scroll){p=Math.min(Math.max(1,p),n);rows.forEach(function(r,i){r.hidden=!(i>=(p-1)*size&&i<p*size)});nav.innerHTML='';
  function b(txt,pg,dis,cur){var x=document.createElement('button');x.type='button';x.textContent=txt;if(dis)x.disabled=true;if(cur)x.setAttribute('aria-current','page');x.addEventListener('click',function(){show(pg,true)});nav.appendChild(x)}
  b('‹ 이전',p-1,p==1);for(var i=1;i<=n;i++)b(String(i),i,false,i==p);b('다음 ›',p+1,p==n);
  try{history.replaceState(null,'',p>1?'#p'+p:location.pathname+location.search)}catch(e){}
  if(scroll){var t=box.getBoundingClientRect().top+scrollY-90;scrollTo({top:Math.max(0,t),behavior:'auto'})}if(onPage)onPage(p)}
 var m=/^#p(\d+)$/.exec(location.hash);show(m?+m[1]:1,false)}
$$('[data-page-size]').forEach(function(box){var rows=[].slice.call(box.children);pager(box,rows,+box.dataset.pageSize)});
/* NEWS MAP */
(function(){var root=document.getElementById('nmap');if(!root||!window.NMAP_GEO)return;var dEl=document.getElementById('nmap-data');if(!dEl)return;var data=JSON.parse(dEl.textContent),NS='http://www.w3.org/2000/svg',holder=$('.nmap-svg-in',root),panel=$('.nmap-panel',root),svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox',window.NMAP_VB);svg.setAttribute('role','group');svg.setAttribute('aria-label','전국 시도별 기사 지도');
 function lv(n){return n>=7?4:n>=5?3:n>=3?2:n>=1?1:0}var paths={},cur=null;
 window.NMAP_GEO.forEach(function(g){var n=(data[g.n]||[]).length,p=document.createElementNS(NS,'path');p.setAttribute('d',g.d);p.setAttribute('class','l'+lv(n));p.setAttribute('tabindex','0');p.setAttribute('role','button');p.setAttribute('aria-label',g.n+' 기사 '+n+'건 보기');var t=document.createElementNS(NS,'title');t.textContent=g.n+' ('+n+'건)';p.appendChild(t);
  function open(){openSido(g.n)}p.addEventListener('click',open);p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});svg.appendChild(p);paths[g.n]=p;
  var tx=document.createElementNS(NS,'text');tx.setAttribute('x',g.x);tx.setAttribute('y',g.y+4);tx.textContent=g.n;svg.appendChild(tx)});
 holder.appendChild(svg);
 function openSido(name,page){cur=name;Object.keys(paths).forEach(function(k){paths[k].classList.toggle('on',k===name)});var L=data[name]||[],size=5,n=Math.max(1,Math.ceil(L.length/size));page=Math.min(Math.max(1,page||1),n);
  var h='<div class="nmap-ph"><h3>'+name+'<em>('+L.length+'건)</em></h3><button type="button" class="nmap-x">닫기</button></div>';
  if(!L.length)h+='<p class="nmap-empty">이 지역 기사는 아직 없습니다.</p>';else{h+='<ul class="nmap-list">';L.slice((page-1)*size,page*size).forEach(function(a){h+='<li><a href="'+a.u+'">'+a.t.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</a><span class="meta"><span class="cat">'+a.c+'</span> <time>'+a.d+'</time></span></li>'});h+='</ul>';
   if(n>1)h+='<nav class="pager" aria-label="지역 기사 페이지"><button type="button" data-pg="'+(page-1)+'"'+(page==1?' disabled':'')+'>‹ 이전</button><span class="pg-info">'+page+' / '+n+'</span><button type="button" data-pg="'+(page+1)+'"'+(page==n?' disabled':'')+'>다음 ›</button></nav>'}
  panel.innerHTML=h;panel.hidden=false;$('.nmap-x',panel).addEventListener('click',function(){panel.innerHTML='<p class="nmap-empty">지도에서 지역을 선택하세요.</p>';Object.keys(paths).forEach(function(k){paths[k].classList.remove('on')})});
  $$('[data-pg]',panel).forEach(function(b){b.addEventListener('click',function(){openSido(name,+b.dataset.pg)})})}
 var best=Object.keys(data).sort(function(a,b){return data[b].length-data[a].length})[0];openSido(best)})();
})();
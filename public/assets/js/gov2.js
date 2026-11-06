(function(){'use strict';var d=document,de=d.documentElement;function safe(f){try{f()}catch(e){}}
safe(function(){var p=d.createElement('div');p.className='gv-pg';p.setAttribute('aria-hidden','true');d.body.appendChild(p);
 var t=d.createElement('div');t.className='gv-tools';
 var a=d.createElement('button');a.type='button';a.textContent='가';a.setAttribute('aria-label','글자 크기 키우기(최대 3단계, 한 번 더 누르면 처음으로)');
 var u=d.createElement('button');u.type='button';u.className='gv-top';u.textContent='↑';u.setAttribute('aria-label','맨 위로');
 t.appendChild(a);t.appendChild(u);d.body.appendChild(t);
 var lv=0;try{lv=parseInt(localStorage.getItem('gv-fs')||'0',10)||0}catch(e){}
 function set(n){lv=n%4;de.classList.remove('fs1','fs2','fs3');if(lv)de.classList.add('fs'+lv);try{localStorage.setItem('gv-fs',lv)}catch(e){}}
 set(lv);a.onclick=function(){set(lv+1)};
 u.onclick=function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 function f(){var h=de.scrollHeight-innerHeight;p.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%';u.classList.toggle('on',scrollY>innerHeight*.8)}
 addEventListener('scroll',f,{passive:true});f();});
})();

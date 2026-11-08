/* 뉴스맵 접기·펼치기 (영남일보 NEWS MAP 띠와 같은 방식) */
(function(){
  var s=document.getElementById('nmap');if(!s)return;
  var bh=s.querySelector('.bh');if(!bh||bh.querySelector('.nmap-chev'))return;
  var b=document.createElement('button');b.type='button';b.className='nmap-chev';b.setAttribute('aria-label','뉴스맵 접기·펼치기');b.setAttribute('aria-expanded','true');b.textContent='⌃';
  bh.appendChild(b);
  function t(){var off=s.classList.toggle('nmap-off');b.setAttribute('aria-expanded',off?'false':'true');}
  bh.addEventListener('click',t);
})();

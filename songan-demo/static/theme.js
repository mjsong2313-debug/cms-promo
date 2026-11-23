try { var t = localStorage.getItem('theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
try { var f = localStorage.getItem('fs'); if (f === 's' || f === 'l' || f === 'xl') document.documentElement.setAttribute('data-fs', f); } catch (e) {}

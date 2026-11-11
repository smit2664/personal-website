(function(){
  var root=document.documentElement, btn=document.getElementById('theme');
  function set(mode){
    root.dataset.theme=mode;
    btn.textContent=mode==='dark'?'Light mode':'Dark mode';
    btn.setAttribute('aria-pressed',mode==='dark');
    try{localStorage.setItem('theme',mode)}catch(e){}
  }
  var saved='dark';
  try{saved=localStorage.getItem('theme')||'dark'}catch(e){}
  set(saved);
  btn.onclick=function(){set(root.dataset.theme==='dark'?'light':'dark')};
})();

// Light / Dark Mode
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

// Before / after sliders
document.querySelectorAll('.compare').forEach(function(box){
  var range = box.querySelector('.compare-range');
  function update(){ box.style.setProperty('--pos', range.value + '%'); }
  range.addEventListener('input', update);
  update();
});

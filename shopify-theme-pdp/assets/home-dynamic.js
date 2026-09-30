(()=>{
 if(window.__hdInit)return;window.__hdInit=1;
 const push=(n,d)=>{try{(window.dataLayer=window.dataLayer||[]).push({event:n,...d});}catch(e){}};
 const init=(scope)=>{
  (scope||document).querySelectorAll('[data-hd-tabs]:not([data-ready])').forEach(box=>{
   box.dataset.ready=1;
   const tabs=[...box.querySelectorAll('[data-tab]')];
   const panels=[...box.querySelectorAll('[role=tabpanel]')];
   const show=(i,focus)=>{tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;});
    panels.forEach((p,j)=>{p.hidden=i!==j;});
    if(focus)tabs[i].focus();
    tabs[i].scrollIntoView?.({inline:'center',block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    push('home_intent_tab',{tab:tabs[i].textContent.trim()});};
   tabs.forEach((t,i)=>{t.addEventListener('click',()=>show(i));
    t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show((i+1)%tabs.length,true);}if(e.key==='ArrowLeft'){e.preventDefault();show((i-1+tabs.length)%tabs.length,true);}});});
  });
 };
 init();document.addEventListener('shopify:section:load',e=>init(e.target));
})();

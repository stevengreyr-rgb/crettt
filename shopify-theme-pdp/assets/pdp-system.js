(()=>{
 if(window.__pdpSystem)return;window.__pdpSystem=1;
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 /* Extra engagement events. Native ViewContent/AddToCart/InitiateCheckout/Purchase stay with Shopify's pixels. */
 const track=(name,data={})=>{
  try{(window.dataLayer=window.dataLayer||[]).push({event:name,...data});}catch(e){}
  try{window.Shopify?.analytics?.publish?.('pdp_'+name,data);}catch(e){}
  try{window.fbq?.('trackCustom','PDP_'+name,data);}catch(e){}
  try{window.ttq?.track?.('PDP_'+name,data);}catch(e){}
  document.dispatchEvent(new CustomEvent('pdp:'+name,{detail:data}));
 };
 window.pdpTrack=track;
 const once=(el,fn)=>{if(!('IntersectionObserver'in window))return fn();const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){o.disconnect();fn();}},{rootMargin:'200px'});o.observe(el);};
 const init=scope=>{
  const s=scope||document;
  /* reveal on scroll (content stays visible if JS or IO fails) */
  if(!reduced&&'IntersectionObserver'in window){
   root.classList.add('pdp-js');
   const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
   s.querySelectorAll('.pdp-rv:not([data-rv])').forEach(el=>{el.dataset.rv=1;io.observe(el);});
  }
  /* FAQ */
  s.querySelectorAll('.pdp-faq details:not([data-t])').forEach(d=>{d.dataset.t=1;d.addEventListener('toggle',()=>{if(d.open)track('faq_open',{question:d.querySelector('summary')?.textContent.trim()});});});
  /* Demo video: lazy src, autoplay muted, pause off-screen, never auto sound */
  s.querySelectorAll('video[data-pdp-video]:not([data-ready])').forEach(v=>{
   v.dataset.ready=1;v.muted=true;
   once(v,()=>{v.querySelectorAll('source[data-src]').forEach(src=>{src.src=src.dataset.src;});v.load();
    if(!reduced&&'IntersectionObserver'in window){const o=new IntersectionObserver(es=>{es[0].isIntersecting?v.play().catch(()=>{}):v.pause();},{threshold:.4});o.observe(v);}
    else v.controls=true;});
   let fired=false;v.addEventListener('playing',()=>{if(!fired){fired=true;track('video_play',{src:v.currentSrc});}});
   v.closest('.pdp-media')?.querySelector('.pdp-demo__sound')?.addEventListener('click',e=>{v.muted=!v.muted;e.currentTarget.textContent=v.muted?e.currentTarget.dataset.on:e.currentTarget.dataset.off;if(!v.muted)v.play().catch(()=>{});});
  });
  /* Reviews: filter by stars / photos + load more (only reviews that exist) */
  s.querySelectorAll('[data-pdp-reviews]:not([data-ready])').forEach(box=>{
   box.dataset.ready=1;
   const items=[...box.querySelectorAll('.pdp-review')];const more=box.querySelector('[data-more]');const count=box.querySelector('[data-shown]');
   const step=+box.dataset.step||6;let limit=step;let star=0;let photos=false;
   const paint=()=>{let n=0,matched=0;items.forEach(el=>{const ok=(!star||+el.dataset.rating===star)&&(!photos||el.dataset.photos==='1');if(ok){matched++;el.hidden=n>=limit;if(!el.hidden)n++;}else el.hidden=true;});
    if(more)more.hidden=matched<=limit;const none=box.querySelector('[data-none]');if(none)none.hidden=matched>0||!items.length;};
   box.querySelectorAll('[data-star]').forEach(b=>b.addEventListener('click',()=>{const v=+b.dataset.star;star=star===v?0:v;box.querySelectorAll('[data-star]').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.star===star)));limit=step;paint();track('review_filter',{stars:star});}));
   box.querySelector('[data-photos]')?.addEventListener('click',e=>{photos=!photos;e.currentTarget.setAttribute('aria-pressed',String(photos));limit=step;paint();track('review_filter',{photos});});
   more?.addEventListener('click',()=>{limit+=step;paint();track('review_more',{shown:limit});});
   box.querySelector('[data-write]')?.addEventListener('toggle',e=>{if(e.currentTarget.open)track('review_write_open');});
   paint();
  });
  /* Recommendations fetched from Shopify's engine */
  s.querySelectorAll('[data-pdp-recs]:not([data-ready])').forEach(el=>{
   el.dataset.ready=1;
   once(el,()=>fetch(el.dataset.url).then(r=>r.ok?r.text():'').then(html=>{
    if(!html)return;const d=new DOMParser().parseFromString(html,'text/html');const src=d.querySelector('[data-pdp-recs-out]');
    if(src&&src.children.length){el.querySelector('[data-slot]').innerHTML=src.innerHTML;el.hidden=false;init(el);}
   }).catch(()=>{}));
  });
  /* product cards: click + quick add */
  s.querySelectorAll('[data-pdp-card]:not([data-ready])').forEach(card=>{
   card.dataset.ready=1;
   card.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>track('recommendation_click',{handle:card.dataset.handle,list:card.closest('[data-list]')?.dataset.list||''})));
   const btn=card.querySelector('[data-add]');if(!btn)return;
   btn.addEventListener('click',async()=>{
    const sel=card.querySelector('select');const id=sel?sel.value:btn.dataset.variant;if(!id||btn.disabled)return;
    const label=btn.textContent;btn.disabled=true;btn.textContent='…';
    try{
     const r=await fetch((window.Shopify?.routes?.root||'/')+'cart/add.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({items:[{id:+id,quantity:1}]})});
     if(!r.ok)throw 0;btn.textContent=btn.dataset.done;track('quick_add',{handle:card.dataset.handle,variant:id});
     document.dispatchEvent(new CustomEvent('sc:cart-updated'));
     setTimeout(()=>{btn.textContent=label;btn.disabled=false;},1800);
     if(btn.dataset.goto)location.href=btn.dataset.goto;
    }catch(e){btn.textContent=btn.dataset.err;setTimeout(()=>{btn.textContent=label;btn.disabled=false;},2200);}
   });
  });
 };
 init();document.addEventListener('shopify:section:load',e=>init(e.target));
 document.addEventListener('DOMContentLoaded',()=>init());
})();

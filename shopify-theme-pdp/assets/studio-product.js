(() => {
 const init = () => {
  const root = document.getElementById('sc-pdp');
  if (!root || root.dataset.stReady) return;
  root.dataset.stReady = '1';
  const variants = JSON.parse(root.querySelector('[data-variant-data]').textContent);
  const meta = JSON.parse(root.querySelector('[data-variant-meta]').textContent);
  const text = JSON.parse(root.querySelector('[data-st-strings]').textContent);
  const form = root.querySelector('#sc-pdp-form');
  const id = form.querySelector('[name=id]');
  const quantity = form.querySelector('[name=quantity]');
  const groups = [...root.querySelectorAll('[data-opt-index]')];
  const atc = root.querySelector('[data-checkout]');
  const buy = root.querySelector('[data-direct-checkout]');
  const sticky = document.getElementById('sc-pdp-sticky');
  const stickyAtc = sticky?.querySelector('[data-sticky-atc]');
  const error = root.querySelector('[data-error]');
  const track = root.querySelector('[data-gallery-track]');
  const slides = [...root.querySelectorAll('[data-media-id]')];
  const thumbs = [...root.querySelectorAll('[data-dot]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ping = (name, data) => window.pdpTrack?.(name, { handle: root.dataset.handle, ...data });
  let current = variants.find(v=>String(v.id)===id.value);
  let busy = false;
  let initial = true;
  const setText = (selector,value,hidden=false) => {
   const el=root.querySelector(selector); if(el){el.textContent=value; if(hidden)el.hidden=!value;}
  };
  const showError = message => {error.textContent=message;error.hidden=!message;};
  const selection = () => groups.map(g=>g.querySelector('[data-opt-select]')?.value ?? g.querySelector('[aria-pressed=true]')?.dataset.optValue);
  const goSlide = index => track?.scrollTo({left:track.clientWidth*index,behavior:initial||reduced?'instant':'smooth'});
  const paint = (move=false) => {
   const chosen=selection();
   current=groups.length?variants.find(v=>chosen.every((value,i)=>v.options[i]===value)):variants[0];
   const available=!!current?.available;
   id.value=current?.id||'';
   [atc,buy,stickyAtc].filter(Boolean).forEach(button=>button.disabled=busy||!available);
   atc.querySelector('[data-checkout-label]').textContent=current?(available?text.add:text.sold):text.unavailable;
   if(stickyAtc)stickyAtc.textContent=current?(available?text.add:text.sold):text.unavailable;
   buy.textContent=text.buy;
   showError(current?'':text.choose);
   if(current){
    const data=meta[current.id];
    setText('[data-price-now]',data.price);
    setText('[data-price-was]',data.compare_at,true);
    setText('[data-price-save]',data.save?'−'+data.save+'%':'',true);
    if(sticky){
     sticky.querySelector('[data-sticky-price]').textContent=data.price;
     const sv=sticky.querySelector('[data-sticky-variant]');if(sv)sv.textContent=current.title||'';
     const st=sticky.querySelector('[data-sticky-thumb]');if(st&&data.media_url)st.src=data.media_url;
    }
    if(move&&data.media_id){const index=slides.findIndex(s=>s.dataset.mediaId===String(data.media_id));if(index>=0)goSlide(index);}
    const url=new URL(location.href);url.searchParams.set('variant',current.id);history.replaceState({},'',url);
   }
   groups.forEach((group,gi)=>group.querySelectorAll('[data-opt-value]').forEach(button=>{
    const trial=[...chosen];trial[gi]=button.dataset.optValue;
    const match=variants.find(v=>trial.every((value,i)=>v.options[i]===value));
    button.dataset.soldout=String(!match?.available);
   }));
   if(move&&!initial)ping('variant_select',{variant:current?.id,title:current?.title});
  };
  groups.forEach(group=>group.addEventListener('click',event=>{
   const button=event.target.closest('[data-opt-value]');if(!button||busy)return;
   group.querySelectorAll('[data-opt-value]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   const label=group.querySelector('[data-color-name]');if(label)label.textContent=button.dataset.optValue.replace(/ 1$/, "").replace(/^./, c=>c.toUpperCase());
   paint(true);
  }));
  groups.forEach(group=>group.querySelector('[data-opt-select]')?.addEventListener('change',()=>paint(true)));
  const normalQuantity=()=>{quantity.value=String(Math.max(1,Math.floor(Number(quantity.value)||1)));};
  root.querySelectorAll('[data-qty-step]').forEach(button=>button.addEventListener('click',()=>{quantity.value=String(Math.max(1,(Number(quantity.value)||1)+Number(button.dataset.qtyStep)));}));
  quantity.addEventListener('change',normalQuantity);
  thumbs.forEach((button,index)=>button.addEventListener('click',()=>goSlide(index)));
  if(track){let frame;track.addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=null;const i=Math.round(track.scrollLeft/track.clientWidth);thumbs.forEach((b,j)=>{b.setAttribute('aria-current',String(i===j));if(i===j){const bar=b.parentElement;bar.scrollTo({left:b.offsetLeft-bar.clientWidth/2+b.clientWidth/2,behavior:'auto'});}});const counter=root.querySelector('[data-gallery-count]');if(counter)counter.textContent=`${i+1} / ${slides.length}`;});},{passive:true});}
  const add = async (checkout, source) => {
   if(busy||!current?.available)return;
   ping(source==='sticky'?'sticky_click':'cta_click',{variant:current.id,checkout:!!checkout});
   normalQuantity();busy=true;showError('');
   [atc,buy,stickyAtc].filter(Boolean).forEach(b=>b.disabled=true);
   atc.querySelector('[data-checkout-label]').textContent=text.adding;
   if(checkout)buy.textContent=text.opening;
   const payload=new FormData(form);
   payload.set('sections','cart-drawer-section');payload.set('sections_url',location.pathname);
   let added=false;
   try{
    const response=await fetch(root.dataset.cartAdd+'.js',{method:'POST',headers:{Accept:'application/json'},body:payload});
    const data=await response.json();
    if(!response.ok)throw new Error(data.description||text.error);
    added=true;
    if(checkout){location.href=(window.Shopify?.routes?.root||'/')+'checkout';return;}
    const html=data.sections?.['cart-drawer-section'];
    if(root.dataset.cartMode==='drawer'&&html){
     const parsed=new DOMParser().parseFromString(html,'text/html');
     const replacement=parsed.getElementById('shopify-section-cart-drawer-section');
     const old=document.getElementById('shopify-section-cart-drawer-section');
     if(replacement&&old){old.replaceWith(replacement);await customElements.whenDefined('theme-drawer');const drawer=document.getElementById('cart-drawer');if(drawer?.open){drawer.open();document.dispatchEvent(new CustomEvent('sc:cart-updated'));return;}}
    }
    location.href=root.dataset.cartUrl;
   }catch(e){
    if(added){location.href=root.dataset.cartUrl;return;}
    busy=false;paint();showError(e.message||text.error);return;
   }finally{if(added){busy=false;paint();}}
  };
  form.addEventListener('submit',e=>{e.preventDefault();add(false)});
  buy.addEventListener('click',()=>add(true));
  stickyAtc?.addEventListener('click',()=>add(false,'sticky'));
  if(sticky&&'IntersectionObserver'in window){
   let onCta=false,onBuy=false,scrolledPast=false;
   const update=()=>{const visible=scrolledPast&&!onCta&&!onBuy;sticky.classList.toggle('is-shown',visible);sticky.setAttribute('aria-hidden',String(!visible));sticky.inert=!visible;};
   new IntersectionObserver(es=>{const e=es[0];onCta=e.isIntersecting;scrolledPast=!e.isIntersecting&&e.boundingClientRect.top<0;update();},{threshold:0}).observe(atc);
   new IntersectionObserver(es=>{onBuy=es[0].isIntersecting;update();},{threshold:0}).observe(buy);
  }
  paint(true);initial=false;
 };
 init();document.addEventListener('shopify:section:load',init);
})();

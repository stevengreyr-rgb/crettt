/* LEZO premium layer. Runs after lezo-studio.js, which renders the page into #app
   (and re-renders it on language change), so everything here is idempotent and is
   re-applied whenever #app's children are replaced. */
(()=>{
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const root=document.documentElement;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const es=()=>root.lang==='es';
const T=(en,s)=>es()?s:en;
const COLORS=[
  {c:'#e0463f',en:'Red',es:'Roja',nm:'630 nm',d:['Deep repair, increase skin elasticity','Reparación profunda, aumenta la elasticidad de la piel']},
  {c:'#3acb68',en:'Green',es:'Verde',nm:'520 nm',d:['Lighten spots, calms the skin','Aclara las manchas, calma la piel']},
  {c:'#3975f2',en:'Blue',es:'Azul',nm:'470 nm',d:['Inhibit bacteria, remove acne','Inhibe las bacterias, elimina el acné']},
  {c:'#a25ada',en:'Purple',es:'Morada',nm:'630 + 470 nm',d:['Repair scar','Repara cicatrices']},
  {c:'#f0c13e',en:'Yellow',es:'Amarilla',nm:'630 + 520 nm',d:['Improve wrinkles, increase immunity','Mejora las arrugas, aumenta la inmunidad']},
  {c:'#26c5ce',en:'Cyan',es:'Cian',nm:'470 + 520 nm',d:['Promote metabolism, control oil','Promueve el metabolismo, controla el brillo']},
  {c:'#f3efe6',en:'White',es:'Blanca',nm:'470 + 520 + 630 nm',d:['Improves fine lines, lighten spots','Mejora las líneas finas, aclara las manchas']}
];
const ICON_PARCEL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>';

/* ---------------- shared scroll loop ---------------- */
let ticking=false,lastY=scrollY,stage=null;
const parallax=[];
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
function frame(){
  ticking=false;
  const y=scrollY,vh=innerHeight,doc=document.documentElement;
  const h=document.querySelector('header');
  if(h&&!reduced){h.classList.toggle('px-hide',y>lastY+4&&y>260&&!document.querySelector('.mobile-nav.open'));if(y<lastY-4||y<260)h.classList.remove('px-hide')}
  lastY=y;
  if(!reduced)for(const el of parallax){
    if(!el.isConnected)continue;
    const box=el.parentElement.getBoundingClientRect();
    if(box.bottom<-100||box.top>vh+100)continue;
    const off=(box.top+box.height/2-vh/2)/vh;
    el.style.setProperty('--py',clamp(off*-34,-34,34).toFixed(1)+'px');
  }
  shipScroll();
}

/* ---------------- reveal tagging ---------------- */
let io=null;
function reveal(el){el.classList.add('in')}
function splitLines(h){
  if(h.dataset.pxSplit||h.querySelector('.px-ln'))return;
  h.dataset.pxSplit='1';
  const parts=h.innerHTML.split(/<br\s*\/?>/i);
  h.classList.add('px-lines');
  h.dataset.rv='lines';
  h.innerHTML=parts.map((p,i)=>`<span class="px-ln" style="--i:${i}"><span>${p}</span></span>`).join('');
}
function decorate(){
  const main=document.getElementById('main');
  if(!main)return;
  root.classList.add('px-motion');
  const lines=main.querySelectorAll('h1,h2:not(.px-keep)');
  lines.forEach(h=>{if(!h.closest('.px-stage'))splitLines(h)});
  const groups={
    fade:'.eyebrow,.hero-copy>p,.hero-price,.hero-copy>.btn,.hero-color-link,.hero-note,.section-head p,.study-intro,.light-invitation,.mode-info>*,.results-copy>*:not(h2),.faq-grid>div:first-child>*:not(h2),.buy-copy>*,.numbered,.step-line,.result-points div,.science-top p,.science-bottom article,.depth-captions article,.depth-heading>*:not(h2),.pdp-ritual-copy>*:not(h2),.pdp-copy>*:not(h1),.ritual-layout>div:last-child>.text-link,.service-band>div,.faq-list details,.trustbar>div,.mode-tabs .swatch,.px-detail__head>*,.px-detail__note,.px-pdp-head>*,.px-chips li,.px-how__note,.px-split__t>*,.px-cards article h3,.px-cards article p,.px-spec__t>*,.px-ship__lede,.px-dates,.px-ship__note,.px-steps li,.px-big',
    img:'.px-fig,.image-frame,.hero-art,.results-photo,.depth-image,.pdp-ritual-photo,.gallery-main'
  };
  const seen=new Map();
  main.querySelectorAll(groups.fade).forEach(el=>{
    if(el.dataset.rv||el.closest('.px-stage')||el.closest('[data-rv="img"]')&&!el.matches('.eyebrow'))return;
    const p=el.parentElement,n=seen.get(p)||0;seen.set(p,n+1);
    el.dataset.rv='1';el.style.setProperty('--d',Math.min(n*70,490)+'ms');
  });
  main.querySelectorAll(groups.img).forEach(el=>{
    if(el.dataset.rv)return;
    el.dataset.rv='img';
    const im=el.querySelector('img');
    if(im&&!parallax.includes(im))parallax.push(im);
  });
  const sb=main.querySelector('.science-bg');
  if(sb&&!parallax.includes(sb)){sb.dataset.pxPar='1';parallax.push(sb)}
  if(!io)io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){reveal(e.target);io.unobserve(e.target)}},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  main.querySelectorAll('[data-rv]').forEach(el=>{if(!el.classList.contains('in'))io.observe(el)});
  // failsafe: never leave content hidden
  setTimeout(()=>main.querySelectorAll('[data-rv]:not(.in)').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight*1.2)reveal(el)}),2600);
}

/* ---------------- hero tilt ---------------- */
function heroTilt(){
  const art=document.querySelector('.hero-art');
  if(!art||art.dataset.pxTilt||!fine||reduced)return;
  art.dataset.pxTilt='1';
  const g=document.createElement('i');g.className='px-glare';art.appendChild(g);
  art.addEventListener('pointermove',e=>{
    const r=art.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    art.style.transform=`rotateY(${(x-.5)*5}deg) rotateX(${(.5-y)*4}deg)`;
    g.style.setProperty('--gx',x*100+'%');g.style.setProperty('--gy',y*100+'%');
  });
  art.addEventListener('pointerleave',()=>{art.style.transform=''});
  art.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';
}
/* magnetic buttons */
function magnetic(){
  if(!fine||reduced)return;
  document.querySelectorAll('.btn:not([data-px-mag])').forEach(b=>{
    b.dataset.pxMag='1';
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.22}px)`});
    b.addEventListener('pointerleave',()=>{b.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';b.style.transform=''});
    b.addEventListener('pointerenter',()=>{b.style.transition='transform .15s'});
  });
}

/* ---------------- marquee ---------------- */
function tabFunctions(){
  document.querySelectorAll('.mode-tabs .swatch:not([data-px-fn])').forEach(b=>{
    const m=COLORS[+b.dataset.mode];if(!m)return;
    b.dataset.pxFn='1';
    b.insertAdjacentHTML('beforeend',`<span class="px-tab-fn">${T(m.d[0],m.d[1])}</span>`);
  });
}
function marquee(){
  const anchor=document.querySelector('main .trustbar')?.closest('.wrap');
  if(!anchor||document.querySelector('.px-marquee'))return;
  const items=[[T('Full-face LED mask','Máscara LED facial'),0],[T('Seven light modes','Siete modos de luz'),4],[T('Adjustable strap','Correa ajustable'),2],[T('Sculpted white shell','Diseño esculpido en blanco'),1],[T('Hands-free','Manos libres'),3],[T('Red to white','Del rojo al blanco'),5]];
  const row=items.map(([s,i])=>`<span style="--c:${COLORS[i].c}">${s}</span>`).join('');
  const m=document.createElement('div');m.className='px-marquee';m.setAttribute('role','presentation');
  m.innerHTML=`<div aria-hidden="true">${row}${row}${row}${row}</div>`;
  const hidden=document.createElement('span');hidden.className='sr-only';hidden.style.cssText='position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
  hidden.textContent=T('Full-face LED mask. Seven light modes. Adjustable strap. Hands-free.','Máscara LED facial. Siete modos de luz. Correa ajustable. Manos libres.');
  m.appendChild(hidden);
  anchor.after(m);
}

/* ---------------- shipping 5–12 ---------------- */
const NODES=[[125,40],[375,90],[625,40],[875,90]];
const ROUTE='M0 90 C60 90 70 40 125 40 S250 90 375 90 S500 40 625 40 S750 90 875 90 S960 60 1000 60';
function fmt(d){return d.toLocaleDateString(es()?'es':'en-US',{day:'numeric',month:'short'}).replace('.','')}
function shipSection(){
  const anchorEl=document.querySelector('.px-journey-slot')||document.querySelector('.px-pdp-slot');
  if(document.getElementById('envio')||!anchorEl||document.querySelector('.care-page'))return;
  const d0=new Date(),a=new Date(d0),b=new Date(d0);a.setDate(a.getDate()+5);b.setDate(b.getDate()+12);
  const s=document.createElement('section');s.className='px-ship wrap section';s.id='envio';s.setAttribute('aria-labelledby','px-ship-title');
  s.innerHTML=`<div class="px-ship__top"><div><span class="eyebrow">07 / ${T('Delivery','Envío')}</span><h2 id="px-ship-title">${T('Order today.<br><em>Open it soon.</em>','Pídela hoy.<br><em>Ábrela pronto.</em>')}</h2><p class="px-ship__lede">${T('Your LEZO should arrive in <b>5 to 12 days</b>. We email you at every step and send tracking details when available, so you always know where it is.','Tu LEZO debería llegar en <b>5 a 12 días</b>. Te escribimos en cada paso y te enviamos el seguimiento cuando esté disponible, para que siempre sepas dónde está.')}</p><div class="px-dates">${ICON_PARCEL.replace('<svg','<svg width="22" height="22"')}<div><span>${T('Order today · estimated arrival','Pide hoy · llegada estimada')}</span><br><strong>${fmt(a)} – ${fmt(b)}</strong></div></div></div><div class="px-big" aria-hidden="true"><span data-count="5">5</span><em>–</em><span data-count="12">12</span><small>${T('days','días')}</small></div></div>
  <ol class="px-steps"><li><b>${T('DAY 0','DÍA 0')}</b><h3>${T('Order confirmed','Pedido confirmado')}</h3><p>${T('Secure Shopify checkout and a confirmation email.','Pago seguro en Shopify y confirmación por correo.')}</p></li><li><b>${T('PREPARING','PREPARACIÓN')}</b><h3>${T('Order prepared','Pedido preparado')}</h3><p>${T('Your LEZO is prepared and handed to the carrier.','Tu LEZO se prepara y se entrega al transportista.')}</p></li><li><b>${T('ON ITS WAY','EN CAMINO')}</b><h3>${T('In transit','En tránsito')}</h3><p>${T('Shipping update by email, with tracking if available.','Aviso de envío por correo, con seguimiento si está disponible.')}</p></li><li><b>${T('DAY 5–12','DÍA 5–12')}</b><h3>${T('At your door','En tu puerta')}</h3><p>${T('Estimated window. 30 days to request a return.','Plazo estimado. 30 días para solicitar devolución.')}</p></li></ol>
  <p class="small px-ship__note">${T('The delivery window is an estimate. Shipping charges and taxes are shown at checkout for your destination.','El plazo de entrega es una estimación. Los gastos de envío e impuestos se muestran al pagar según tu destino.')}</p>`;
  anchorEl.after(s);
}
let shipDone=new Set();
function shipScroll(){
  const s=document.getElementById('envio');if(!s)return;
  const r=s.getBoundingClientRect(),vh=innerHeight;
  const q=clamp((vh*.8-r.top)/(r.height*.75));
  const path=s.querySelector('.fill'),parcel=s.querySelector('.parcel');
  if(path){
    const L=path.getTotalLength();
    path.style.strokeDasharray=L;path.style.strokeDashoffset=L*(1-q);
    const p=path.getPointAtLength(L*q);parcel.setAttribute('cx',p.x);parcel.setAttribute('cy',p.y);
    s.querySelectorAll('circle.n').forEach((c,i)=>c.classList.toggle('on',q>=(i/3)*.97+.02));
  }
  s.querySelectorAll('.px-steps li').forEach((li,i)=>li.classList.toggle('on',q>=(i/3)*.97+.03));
  s.querySelector('.px-steps')?.style.setProperty('--q',q.toFixed(3));
  if(q>.05&&!shipDone.has(s)){shipDone.add(s);s.querySelectorAll('[data-count]').forEach(countUp)}
}
function countUp(el){
  const to=+el.dataset.count;if(reduced){el.textContent=to;return}
  const t0=performance.now(),D=1400;
  const step=t=>{const k=clamp((t-t0)/D),e=1-Math.pow(1-k,4);el.textContent=Math.round(e*to);if(k<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}
function stickyShip(){
  const sm=document.querySelector('.sticky-buy small');
  if(sm&&!sm.querySelector('.px-sticky-ship'))sm.insertAdjacentHTML('beforeend',`<span class="px-sticky-ship">· ${T('Delivery 5–12 days','Entrega 5–12 días')}</span>`);
}

/* ---------------- rotating product viewer (real-photo turntable) ---------------- */
const PXA=window.LEZO_PX||{};
const TURN_URL=PXA.turn||'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-turn-360-led.mp4?v=1792904416',TURN_POSTER=PXA.poster||'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-turn-poster-2.webp?v=1792904415',INSIDE_IMG='https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-inside-hd.webp?v=1792905330';
const HUE={0:0,1:126,2:211,3:271,4:44,5:181,6:0};   // hue-rotate from the red glow of the product photo
const FILTER=i=>i===6?'saturate(.1) brightness(1.28)':`hue-rotate(${HUE[i]}deg)`;
function stageMarkup(){
  const sw=COLORS.map((m,i)=>`<button type="button" style="--sw:${m.c}" data-px-mode="${i}" aria-pressed="${i===0}" aria-label="${T(m.en,m.es)}"><i></i></button>`).join('');
  const pdp=location.pathname.includes('/products/');
  const price=typeof priceMarkup==='function'?priceMarkup():'';
  return `<div class="px-stage__sticky">
    <div class="px-stage__bg"></div><canvas class="px-dust" aria-hidden="true"></canvas>
    ${pdp?`    <div class="px-copy"><span class="eyebrow">${T('360° view','Vista 360°')}</span>
      <h2 class="px-h1">${T('Turn it.<br><em>Light it.</em>','Gírala.<br><em>Enciéndela.</em>')}</h2>
      <p>${T('Drag the mask to spin it. Pick a color to change the light, or look inside to see the LEDs.','Arrastra la máscara para girarla. Elige un color para cambiar la luz o mira dentro para ver los LEDs.')}</p>
    </div>
`:`    <div class="px-copy"><span class="eyebrow">${T('The 7-color LED mask','La máscara LED de 7 colores')}</span>
      <h1 class="px-h1">${T('The mask that<br>glows <em>seven ways.</em>','La máscara que<br>brilla de <em>siete formas.</em>')}</h1>
      <p>${T('A full-face LED mask with seven light modes and an adjustable strap. Put it on, choose a color and keep your hands free.','Una máscara LED de rostro completo con siete modos de luz y correa ajustable. Póntela, elige un color y deja las manos libres.')}</p>
      <div class="hero-price">${price}</div>
      <div class="px-cta"><a class="btn" href="${pdp?'#product-buy':'/products/lezo-7-color-led-face-mask'}">${T('Buy LEZO','Comprar LEZO')}<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 12h17m-6-6 6 6-6 6"/></svg></a><button type="button" class="text-link" data-px-tutorial>${T('How to use · 5 steps','Cómo usarla · 5 pasos')}</button></div>
      <div class="hero-note">${ICON_PARCEL}${T('Arrives in 5–12 days','Llega en 5–12 días')}</div>
    </div>
    `}
    <div class="px-right">
      <div class="px-view" data-view="out">
        <video class="px-turn" muted playsinline loop preload="none" poster="${TURN_POSTER}" aria-label="${T('360° view of the LEZO mask. Drag to rotate.','Vista 360° de la máscara LEZO. Arrastra para girarla.')}"></video>
        <img class="px-inside-img" src="${INSIDE_IMG}" alt="${T('Inside of the LEZO mask with the LED array lit','Interior de la máscara LEZO con la matriz de LEDs encendida')}" width="766" height="620" loading="lazy">
        <button type="button" class="px-tap" data-px-tap>${T('Tap to rotate','Toca para girar')}</button>
      </div>
      <div class="px-ctl">
        <div class="px-swatches" role="group" aria-label="${T('Choose a light mode','Elige un modo de luz')}">${sw}</div>
        <div class="px-mode" aria-live="polite"><div class="px-mode-idx"></div><div class="px-mode-name"></div><div class="px-mode-nm"></div><div class="px-mode-desc"></div></div>
        <div class="px-meta"><button type="button" class="px-inside" data-px-inside aria-pressed="false">${T('See inside · LEDs','Ver por dentro · LEDs')}</button><button type="button" class="px-pause" data-px-pause aria-pressed="false">${T('Pause','Pausa')}</button><span class="px-hint"><b>↔</b>${T('Drag to rotate','Arrastra para girar')}</span></div>
      </div>
    </div>
  </div>`;
}
class Stage{
  constructor(el){
    this.el=el;this.v=el.querySelector('.px-turn');this.view=el.querySelector('.px-view');
    this.idx=-1;this.userPicked=false;this.visible=false;this.dragging=false;this.resume=0;this.inside=false;this.paused=false;
    el.querySelectorAll('[data-px-mode]').forEach(b=>b.addEventListener('click',()=>{this.userPicked=true;this.setMode(+b.dataset.pxMode)}));
    el.querySelector('[data-px-inside]').addEventListener('click',e=>this.toggleInside(e.currentTarget));
    el.querySelector('[data-px-tap]').addEventListener('click',()=>{this.paused=false;this.play()});
    el.querySelector('[data-px-pause]').addEventListener('click',e=>{this.paused=!this.paused;e.currentTarget.setAttribute('aria-pressed',this.paused);e.currentTarget.textContent=this.paused?T('Play','Reproducir'):T('Pause','Pausa');this.paused?this.v.pause():this.play()});
    this.setMode(0);this.dust();
    this.cycle=setInterval(()=>{if(!this.userPicked&&this.visible&&!document.hidden&&!reduced)this.setMode((this.idx+1)%COLORS.length)},5200);
    this.io=new IntersectionObserver(e=>{this.visible=e[0].isIntersecting;root.classList.toggle('px-in-stage',this.visible);if(this.visible&&!this.loaded)this.load();this.visible?this.play():this.v.pause()},{rootMargin:'400px'});
    this.io.observe(el);this.bind();
  }
  load(){
    this.loaded=true;const v=this.v;
    v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('webkit-playsinline','');v.preload='auto';
    v.addEventListener('loadeddata',()=>{this.el.classList.add('is-live');this.play()},{once:true});
    v.addEventListener('error',()=>this.el.classList.add('no-video'),{once:true});
    v.src=TURN_URL;v.load();
  }
  play(){
    if(!this.loaded||this.dragging||this.inside||this.paused||performance.now()<this.resume)return;
    const pr=this.v.play();
    if(pr&&pr.then)pr.then(()=>this.el.classList.remove('needs-tap')).catch(()=>this.el.classList.add('needs-tap'));
  }
  bind(){
    const v=this.v,view=this.view;let x0=0,t0=0,id=null;
    view.addEventListener('pointerdown',e=>{if(this.inside||!this.loaded)return;id=e.pointerId;view.setPointerCapture(id);this.dragging=true;v.pause();x0=e.clientX;t0=v.currentTime});
    view.addEventListener('pointermove',e=>{if(!this.dragging||e.pointerId!==id)return;const d=v.duration||6,w=view.clientWidth;let t=(t0+(e.clientX-x0)/w*d*1.25)%d;if(t<0)t+=d;v.currentTime=t});
    const up=()=>{if(!this.dragging)return;this.dragging=false;id=null;this.resume=performance.now()+1500;setTimeout(()=>this.play(),1550)};
    view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
    this.v.addEventListener('timeupdate',()=>{});
  }
  dust(){
    const c=this.el.querySelector('.px-dust');if(!c||reduced)return;const g=c.getContext('2d');
    const N=34,P=Array.from({length:N},()=>({x:Math.random(),y:Math.random(),r:.35+Math.random()*.9,v:.02+Math.random()*.05,o:Math.random()*6}));
    let w=0,h=0;const fit=()=>{const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio,2);w=c.width=r.width*d;h=c.height=r.height*d};fit();addEventListener('resize',fit);
    const loop=t=>{
      if(!this.el.isConnected)return;requestAnimationFrame(loop);
      if(!this.visible||document.hidden)return;
      g.clearRect(0,0,w,h);const col=getComputedStyle(this.el).getPropertyValue('--px-c').trim()||'#e0463f';
      for(const p of P){p.y-=p.v/60;if(p.y<-.05){p.y=1.05;p.x=Math.random()}
        const x=(p.x+Math.sin(t/2200+p.o)*.012)*w,y=p.y*h,a=.22+Math.sin(t/900+p.o)*.12;
        const gr=g.createRadialGradient(x,y,0,x,y,p.r*5*(w/1400+.6));gr.addColorStop(0,col+'');g.globalAlpha=Math.max(0,a);g.fillStyle=gr;g.beginPath();g.arc(x,y,p.r*5*(w/1400+.6),0,7);g.fill()}
      g.globalAlpha=1;
    };requestAnimationFrame(loop);
  }
  toggleInside(btn){
    this.inside=!this.inside;this.view.dataset.view=this.inside?'in':'out';
    btn.setAttribute('aria-pressed',this.inside);btn.textContent=this.inside?T('Back to outside','Volver al exterior'):T('See inside · LEDs','Ver por dentro · LEDs');
    this.inside?this.v.pause():this.play();
  }
  setMode(i){
    if(i===this.idx)return;
    const first=this.idx===-1;this.idx=i;const m=COLORS[i];
    this.el.style.setProperty('--px-c',m.c==='#f3efe6'?'#cfc6b8':m.c);
    this.el.style.setProperty('--px-f',FILTER(i));
    this.el.querySelectorAll('[data-px-mode]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.pxMode===i));
    const box=this.el.querySelector('.px-mode');
    box.querySelector('.px-mode-idx').textContent=`0${i+1} / 07`;
    box.querySelector('.px-mode-name').innerHTML=es()?`Luz <i>${m.es.toLowerCase()}</i>`:`<i>${m.en}</i> light`;
    box.querySelector('.px-mode-nm').textContent=m.nm;
    box.querySelector('.px-mode-desc').textContent=T(m.d[0],m.d[1]);
    if(!first){box.classList.remove('px-swap');void box.offsetWidth;box.classList.add('px-swap')}
  }
  dispose(){clearInterval(this.cycle);this.io?.disconnect();this.v.pause();this.v.removeAttribute('src');this.v.load()}
}
const DETAIL={inside:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-inside-hd.webp?v=1792905330',macro:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-macro-hd.webp?v=1792905330',strap:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-strap-hd.webp?v=1792905330'};
function detailSection(){
  const stageEl=document.querySelector('.px-marquee')||document.querySelector('.px-stage');
  if(!stageEl||document.getElementById('por-dentro')||document.querySelector('.care-page'))return;
  const s=document.createElement('section');s.className='px-detail wrap section';s.id='por-dentro';
  s.innerHTML=`<div class="px-detail__head"><div><span class="eyebrow">${T('Inside the mask','Por dentro')}</span><h2>${T('The light is<br><em>on the inside.</em>','La luz está<br><em>por dentro.</em>')}</h2></div><p>${T('LEDs spread across the whole inner face, so the light wraps around you. An adjustable strap with a buckle keeps your hands free to do whatever you like.','LEDs repartidos por toda la cara interior, para que la luz te envuelva. Una correa ajustable con hebilla te deja las manos libres para hacer lo que quieras.')}</p></div>
  <div class="px-detail__grid">
    <figure class="px-fig px-zoomable px-fig--big"><img src="${DETAIL.inside}" alt="${T('Inside of the LEZO mask with the LED array lit','Interior de la máscara LEZO con la matriz de LEDs encendida')}" width="766" height="620" loading="lazy"><figcaption><b>01</b>${T('Light all around your face','Luz por todo tu rostro')}</figcaption></figure>
    <figure class="px-fig px-zoomable"><img data-full="${DETAIL.macro}" src="${DETAIL.macro}" alt="${T('Close-up of the individual LEDs','Detalle de los LEDs individuales')}" width="570" height="399" loading="lazy"><figcaption><b>02</b>${T('Every LED, up close','Cada LED, de cerca')}</figcaption></figure>
    <figure class="px-fig px-zoomable"><img data-full="${DETAIL.strap}" src="${DETAIL.strap}" alt="${T('Adjustable strap with buckle','Correa ajustable con hebilla')}" width="495" height="399" loading="lazy"><figcaption><b>03</b>${T('Adjustable strap, hands free','Correa ajustable, manos libres')}</figcaption></figure>
  </div>
  <p class="small px-detail__note">${T('Illustrative reference images. Colors and LED layout are approximate.','Imágenes ilustrativas de referencia. Los colores y la distribución de los LEDs son aproximados.')}</p>`;
  stageEl.after(s);
}
function stageInit(){
  const main=document.getElementById('main');
  if(!main||document.querySelector('.px-stage')||document.querySelector('.care-page'))return;
  const pdp=location.pathname.includes('/products/');
  const sec=document.createElement('section');sec.className='px-stage';sec.id='mask3d';sec.setAttribute('aria-label',T('360° view of the mask','Vista 360° de la máscara'));
  sec.innerHTML=stageMarkup();
  if(pdp){const anchor=document.querySelector('main .product-page');if(!anchor)return;(anchor.nextElementSibling&&anchor.nextElementSibling.tagName==='DIV'&&!anchor.nextElementSibling.className?anchor.nextElementSibling:anchor).after(sec)}
  else main.prepend(sec);
  stage=new Stage(sec);
}

/* ---------------- how-to-use tutorial (5 steps) ---------------- */
const TUT_IMG=['https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-step-1.webp?v=1792905330','https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-step-2.webp?v=1792905330','https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-step-3.webp?v=1792905330','https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-step-4.webp?v=1792905330','https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-step-5.webp?v=1792905330'];
function tutSteps(){return [
  {k:T('Cleanse','Limpia'),h:T('Start with a bare, clean face','Empieza con la cara limpia y sin maquillaje'),
   p:T('Wash with your usual cleanser and take off all makeup and sunscreen. Rinse with lukewarm water.','Lávate con tu limpiador habitual y quita todo el maquillaje y el protector solar. Enjuaga con agua tibia.'),
   c:[T('Makeup and sunscreen removed','Maquillaje y protector solar retirados'),T('Face rinsed with lukewarm water','Rostro enjuagado con agua tibia')],
   tip:T('Nothing should sit between the mask and your skin.','Nada debe quedar entre la máscara y tu piel.')},
  {k:T('Dry and prepare','Seca y prepara'),h:T('Dry off, clear the space, read the notes','Sécate, despeja y lee las indicaciones'),
   p:T('Pat your face dry with a clean towel. Tie your hair back and take off earrings, glasses and anything that could press under the strap. Read the safety and eye-protection notes in the manual.','Sécate con una toalla limpia. Recoge el cabello y quítate aretes, lentes y todo lo que pueda presionar bajo la correa. Lee las notas de seguridad y protección ocular del manual.'),
   c:[T('Face completely dry','Rostro completamente seco'),T('Hair tied back, accessories off','Cabello recogido, accesorios fuera'),T('Manual and eye-protection notes read','Manual y notas de protección ocular leídos')],
   tip:T('Sit somewhere comfortable with the mask and its controls within reach.','Siéntate en un lugar cómodo con la máscara y sus controles al alcance.')},
  {k:T('Fit the mask','Colócala'),h:T('Line up the openings, fasten the strap','Alinea las aberturas y ajusta la correa'),
   p:T('Hold the mask by its edges and bring it to your face. Match the openings to your eyes, nose and mouth, then pull the strap around the back of your head and fasten it.','Sostén la máscara por los bordes y llévala a tu rostro. Haz coincidir las aberturas con ojos, nariz y boca, rodea la nuca con la correa y ábrochala.'),
   c:[T('Openings aligned with eyes, nose and mouth','Aberturas alineadas con ojos, nariz y boca'),T('Strap snug but comfortable','Correa firme pero cómoda')],
   tip:T('If it presses anywhere, loosen the strap one notch.','Si presiona en algún punto, afloja la correa un ajuste.')},
  {k:T('Choose a light','Elige la luz'),h:T('Switch on and pick one of seven modes','Enciende y elige uno de los siete modos'),
   p:T('Turn the mask on and select a mode: red, green, blue, purple, yellow, cyan or white. Sit back or recline and keep to the session time given in the manual.','Enciende la máscara y selecciona un modo: rojo, verde, azul, morado, amarillo, cian o blanco. Recuéstate o relájate y respeta el tiempo de sesión que indica el manual.'),
   c:[T('Mode selected','Modo seleccionado'),T('Session length follows the manual','Duración de la sesión según el manual')],
   tip:T('Tap a color below to preview how the light looks.','Toca un color para ver cómo se ve la luz.'),pick:true},
  {k:T('Finish and care','Termina y cuida'),h:T('Switch off, wipe down, store','Apaga, limpia y guarda'),
   p:T('Switch the mask off and undo the strap. Wipe the inside with a soft dry cloth, or as the manual directs, and store it somewhere clean and dry. Apply your usual skincare afterwards if you like.','Apaga la máscara y suelta la correa. Limpia el interior con un paño suave y seco, o como indique el manual, y guárdala en un lugar limpio y seco. Aplica después tu cuidado de piel habitual si lo deseas.'),
   c:[T('Mask switched off','Máscara apagada'),T('Inside wiped and stored','Interior limpio y guardado')],
   tip:T('Stop use and consult a professional if you notice irritation.','Deja de usarla y consulta a un profesional si notas irritación.')}
]}
function buildTutorial(slot){
  const dlg=slot.closest('dialog');
  const S=tutSteps(),N=S.length,total=S.reduce((a,x)=>a+x.c.length,0);
  let cur=0,auto=true,done=new Set(),color=0;
  const sw=COLORS.map((m,i)=>`<button type="button" class="px-tut__sw" data-sw="${i}" style="--sw:${m.c}" aria-pressed="${i===0}" aria-label="${T(m.en,m.es)}"><i></i></button>`).join('');
  slot.innerHTML=`<div class="px-tut__head"><div><span class="eyebrow">${T('How to use','Cómo usarla')}</span><h2 id="px-tutd-t">${T('Five steps,<br><em>start to finish.</em>','Cinco pasos,<br><em>de principio a fin.</em>')}</h2></div><p>${T('Follow them in order the first time. Details that depend on your exact model, such as session length, are in the manufacturer’s manual.','Síguelos en orden la primera vez. Lo que depende de tu modelo exacto, como la duración de la sesión, está en el manual del fabricante.')}</p></div>
  <div class="px-tut__grid">
    <div class="px-tut__stage" aria-live="polite">
      <div class="px-tut__bar" aria-hidden="true">${S.map(()=>'<i><b></b></i>').join('')}</div>
      ${S.map((x,i)=>`<figure class="px-tut__ph${i===0?' on':''}" data-ph="${i}"><img src="${TUT_IMG[i]}" alt="${T('Step','Paso')} ${i+1}: ${x.k}" width="1200" height="1500" ${i===0?'':'loading="lazy"'}></figure>`).join('')}
      <div class="px-tut__cap"><span class="px-tut__n">01<small>/0${N}</small></span><span class="px-tut__k">${S[0].k}</span></div>
      <button type="button" class="px-tut__nav px-tut__nav--prev" aria-label="${T('Previous step','Paso anterior')}">←</button>
      <button type="button" class="px-tut__nav px-tut__nav--next" aria-label="${T('Next step','Paso siguiente')}">→</button>
    </div>
    <ol class="px-tut__list">${S.map((x,i)=>`<li class="px-tut__item${i===0?' on':''}" data-i="${i}">
      <button type="button" class="px-tut__btn" aria-expanded="${i===0}" aria-controls="px-tut-p${i}" id="px-tut-b${i}"><span class="px-tut__num">0${i+1}</span><span class="px-tut__t"><b>${x.k}</b><small>${x.h}</small></span><span class="px-tut__plus" aria-hidden="true"></span></button>
      <div class="px-tut__panel" id="px-tut-p${i}" role="region" aria-labelledby="px-tut-b${i}"><div>
        <p>${x.p}</p>
        ${x.pick?`<div class="px-tut__pick"><div class="px-tut__sws" role="group" aria-label="${T('Preview a light mode','Previsualiza un modo de luz')}">${sw}</div><span class="px-tut__pname">${T(COLORS[0].en,COLORS[0].es)} · ${COLORS[0].nm}</span></div>`:''}
        <ul class="px-tut__checks">${x.c.map((c,j)=>`<li><label><input type="checkbox" data-ck="${i}-${j}"><span class="px-tut__box" aria-hidden="true"></span><span>${c}</span></label></li>`).join('')}</ul>
        <p class="px-tut__tip"><b>${T('Tip','Consejo')}</b>${x.tip}</p>
      </div></div></li>`).join('')}</ol>
  </div>
  <div class="px-tut__foot"><div class="px-tut__meter" role="status"><span class="px-tut__count">0 / ${total}</span><i><b></b></i><span class="px-tut__msg">${T('Tick each check as you go.','Marca cada punto a medida que avanzas.')}</span></div>
    <p class="small">${T('Eye protection, session length and care follow the manufacturer’s instructions.','La protección ocular, la duración de la sesión y el cuidado siguen las instrucciones del fabricante.')}</p></div>`;
  const q=a=>slot.querySelector(a),qa=a=>[...slot.querySelectorAll(a)];
  const items=qa('.px-tut__item'),phs=qa('.px-tut__ph'),segs=qa('.px-tut__bar i b');
  function show(i,user){
    cur=(i+N)%N;
    items.forEach((el,k)=>{const on=k===cur;el.classList.toggle('on',on);el.querySelector('.px-tut__btn').setAttribute('aria-expanded',on)});
    phs.forEach((el,k)=>el.classList.toggle('on',k===cur));
    q('.px-tut__n').innerHTML=`0${cur+1}<small>/0${N}</small>`;q('.px-tut__k').textContent=S[cur].k;
    segs.forEach((b,k)=>{b.style.transform=`scaleX(${k<=cur?1:0})`});
    if(user)auto=false;
  }
  function setColor(i){color=i;const m=COLORS[i];slot.style.setProperty('--tc',m.c);slot.style.setProperty('--tf',FILTER(i));
    qa('.px-tut__sw').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.sw===i));
    q('.px-tut__pname').textContent=`${T(m.en,m.es)} · ${m.nm}`}
  function meter(){
    const n=done.size;q('.px-tut__count').textContent=`${n} / ${total}`;
    q('.px-tut__meter b').style.transform=`scaleX(${n/total})`;
    q('.px-tut__msg').textContent=n===total?T('All set. Switch on and enjoy the session.','Todo listo. Enciende la máscara y disfruta la sesión.'):T('Tick each check as you go.','Marca cada punto a medida que avanzas.');
    slot.classList.toggle('is-done',n===total);
  }
  slot.addEventListener('click',e=>{
    const b=e.target.closest('.px-tut__btn');if(b){show(+b.closest('.px-tut__item').dataset.i,true);return}
    if(e.target.closest('.px-tut__nav--next')){show(cur+1,true);return}
    if(e.target.closest('.px-tut__nav--prev')){show(cur-1,true);return}
    const w=e.target.closest('.px-tut__sw');if(w){auto=false;setColor(+w.dataset.sw)}
  });
  slot.addEventListener('change',e=>{const c=e.target.closest('[data-ck]');if(!c)return;c.checked?done.add(c.dataset.ck):done.delete(c.dataset.ck);meter()});
  slot.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'){if(e.target.closest('.px-tut__btn,.px-tut__nav')){e.preventDefault();show(cur+1,true)}}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){if(e.target.closest('.px-tut__btn,.px-tut__nav')){e.preventDefault();show(cur-1,true)}}});
  // swipe on the photo
  let x0=null;const st=q('.px-tut__stage');
  st.addEventListener('pointerdown',e=>{x0=e.clientX});
  st.addEventListener('pointerup',e=>{if(x0===null)return;const d=e.clientX-x0;x0=null;if(Math.abs(d)>50&&!e.target.closest('button'))show(cur+(d<0?1:-1),true)});
  let vis=true,hover=false;
  const tick=setInterval(()=>{
    if(!slot.isConnected){clearInterval(tick);return}
    if(!auto||!dlg.open||hover||document.hidden)return;
    show(cur+1,false);                         // a new image every 2 seconds
  },2000);
  slot.style.setProperty('--tc',COLORS[0].c);
  show(0,false);meter();
}


/* ---------------- new imagery: home sections + product-page sections ---------------- */
const IMG={sci:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-sci.webp?v=1792906151',res:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-res.webp?v=1792906151',box:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-box.webp?v=1792906151',modes:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-modes.webp?v=1792906151',lining:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-lining.webp?v=1792906151',strap:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-strap.webp?v=1792906151',shell:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-shell.webp?v=1792906151',profile:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-profile.webp?v=1792906151',back:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-back.webp?v=1792906151',rim:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-rim.webp?v=1792906151'};
function fig(src,alt,w,h,cls='',cap=''){return `<figure class="px-fig px-zoomable ${cls}" style="aspect-ratio:${w}/${h}"><img src="${src}" alt="${alt}" width="${w}" height="${h}" loading="lazy" data-full="${src}">${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`}
function homeImages(){
  const sci=document.querySelector('.science .wrap');
  if(sci&&!sci.querySelector('.px-sci-fig')){
    const bottom=sci.querySelector('.science-bottom');
    if(bottom)bottom.insertAdjacentHTML('beforebegin',fig(IMG.sci,T('Macro of the LED lenses inside the mask','Macro de los LEDs dentro de la máscara'),1792,1008,'px-sci-fig',`<b>01</b>${T('A single LED lens, magnified','Un solo LED, ampliado')}`));
  }
  const rc=document.querySelector('.results-copy');
  if(rc&&!rc.querySelector('.px-res-fig'))rc.insertAdjacentHTML('beforeend',fig(IMG.res,T('The LEZO mask, three-quarter view','La máscara LEZO, vista tres cuartos'),1432,1792,'px-res-fig'));
  const ship=document.getElementById('envio');
  if(ship&&!ship.querySelector('.px-box-fig')){
    const note=ship.querySelector('.px-ship__note');
    if(note)note.insertAdjacentHTML('beforebegin',fig(IMG.box,T('The LEZO mask in its white box','La máscara LEZO en su caja blanca'),2016,864,'px-box-fig',`<b>→</b>${T('Packed in a plain white box','Empacada en una caja blanca lisa')}`));
  }
}
function pdpSections(){
  const slot=document.querySelector('.px-pdp-slot');
  if(!slot||slot.dataset.pxDone)return;slot.dataset.pxDone='1';
  const chips=[[0,'630'],[1,'520'],[2,'470'],[3,'630 + 470'],[4,'630 + 520'],[5,'470 + 520'],[6,'470 + 520 + 630']].map(([i,nm])=>`<li style="--c:${COLORS[i].c}"><i></i><b>${T(COLORS[i].en,COLORS[i].es)}</b><span>${nm} nm</span></li>`).join('');
  const spec=[[T('Format','Formato'),T('Full-face LED mask','Máscara LED facial completa')],[T('Light modes','Modos de luz'),T('7 built in','7 integrados')],[T('Channels','Canales'),T('630 nm red · 520 nm green · 470 nm blue ','630 nm rojo · 520 nm verde · 470 nm azul ')],[T('Fit','Ajuste'),T('Adjustable strap with buckle','Correa ajustable con hebilla')],[T('Finish','Acabado'),T('Sculpted glossy white','Blanco esculpido y brillante')],[T('Returns','Devoluciones'),T('30 days from delivery','30 días desde la entrega')],[T('Delivery','Entrega'),T('Estimated 5–12 days','Estimada de 5 a 12 días')]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('');
  slot.innerHTML=`<section class="px-how wrap section" id="como-funciona">
    <div class="px-pdp-head"><div><span class="eyebrow">${T('How it works','Funcionamiento')}</span><h2>${T('Seven lights,<br><em>one device.</em>','Siete luces,<br><em>un solo equipo.</em>')}</h2></div><p>${T('Red, green and blue LED channels combine into seven modes. Pick one and the whole inner face of the mask lights up in that color.','Los canales LED rojo, verde y azul se combinan en siete modos. Elige uno y toda la cara interior de la máscara se ilumina de ese color.')}</p></div>
    ${fig(IMG.modes,T('Seven LEZO masks, each lit in a different color','Siete máscaras LEZO, cada una encendida en un color distinto'),1792,1008,'px-wide')}
    <ul class="px-chips" aria-label="${T('Light modes and wavelengths','Modos de luz y longitudes de onda')}">${chips}</ul>
    <div class="px-split">${fig(IMG.lining,T('Close-up of the LED lining inside the mask','Detalle del forro de LEDs dentro de la máscara'),1536,1152)}<div class="px-split__t"><span class="eyebrow">01 / ${T('The light','La luz')}</span><h3>${T('LEDs across the whole inner face','LEDs por toda la cara interior')}</h3><p>${T('Staggered rows of LED lenses line the inside of the shell, with cut-outs for the eyes, nose and mouth, so the light reaches the whole face.','Filas escalonadas de LEDs recubren el interior de la carcasa, con aberturas para ojos, nariz y boca, para que la luz llegue a todo el rostro.')}</p></div></div>
    <div class="px-split px-split--r"><div class="px-split__t"><span class="eyebrow">02 / ${T('The fit','El ajuste')}</span><h3>${T('An adjustable strap, hands free','Una correa ajustable, manos libres')}</h3><p>${T('A woven strap with a buckle wraps around the back of the head. Adjust it once, then sit back and leave your hands free.','Una correa tejida con hebilla rodea la nuca. Ajústala una vez y quedan las manos libres.')}</p></div>${fig(IMG.back,T('The strap fastened at the back, shown on a mannequin','La correa abrochada por detrás, sobre un maniquí'),1432,1792)}</div>
    ${fig(IMGU.d,T('A model in profile on a white treatment bed wearing the LEZO mask lit purple','Una modelo de perfil en una camilla blanca con la máscara LEZO encendida en morado'),2688,1520,'px-use-wide')}
    <div class="px-split" id="en-uso"><div class="px-split__t"><span class="eyebrow">03 / ${T('In use','En uso')}</span><h3>${T('Lie back and switch on','Recuéstate y enciende')}</h3><p>${T('Recline on a bed or a lounger, choose a mode and follow the session time given in the manufacturer’s instructions.','Recuéstate en una cama o un sillón, elige un modo y respeta el tiempo de sesión de las instrucciones del fabricante.')}</p></div>${fig(IMGU.c,T('Overhead view of a model reclined on a white treatment bed with the mask lit green','Vista cenital de una modelo recostada en una camilla blanca con la máscara encendida en verde'),1792,2240)}</div>
  </section>
  <section class="px-qual wrap section" id="calidad">
    <div class="px-pdp-head"><div><span class="eyebrow">${T('Build quality','Calidad')}</span><h2>${T('Details you can<br><em>see up close.</em>','Detalles que se<br><em>ven de cerca.</em>')}</h2></div><p>${T('Tap any image to zoom in.','Toca cualquier imagen para ampliarla.')}</p></div>
    <div class="px-cards">
      <article>${fig(IMG.shell,T('Macro of the glossy white shell','Macro de la carcasa blanca brillante'),1536,1152)}<h3>${T('Sculpted glossy shell','Carcasa esculpida y brillante')}</h3><p>${T('A smooth, sculpted white shell with a glossy finish.','Una carcasa blanca esculpida, lisa y de acabado brillante.')}</p></article>
      <article>${fig(IMG.strap,T('Macro of the woven strap and buckle','Macro de la correa tejida y la hebilla'),1536,1152)}<h3>${T('Woven strap, secure buckle','Correa tejida, hebilla segura')}</h3><p>${T('A textured fabric strap with a buckle for quick, repeatable adjustment.','Una correa de tela texturizada con hebilla para ajustarla rápido y siempre igual.')}</p></article>
      <article>${fig(IMG.rim,T('Macro of an eye opening with a soft glowing rim','Macro de una abertura de ojo con un borde luminoso suave'),1536,1152)}<h3>${T('Clean-cut openings','Aberturas bien recortadas')}</h3><p>${T('Precisely cut openings for the eyes, nose and mouth, with a soft light along the edge.','Aberturas recortadas con precisión para ojos, nariz y boca, con una luz suave en el borde.')}</p></article>
    </div>
    <div class="px-spec">${fig(IMG.profile,T('Side profile of the LEZO mask','Perfil de la máscara LEZO'),1432,1792,'px-spec__img')}<div class="px-spec__t"><span class="eyebrow">${T('Specifications','Especificaciones')}</span><h3>${T('At a glance','De un vistazo')}</h3><div class="px-spec__list">${spec}</div></div></div>
  </section>`;
}
/* click-to-zoom on detail images */
let zoomDlg=null;
function zoomInit(){
  document.addEventListener('click',e=>{
    const f=e.target.closest?.('.px-zoomable');if(!f||e.target.closest('dialog'))return;
    const im=f.querySelector('img');if(!im)return;
    if(!zoomDlg){
      zoomDlg=document.createElement('dialog');zoomDlg.className='px-zoom';zoomDlg.setAttribute('aria-label',T('Zoomed image','Imagen ampliada'));
      zoomDlg.innerHTML=`<button type="button" class="px-back px-zoom__b" data-px-close>${back()}</button><button type="button" class="px-zoom__x" aria-label="${T('Close','Cerrar')}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button><div class="px-zoom__stage"><img alt=""></div><p class="px-zoom__hint">${T('Click to zoom · move to pan','Clic para ampliar · mueve para recorrer')}</p>`;
      document.body.appendChild(zoomDlg);
      const st=zoomDlg.querySelector('.px-zoom__stage'),zi=st.querySelector('img');
      zoomDlg.querySelectorAll('.px-zoom__x,[data-px-close]').forEach(b=>b.addEventListener('click',()=>zoomDlg.close()));
      zoomDlg.addEventListener('click',e=>{if(e.target===zoomDlg)zoomDlg.close()});
      st.addEventListener('click',()=>st.classList.toggle('z2'));
      st.addEventListener('pointermove',e=>{if(!st.classList.contains('z2'))return;const r=st.getBoundingClientRect();zi.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`});
      zoomDlg.addEventListener('close',()=>{st.classList.remove('z2');root.classList.remove('px-lock')});
    }
    const zi=zoomDlg.querySelector('img');zi.src=im.dataset.full||im.currentSrc||im.src;zi.alt=im.alt;
    root.classList.add('px-lock');zoomDlg.showModal();
  });
}
zoomInit();


/* ---------------- home: the visual journey (what you are buying, chapter by chapter) ---------------- */
const IMGU={a:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-u-a.webp?v=1792907341',b:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-u-b.webp?v=1792907341',c:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-u-c.webp?v=1792907341',d:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-u-d.webp?v=1792907341'};
const IMGH={green:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-hg.webp?v=1792906273',blue:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-hb.webp?v=1792906273',purple:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-hp.webp?v=1792906273',fit:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-n-hf.webp?v=1792906273'};
function chHead(n,label,title,lede){return `<div class="px-ch__h"><span class="px-ch__n" aria-hidden="true">${n}</span><div><span class="eyebrow">${n} / ${label}</span><h2>${title}</h2></div>${lede?`<p>${lede}</p>`:''}</div>`}
function journey(){
  const slot=document.querySelector('.px-journey-slot');
  if(!slot||slot.dataset.pxDone||document.querySelector('.care-page'))return;slot.dataset.pxDone='1';
  const chips=[[0,'630'],[1,'520'],[2,'470'],[3,'630 + 470'],[4,'630 + 520'],[5,'470 + 520'],[6,'470 + 520 + 630']].map(([i,nm])=>`<li style="--c:${COLORS[i].c}"><i></i><b>${T(COLORS[i].en,COLORS[i].es)}</b><span>${nm} nm</span></li>`).join('');
  const facts=[[T('Format','Formato'),T('Full-face LED mask','Máscara LED facial completa')],[T('Light modes','Modos de luz'),T('7 built in','7 integrados')],[T('Fit','Ajuste'),T('Adjustable strap with buckle','Correa ajustable con hebilla')],[T('Finish','Acabado'),T('Sculpted glossy white','Blanco esculpido y brillante')]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('');
  const D=DETAIL;
  slot.innerHTML=`
  <section class="px-ch wrap section" id="la-mascara">
    ${chHead('01',T('The mask','La máscara'),T('Everything you are getting,<br><em>in one mask.</em>','Todo lo que recibes,<br><em>en una sola máscara.</em>'),T('LEZO is a full-face LED mask with an adjustable strap. Follow the next few sections to see how it looks, how it lights up and what arrives at your door.','LEZO es una máscara LED facial con correa ajustable. Recorre las siguientes secciones para ver cómo es, cómo se enciende y qué llega a tu puerta.'))}
    <div class="px-split">${fig(IMG.res,T('The LEZO mask, three-quarter view','La máscara LEZO, vista tres cuartos'),1600,2000)}<div class="px-split__t"><div class="px-spec__list">${facts}</div><a class="btn" href="/products/lezo-7-color-led-face-mask">${T('Buy LEZO','Comprar LEZO')}<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 12h17m-6-6 6 6-6 6"/></svg></a></div></div>
  </section>
  <section class="px-ch wrap section" id="la-luz">
    ${chHead('02',T('The light','La luz'),T('Seven modes,<br><em>seven colors.</em>','Siete modos,<br><em>siete colores.</em>'),T('Red, green and blue LED channels combine into seven modes. Try each one in the viewer at the top of the page.','Los canales LED rojo, verde y azul se combinan en siete modos. Pruébalos en el visor de la parte superior.'))}
    <div class="px-tri">${[['green',1],['blue',2],['purple',3]].map(([k,i])=>fig(IMGH[k],T(COLORS[i].en+' light on the LEZO mask',`Luz ${COLORS[i].es.toLowerCase()} en la máscara LEZO`),1536,2048,'',`<b style="color:${COLORS[i].c}">●</b>${T(COLORS[i].en,COLORS[i].es)}`)).join('')}</div>
    <ul class="px-chips" aria-label="${T('Light modes and wavelengths','Modos de luz y longitudes de onda')}">${chips}</ul>
  </section>
  <section class="px-ch wrap section" id="el-interior">
    ${chHead('03',T('The inside','El interior'),T('The light is<br><em>on the inside.</em>','La luz está<br><em>por dentro.</em>'),T('LEDs spread across the whole inner face, so the light wraps around you. Tap any image to zoom in.','LEDs repartidos por toda la cara interior, para que la luz te envuelva. Toca cualquier imagen para ampliarla.'))}
    <div class="px-detail__grid">
      ${fig(D.inside,T('Inside of the LEZO mask with the LED array lit','Interior de la máscara LEZO con la matriz de LEDs encendida'),2656,2160,'px-fig--big',`<b>01</b>${T('Light all around your face','Luz por todo tu rostro')}`)}
      ${fig(IMG.sci,T('Macro of the LED lenses inside the mask','Macro de los LEDs dentro de la máscara'),2400,1357,'',`<b>02</b>${T('Every LED, up close','Cada LED, de cerca')}`)}
      ${fig(D.strap,T('Adjustable strap with buckle','Correa ajustable con hebilla'),2683,2160,'',`<b>03</b>${T('Adjustable strap','Correa ajustable')}`)}
    </div>
  </section>
  <section class="px-ch wrap section" id="el-ajuste">
    ${chHead('04',T('The fit','El ajuste'),T('Adjust it once.<br><em>Hands free.</em>','Ajústala una vez.<br><em>Manos libres.</em>'),T('The mask sits on the face and an adjustable strap with a buckle holds it in place, so you can sit back or recline without holding it.','La máscara se apoya en el rostro y una correa ajustable con hebilla la mantiene en su lugar, para que te sientes o recuestes sin sostenerla.'))}
    <div class="px-split px-split--r"><div class="px-split__t"><ol class="px-steps2"><li><b>01</b>${T('Hold the mask by its edges and bring it to your face.','Sostén la máscara por los bordes y llévala a tu rostro.')}</li><li><b>02</b>${T('Line up the openings with your eyes, nose and mouth.','Alinea las aberturas con ojos, nariz y boca.')}</li><li><b>03</b>${T('Pull the strap around the back and fasten the buckle.','Pasa la correa por la nuca y abrocha la hebilla.')}</li></ol><button type="button" class="text-link" data-px-tutorial>${T('See the full guide · 5 steps','Ver la guía completa · 5 pasos')}</button></div>${fig(IMGH.fit,T('The LEZO mask worn on a mannequin','La máscara LEZO puesta en un maniquí'),1536,1920,'',`<b>→</b>${T('Shown on a mannequin','Sobre un maniquí')}`)}</div>
  </section>
  <section class="px-ch wrap section" id="en-uso">
    ${chHead('05',T('In use','En uso'),T('Lie back.<br><em>Let it glow.</em>','Recuéstate.<br><em>Deja que brille.</em>'),T('Recline on a bed or a lounger, switch the mask on and follow the session time given in the manufacturer’s instructions.','Recuéstate en una cama o un sillón, enciende la máscara y respeta el tiempo de sesión de las instrucciones del fabricante.'))}
    ${fig(IMGU.a,T('A model reclined on a white treatment bed wearing the LEZO mask lit red','Una modelo recostada en una camilla blanca con la máscara LEZO encendida en rojo'),2688,1520,'px-use-wide')}
    <div class="px-split px-split--r"><div class="px-split__t"><div class="px-spec__list"><div><span>${T('Position','Postura')}</span><b>${T('Reclined or seated','Recostada o sentada')}</b></div><div><span>${T('Mode','Modo')}</span><b>${T('Any of the seven','Cualquiera de los siete')}</b></div><div><span>${T('Hands','Manos')}</span><b>${T('Free','Libres')}</b></div><div><span>${T('Session','Sesión')}</span><b>${T('As set out in the instructions','Según las instrucciones')}</b></div></div></div>${fig(IMGU.b,T('Close portrait of the LEZO mask lit blue on a white pillow','Retrato cercano de la máscara LEZO encendida en azul sobre una almohada blanca'),1792,2240)}</div>
  </section>
  <section class="px-ch wrap section" id="que-llega">
    ${chHead('06',T('What arrives','Lo que llega'),T('The mask, ready<br><em>to switch on.</em>','La máscara, lista<br><em>para encender.</em>'),T('Your order is the LEZO full-face LED mask with its adjustable strap, together with the manufacturer’s instructions for power, care and session settings.','Tu pedido es la máscara LED facial LEZO con su correa ajustable, junto con las instrucciones del fabricante sobre alimentación, cuidado y ajustes de sesión.'))}
    ${fig(IMG.box,T('Illustration of the LEZO mask presented in a white box','Ilustración de la máscara LEZO presentada en una caja blanca'),2400,1029,'px-box-fig')}
    <p class="small px-detail__note">${T('Packaging shown for illustration.','Presentación mostrada a modo ilustrativo.')}</p>
  </section>`;
}
function howtoBand(){
  const ship=document.getElementById('envio');
  if(document.getElementById('como-usar')||!ship||document.querySelector('.care-page')||location.pathname.includes('/products/'))return;
  const steps=tutSteps().map((x,i)=>`<li><b>0${i+1}</b><span>${x.k}</span></li>`).join('');
  const s=document.createElement('section');s.className='px-ch px-howto wrap section';s.id='como-usar';
  s.innerHTML=`${chHead('08',T('How to use','Cómo usarla'),T('Five steps,<br><em>start to finish.</em>','Cinco pasos,<br><em>de principio a fin.</em>'),T('A short illustrated guide, from cleansing your face to storing the mask.','Una guía ilustrada y corta, desde limpiar el rostro hasta guardar la máscara.'))}
    <ol class="px-howto__list">${steps}</ol>
    <button type="button" class="btn" data-px-tutorial>${T('Open the guide','Abrir la guía')}<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 12h17m-6-6 6 6-6 6"/></svg></button>`;
  ship.after(s);
}

/* ---------------- tutorial lives inside a button (full-screen sheet) ---------------- */
let tutDlg=null,tutLast=null;
function openTutorial(from){
  if(!tutDlg||!tutDlg.isConnected){
    tutDlg=document.createElement('dialog');tutDlg.className='px-tutd';tutDlg.setAttribute('aria-labelledby','px-tutd-t');
    tutDlg.innerHTML=`<div class="px-tutd__bar"><button type="button" class="px-back" data-px-close>${back()}</button><span>${T('LEZO · How to use','LEZO · Cómo usarla')}</span><button type="button" class="px-tutd__x" aria-label="${T('Close','Cerrar')}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div><div class="px-tutd__body px-tut"></div>`;
    document.body.appendChild(tutDlg);
    buildTutorial(tutDlg.querySelector('.px-tutd__body'));
    tutDlg.querySelectorAll('.px-tutd__x,[data-px-close]').forEach(b=>b.addEventListener('click',()=>tutDlg.close()));
    tutDlg.addEventListener('click',e=>{if(e.target===tutDlg)tutDlg.close()});
    tutDlg.addEventListener('close',()=>{root.classList.remove('px-lock');tutLast?.focus?.()});
  }
  tutLast=from||document.activeElement;
  root.classList.add('px-lock');
  tutDlg.showModal();tutDlg.scrollTop=0;
}
document.addEventListener('click',e=>{
  const t=e.target.closest?.('[data-px-tutorial],a[href$="#ritual"]');
  if(!t)return;
  e.preventDefault();e.stopPropagation();openTutorial(t);
},true);


/* ---------------- hamburger + travel menu, back buttons ---------------- */
const back=()=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6"/></svg><span>${T('Back','Atrás')}</span>`;
let menuDlg=null,menuLang=null,menuLast=null;
function menuItems(){
  const pdp=location.pathname.includes('/products/');
  const base=pdp?'/':'';
  if(pdp)return[
    ['mask3d',T('360° view','Vista 360°'),IMG.profile],['como-funciona',T('How it works','Funcionamiento'),IMG.modes],['en-uso',T('In use','En uso'),IMGU.c],['calidad',T('Build quality','Calidad'),IMG.shell],['envio',T('Delivery','Entrega'),IMG.box]];
  return[
    ['la-mascara',T('The mask','La máscara'),IMG.res],['la-luz',T('The light','La luz'),IMGH.blue],['el-interior',T('The inside','El interior'),DETAIL.inside],['el-ajuste',T('The fit','El ajuste'),IMGH.fit],['en-uso',T('In use','En uso'),IMGU.a],['que-llega',T('What arrives','Lo que llega'),IMG.box],['envio',T('Delivery','Entrega'),IMG.box],['como-usar',T('How to use','Cómo usarla'),TUT_IMG[3]]];
}
function buildMenu(){
  if(menuDlg)menuDlg.remove();
  const pdp=location.pathname.includes('/products/');
  const items=menuItems();
  menuDlg=document.createElement('dialog');menuDlg.className='px-menu';menuDlg.setAttribute('aria-label',T('Menu','Menú'));
  menuDlg.innerHTML=`<div class="px-menu__bar"><button type="button" class="px-back" data-px-close>${back()}</button><span>LEZO</span><button type="button" class="px-menu__x" data-px-close aria-label="${T('Close menu','Cerrar menú')}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
  <div class="px-menu__body"><nav aria-label="${T('Travel the store','Recorre la tienda')}"><span class="eyebrow">${T('Travel the store','Recorre la tienda')}</span><ol class="px-menu__list">${items.map(([id,label,img],i)=>`<li><a href="${pdp?'#'+id:'#'+id}" data-go="${id}" data-img="${img}"><b>0${i+1}</b><span>${label}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg></a></li>`).join('')}</ol>
    <div class="px-menu__extra">${pdp?`<a href="/" data-px-home>${T('Back to home','Volver al inicio')}</a>`:`<a href="/products/lezo-7-color-led-face-mask">${T('Product page','Página del producto')}</a>`}<button type="button" data-px-menu-cart>${T('Bag','Carrito')}</button><button type="button" data-px-menu-lang>${es()?'English':'Español'}</button></div>
    <a class="btn px-menu__buy" href="${pdp?'#product-buy':'/products/lezo-7-color-led-face-mask'}" data-px-menu-buy>${T('Buy LEZO','Comprar LEZO')}<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 12h17m-6-6 6 6-6 6"/></svg></a></nav>
    <div class="px-menu__pv" aria-hidden="true">${items.map(([id,,img],i)=>`<img data-pv="${id}" src="${img}" alt="" ${i?'loading="lazy"':''}>`).join('')}</div></div>`;
  document.body.appendChild(menuDlg);
  const pv=id=>menuDlg.querySelectorAll('.px-menu__pv img').forEach(im=>im.classList.toggle('on',im.dataset.pv===id));
  pv(items[0][0]);
  menuDlg.querySelectorAll('[data-go]').forEach(a=>{
    a.addEventListener('pointerenter',()=>pv(a.dataset.go));a.addEventListener('focus',()=>pv(a.dataset.go));
    a.addEventListener('click',e=>{
      e.preventDefault();const id=a.dataset.go;menuDlg.close();
      if(id==='como-usar'&&!document.getElementById(id)){openTutorial(a);return}
      const el=document.getElementById(id);
      if(id==='como-usar'&&el){el.scrollIntoView({behavior:'smooth'});return}
      if(el){setTimeout(()=>el.scrollIntoView({behavior:'smooth'}),60)}
      else location.assign('/#'+id);
    });
  });
  menuDlg.querySelectorAll('[data-px-close]').forEach(b=>b.addEventListener('click',()=>menuDlg.close()));
  menuDlg.querySelector('[data-px-menu-cart]').addEventListener('click',()=>{menuDlg.close();typeof openCart==='function'&&openCart()});
  menuDlg.querySelector('[data-px-menu-lang]').addEventListener('click',()=>{menuDlg.close();document.getElementById('language')?.click()});
  menuDlg.querySelector('[data-px-menu-buy]').addEventListener('click',()=>menuDlg.close());
  menuDlg.addEventListener('close',()=>{root.classList.remove('px-lock');document.querySelector('.px-burger')?.setAttribute('aria-expanded','false');menuLast?.focus?.()});
  menuLang=root.lang;
}
function openMenu(btn){
  if(!menuDlg||!menuDlg.isConnected||menuLang!==root.lang)buildMenu();
  menuLast=btn;root.classList.add('px-lock');btn?.setAttribute('aria-expanded','true');menuDlg.showModal();
}
function headerExtras(){
  const tools=document.querySelector('header .nav-tools');
  if(tools&&!tools.querySelector('.px-burger')){
    const b=document.createElement('button');b.type='button';b.className='px-burger';b.setAttribute('aria-label',T('Open menu','Abrir menú'));b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','dialog');
    b.innerHTML='<i></i><i></i><i></i>';b.addEventListener('click',()=>openMenu(b));tools.appendChild(b);
  }
  const nav=document.querySelector('header .nav');
  if(nav&&!nav.querySelector('.px-back--page')&&location.pathname!=='/'&&!/^\/(\?|#|$)/.test(location.pathname+location.search)){
    const a=document.createElement('a');a.href='/';a.className='px-back px-back--page';a.innerHTML=back();
    a.addEventListener('click',e=>{e.preventDefault();try{if(history.length>1&&document.referrer&&new URL(document.referrer).origin===location.origin){history.back();return}}catch{}location.assign('/')});
    nav.prepend(a);
  }
}

/* ---------------- page transitions ---------------- */
function chrome(){
  if(!document.querySelector('.px-leave')){
    document.body.insertAdjacentHTML('beforeend','<div class="px-leave" aria-hidden="true"></div>');
  }
  const first=(()=>{try{if(sessionStorage.getItem('px-intro'))return false;sessionStorage.setItem('px-intro','1')}catch{}return true})();
  if(first&&!reduced&&!document.querySelector('.px-curtain')){
    document.body.insertAdjacentHTML('afterbegin',`<div class="px-curtain" aria-hidden="true"><div><b>LEZO</b><small>BY SEVENCRUSH</small></div><i></i></div>`);
    const c=document.querySelector('.px-curtain');
    setTimeout(()=>{c.classList.add('out');setTimeout(()=>c.remove(),1000)},1050);
  }
}
document.addEventListener('click',e=>{
  const a=e.target.closest?.('a[href]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
  const u=new URL(a.href,location.href);
  if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search)||reduced)return;
  e.preventDefault();
  document.querySelector('.px-leave')?.classList.add('on');
  setTimeout(()=>location.assign(u.href),260);
});
addEventListener('pageshow',e=>{if(e.persisted)document.querySelector('.px-leave')?.classList.remove('on')});

/* ---------------- boot ---------------- */
function enhance(){
  const app=document.getElementById('app');
  if(!app||!document.getElementById('main'))return;
  chrome();
  if(!document.querySelector('.px-stage')&&stage){stage.dispose();stage=null}
  tabFunctions();stageInit();journey();shipSection();howtoBand();pdpSections();headerExtras();decorate();heroTilt();magnetic();
  onScroll();
}
function boot(){
  const app=document.getElementById('app');
  if(!app){return}
  enhance();
  let q=0;
  new MutationObserver(()=>{cancelAnimationFrame(q);q=requestAnimationFrame(enhance)}).observe(app,{childList:true});
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

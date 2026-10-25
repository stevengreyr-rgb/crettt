/* LEZO premium layer. Runs after lezo-studio.js, which renders the page into #app
   (and re-renders it on language change), so everything here is idempotent and is
   re-applied whenever #app's children are replaced. */
(()=>{
'use strict';
const MODEL_URL='https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-mask-3d.glb?v=1792898992';
const FALLBACK_IMG='https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-pdp-front-2026.webp?v=1792897049';
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
  const bar=document.querySelector('.px-progress');
  if(bar)bar.style.transform=`scaleX(${clamp(y/Math.max(1,doc.scrollHeight-vh))})`;
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
  if(stage)stage.scroll();
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
    fade:'.eyebrow,.hero-copy>p,.hero-price,.hero-copy>.btn,.hero-color-link,.hero-note,.section-head p,.study-intro,.light-invitation,.mode-info>*,.results-copy>*:not(h2),.faq-grid>div:first-child>*:not(h2),.buy-copy>*,.numbered,.step-line,.result-points div,.science-top p,.science-bottom article,.depth-captions article,.depth-heading>*:not(h2),.pdp-ritual-copy>*:not(h2),.pdp-copy>*:not(h1),.ritual-layout>div:last-child>.text-link,.service-band>div,.faq-list details,.trustbar>div,.mode-tabs .swatch,.px-detail__head>*,.px-detail__note,.px-ship__lede,.px-dates,.px-ship__note,.px-steps li,.px-big',
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
  const items=[[T('Seven light modes','Siete modos de luz'),0],[T('Delivery in <em>5–12 days</em>','Entrega en <em>5–12 días</em>'),4],[T('One mask','Una sola máscara'),2],[T('30-day returns','Devoluciones en 30 días'),1],[T('Secure checkout','Pago seguro'),3],[T('Light, made personal','Luz a tu manera'),5]];
  const row=items.map(([s,i])=>`<span style="--c:${COLORS[i].c}">${s}</span>`).join('');
  const m=document.createElement('div');m.className='px-marquee';m.setAttribute('role','presentation');
  m.innerHTML=`<div aria-hidden="true">${row}${row}${row}${row}</div>`;
  const hidden=document.createElement('span');hidden.className='sr-only';hidden.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
  hidden.textContent=T('Seven light modes. Delivery in 5 to 12 days. 30-day returns. Secure checkout.','Siete modos de luz. Entrega de 5 a 12 días. Devoluciones en 30 días. Pago seguro.');
  m.appendChild(hidden);
  anchor.after(m);
}

/* ---------------- shipping 5–12 ---------------- */
const NODES=[[125,40],[375,90],[625,40],[875,90]];
const ROUTE='M0 90 C60 90 70 40 125 40 S250 90 375 90 S500 40 625 40 S750 90 875 90 S960 60 1000 60';
function fmt(d){return d.toLocaleDateString(es()?'es':'en-US',{day:'numeric',month:'short'}).replace('.','')}
function shipSection(){
  const faq=document.getElementById('questions')||document.querySelector('.faq-grid')?.closest('section');
  if(document.getElementById('envio')||!faq||document.querySelector('.care-page'))return;
  const d0=new Date(),a=new Date(d0),b=new Date(d0);a.setDate(a.getDate()+5);b.setDate(b.getDate()+12);
  const s=document.createElement('section');s.className='px-ship wrap section';s.id='envio';s.setAttribute('aria-labelledby','px-ship-title');
  s.innerHTML=`<div class="px-ship__top"><div><span class="eyebrow">${T('Delivery','Envío')}</span><h2 id="px-ship-title">${T('Order today.<br><em>Open it soon.</em>','Pídela hoy.<br><em>Ábrela pronto.</em>')}</h2><p class="px-ship__lede">${T('Your LEZO should arrive in <b>5 to 12 days</b>. We email you at every step and send tracking details when available, so you always know where it is.','Tu LEZO debería llegar en <b>5 a 12 días</b>. Te escribimos en cada paso y te enviamos el seguimiento cuando esté disponible, para que siempre sepas dónde está.')}</p><div class="px-dates">${ICON_PARCEL.replace('<svg','<svg width="22" height="22"')}<div><span>${T('Order today · estimated arrival','Pide hoy · llegada estimada')}</span><br><strong>${fmt(a)} – ${fmt(b)}</strong></div></div></div><div class="px-big" aria-hidden="true"><span data-count="5">5</span><em>–</em><span data-count="12">12</span><small>${T('days','días')}</small></div></div>
  <div class="px-route" aria-hidden="true"><svg viewBox="0 0 1000 140" preserveAspectRatio="none"><path class="base" d="${ROUTE}"/><path class="fill" d="${ROUTE}"/>${NODES.map(([x,y])=>`<circle class="n" cx="${x}" cy="${y}" r="7"/>`).join('')}<circle class="parcel" r="9" cx="0" cy="90"/></svg></div>
  <ol class="px-steps"><li><b>${T('DAY 0','DÍA 0')}</b><h3>${T('Order confirmed','Pedido confirmado')}</h3><p>${T('Secure Shopify checkout and a confirmation email.','Pago seguro en Shopify y confirmación por correo.')}</p></li><li><b>${T('PREPARING','PREPARACIÓN')}</b><h3>${T('Packed with care','Preparado con cuidado')}</h3><p>${T('We get your LEZO ready to ship.','Dejamos tu LEZO listo para salir.')}</p></li><li><b>${T('ON ITS WAY','EN CAMINO')}</b><h3>${T('In transit','En tránsito')}</h3><p>${T('Shipping update by email, with tracking if available.','Aviso de envío por correo, con seguimiento si está disponible.')}</p></li><li><b>${T('DAY 5–12','DÍA 5–12')}</b><h3>${T('At your door','En tu puerta')}</h3><p>${T('Estimated window. 30 days to request a return.','Plazo estimado. 30 días para solicitar devolución.')}</p></li></ol>
  <p class="small px-ship__note">${T('Estimate only, not a guaranteed arrival date. Shipping charges and taxes are shown at checkout for your destination.','Plazo orientativo, no una fecha de llegada garantizada. Los gastos de envío e impuestos se muestran al pagar según tu destino.')}</p>`;
  faq.before(s);
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

/* ---------------- 3D stage ---------------- */
function stageMarkup(){
  const sw=COLORS.map((m,i)=>`<button type="button" style="--sw:${m.c}" data-px-mode="${i}" aria-pressed="${i===0}" aria-label="${T(m.en,m.es)}"><i></i></button>`).join('');
  return `<div class="px-stage__track"><div class="px-stage__sticky">
    <div class="px-stage__bg"></div><div class="px-stage__grid"></div>
    <div class="px-fallback"><img src="${FALLBACK_IMG}" alt="${T('White LEZO LED mask','Máscara LED LEZO blanca')}" width="1536" height="1024" loading="lazy"></div>
    <canvas class="px-canvas" role="img" aria-label="${T('Interactive 3D model of the LEZO mask. Drag to rotate.','Modelo 3D interactivo de la máscara LEZO. Arrastra para girarla.')}"></canvas>
    <div class="px-copy"><span class="eyebrow">${T('Meet it in 3D','Conócela en 3D')}</span>
      <h2 class="px-keep">${T('Turn it.<br><em>Light it.</em>','Gírala.<br><em>Enciéndela.</em>')}</h2>
      <p>${T('Seven lights, one mask. Pick a color and the whole mask glows with it, then drag to see every angle, inside and out.','Siete luces, una máscara. Elige un color y toda la máscara brilla con él; arrástrala para verla desde todos los ángulos, por dentro y por fuera.')}</p>
      <div class="px-mode" aria-live="polite"><div class="px-mode-idx"></div><div class="px-mode-name"></div><div class="px-mode-nm"></div><span class="px-mode-label">${T('Exact wording from the supplied product sheet:','Traducción del texto de la ficha del producto:')}</span><div class="px-mode-desc"></div><div class="px-mode-fine">${T('These are product-sheet claims, not clinically verified benefits of this mask. Colors are a visual simulation.','Son afirmaciones de la ficha, no beneficios clínicamente verificados de esta máscara. Los colores son una simulación visual.')}</div></div>
    </div>
    <div class="px-hud"><div class="px-swatches" role="group" aria-label="${T('Choose a light mode','Elige un modo de luz')}">${sw}</div>
      <div class="px-meta"><button type="button" class="px-inside" data-px-inside>${T('See inside · LEDs','Ver por dentro · LEDs')}</button><span class="px-hint"><b>↔</b>${T('Drag to rotate','Arrastra para girar')}</span><span class="px-ship-chip">${ICON_PARCEL}${T('Delivery in 5–12 days','Entrega en 5–12 días')}</span></div></div>
  </div></div>`;
}
class Stage{
  constructor(el){
    this.el=el;this.track=el.querySelector('.px-stage__track');this.idx=-1;this.drag=0;this.dragging=false;this.visible=false;this.p=0;this.disposed=false;
    this.cache={};this.auto=-.3;this.holdUntil=0;this.userPicked=false;this.last=performance.now();
    el.querySelectorAll('[data-px-mode]').forEach(b=>b.addEventListener('click',()=>this.pick(+b.dataset.pxMode)));
    el.querySelector('[data-px-inside]')?.addEventListener('click',()=>this.pickP(.64));
    this.setMode(0,true);
    this.cycle=setInterval(()=>{if(!this.userPicked&&this.visible&&!document.hidden&&!reduced)this.setMode((this.idx+1)%COLORS.length)},5200);
    this.io=new IntersectionObserver(e=>{this.visible=e[0].isIntersecting;root.classList.toggle('px-in-stage',this.visible);if(this.visible&&!this.started)this.start()},{rootMargin:'200px'});
    this.io.observe(el);
    this.scroll();
  }
  pick(i){this.userPicked=true;this.setMode(i,false,true)}
  pickP(){
    // turn the mask to show its inside and hold it there for a few seconds
    this.holdUntil=performance.now()+7000;
    this.insideTarget=Math.PI+Math.round((this.auto-Math.PI)/(Math.PI*2))*Math.PI*2;
  }
  scroll(){}
  setMode(i,force,user){
    if(i===this.idx&&!force)return;
    const first=this.idx===-1;this.idx=i;const m=COLORS[i];
    this.target=m.c;
    this.el.style.setProperty('--px-c',m.c==='#f3efe6'?'#e9dfd0':m.c);
    this.el.querySelectorAll('[data-px-mode]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.pxMode===i));
    const box=this.el.querySelector('.px-mode');
    box.querySelector('.px-mode-idx').textContent=`0${i+1} / 07`;
    box.querySelector('.px-mode-name').innerHTML=es()?`Luz <i>${m.es.toLowerCase()}</i>`:`<i>${m.en}</i> light`;
    box.querySelector('.px-mode-nm').textContent=`${m.nm} · ${T('Supplier specification','Especificación del proveedor')}`;
    box.querySelector('.px-mode-desc').textContent=T(m.d[0],m.d[1]);
    if(!first){box.classList.remove('px-swap');void box.offsetWidth;box.classList.add('px-swap')}
    // keep the light-studio section further down in sync
    const b=document.querySelector(`[data-mode="${i}"]`);
    if(user&&b&&b.getAttribute('aria-pressed')!=='true')b.click();
  }
  async start(){
    this.started=true;
    try{
      const canvas=this.el.querySelector('.px-canvas');
      const probe=document.createElement('canvas');
      if(!(probe.getContext('webgl2')||probe.getContext('webgl')))throw new Error('no webgl');
      const THREE=await import('three');
      const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
      const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
      if(this.disposed||!this.el.isConnected)return;
      this.THREE=THREE;
      const renderer=this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      const scene=this.scene=new THREE.Scene();
      const pmrem=new THREE.PMREMGenerator(renderer);
      scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
      const cam=this.cam=new THREE.PerspectiveCamera(32,1,.1,50);cam.position.set(0,0,6.4);
      const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(2.5,3,4);scene.add(key);
      const col=this.col=new THREE.Color(this.target);
      const front=this.front=new THREE.PointLight(col,9,9,2);front.position.set(0,.2,2.6);scene.add(front);
      const rim=this.rim=new THREE.PointLight(col,14,10,2);rim.position.set(-2.6,1.4,-2.2);scene.add(rim);
      const rim2=this.rim2=new THREE.PointLight(col,8,10,2);rim2.position.set(2.8,-1,-1.8);scene.add(rim2);
      // soft halo behind the mask
      const gc=document.createElement('canvas');gc.width=gc.height=256;
      const g=gc.getContext('2d'),gr=g.createRadialGradient(128,128,0,128,128,128);
      gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.35,'rgba(255,255,255,.28)');gr.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=gr;g.fillRect(0,0,256,256);
      const gtex=new THREE.CanvasTexture(gc);
      const halo=this.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:gtex,color:col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.75}));
      halo.scale.set(7.5,7.5,1);halo.position.set(0,0,-1.6);scene.add(halo);
      // drifting photons
      const N=170,pos=new Float32Array(N*3),seed=[];
      for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=1.7+Math.random()*2.2,y=(Math.random()-.5)*3.6;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=y;pos[i*3+2]=Math.sin(a)*r-.4;seed.push(Math.random()*6)}
      const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const pm=new THREE.PointsMaterial({map:gtex,alphaTest:.01,size:.11,color:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
      const pts=this.pts=new THREE.Points(pg,pm);this.seed=seed;scene.add(pts);
      const pivot=this.pivot=new THREE.Group();scene.add(pivot);
      const model=await new Promise((res,rej)=>new GLTFLoader().load(MODEL_URL,g=>res(g.scene),undefined,rej));
      if(this.disposed)return;
      const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),ctr=box.getCenter(new THREE.Vector3());
      model.position.sub(ctr);
      const s=3.1/Math.max(size.x,size.y,size.z);
      const holder=new THREE.Group();holder.add(model);holder.rotation.y=-Math.PI/2;holder.scale.setScalar(s);pivot.add(holder);   // GLB faces +X; turn it to face the camera
      this.cplane=new THREE.Plane(new THREE.Vector3(0,0,1),3);
      renderer.localClippingEnabled=true;
      model.traverse(o=>{if(o.isMesh&&o.material){o.material.envMapIntensity=1.1;if(o.material.metalness>.8){o.material.metalness=.55}o.material.clippingPlanes=[this.cplane];(this.shellMats||(this.shellMats=[])).push(o.material)}});
      pivot.updateMatrixWorld(true);
      this.buildLeds(THREE,model,pivot,gtex);
      this.bindPointer(canvas);
      this.resize();addEventListener('resize',this.onResize=()=>this.resize());
      this.el.classList.add('is-live');
      this.clock=new THREE.Clock();this.rot=this.auto;this.zc=-3;this.loop();
    }catch(err){
      console.warn('[LEZO] 3D unavailable, using image fallback',err);
      this.el.classList.add('no-gl');
      this.bindTilt();
    }
  }
  buildLeds(THREE,model,pivot,gtex){
    // The reconstruction is a closed solid, so a ray fired from its core hits the front skin from the
    // inside: that is the concave lining we light up with the LED array.
    const meshes=[];model.traverse(o=>{if(o.isMesh)meshes.push(o)});
    const sides=meshes.map(m=>m.material.side);meshes.forEach(m=>m.material.side=THREE.DoubleSide);
    const rc=new THREE.Raycaster(),fwd=new THREE.Vector3(0,0,1),pts=[];
    const step=.125,cols=Math.round(2.6/step)+1,rows=Math.round(3/(step*.866))+1;
    const grid=[];
    for(let r=0;r<rows;r++){grid.push([]);for(let c=0;c<cols;c++){
      const x=-1.3+c*step+(r%2?step/2:0),y=-1.5+r*step*.866;
      rc.set(new THREE.Vector3(x,y,.3),fwd);const h=rc.intersectObjects(meshes,false)[0];
      let ok=null;
      if(h&&h.face){const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);if(n.dot(fwd)>0)n.negate();if(n.dot(fwd)<-.18)ok={p:h.point.clone().addScaledVector(n,.016)}}
      grid[r].push(ok);
    }}
    // leave a clear ring around the eye / nose / mouth openings, like the real lining
    const solid=(r,c)=>grid[r]?.[c]!==undefined&&grid[r][c]!==null;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const g=grid[r][c];if(!g)continue;
      if(solid(r,c-1)&&solid(r,c+1)&&solid(r-1,c)&&solid(r+1,c)&&solid(r-2,c)&&solid(r+2,c))pts.push(g.p);
    }
    meshes.forEach((m,i)=>m.material.side=sides[i]);

    if(pts.length<20)return;
    this.leds=new THREE.Group();
    // each LED = translucent domed lens + brighter core, with slight brightness variation per unit
    const lensM=this.ledMat=new THREE.MeshBasicMaterial({color:this.col,toneMapped:false,transparent:true,opacity:.6});
    const coreM=this.coreMat=new THREE.MeshBasicMaterial({color:this.col,toneMapped:false});
    const lens=new THREE.InstancedMesh(new THREE.SphereGeometry(.033,14,10),lensM,pts.length);
    const core=new THREE.InstancedMesh(new THREE.SphereGeometry(.014,10,8),coreM,pts.length);
    const m4=new THREE.Matrix4(),tint=new THREE.Color();
    pts.forEach((v,i)=>{m4.setPosition(v);lens.setMatrixAt(i,m4);core.setMatrixAt(i,m4);const k=.72+Math.random()*.4;tint.setScalar(k);lens.setColorAt(i,tint);core.setColorAt(i,tint)});
    this.leds.add(lens,core);
    const pg=new THREE.BufferGeometry().setFromPoints(pts);
    this.ledGlow=new THREE.Points(pg,new THREE.PointsMaterial({map:gtex,alphaTest:.01,size:.26,color:this.col,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true}));
    this.leds.add(this.ledGlow);
    const inner=this.inner=new THREE.PointLight(this.col,6,5,2);inner.position.set(0,0,.15);this.leds.add(inner);
    pivot.add(this.leds);
    this.ledCount=pts.length;
  }
  bindPointer(canvas){
    let x0=0,d0=0,id=null;
    canvas.addEventListener('pointerdown',e=>{id=e.pointerId;canvas.setPointerCapture(id);this.dragging=true;x0=e.clientX;this.resumeAt=0});
    canvas.addEventListener('pointermove',e=>{
      if(this.dragging&&e.pointerId===id){this.auto+=(e.clientX-x0)*.009;x0=e.clientX;this.holdUntil=0}
      else if(fine){const r=canvas.getBoundingClientRect();this.mx=(e.clientX-r.left)/r.width-.5;this.my=(e.clientY-r.top)/r.height-.5}
    });
    const up=()=>{this.dragging=false;id=null;this.resumeAt=performance.now()+1800};
    canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
    canvas.addEventListener('pointerleave',()=>{this.mx=this.my=0});
    this.mx=this.my=0;
  }
  bindTilt(){
    const fb=this.el.querySelector('.px-fallback');
    if(!fine)return;
    this.el.addEventListener('pointermove',e=>{const r=this.el.getBoundingClientRect();fb.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*18+'deg');fb.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*10+'deg')});
  }
  rotAt(p){
    const K=[[0,-.3],[.26,.5],[.5,Math.PI],[.8,Math.PI+.25],[1,Math.PI*2-.3]];
    for(let i=1;i<K.length;i++)if(p<=K[i][0]){
      const [a,ra]=K[i-1],[b,rb]=K[i],k=clamp((p-a)/(b-a)),e=k*k*(3-2*k);
      return ra+(rb-ra)*e;
    }
    return K[K.length-1][1];
  }
  resize(){
    const c=this.renderer.domElement,w=c.clientWidth,h=c.clientHeight;
    if(!w||!h)return;
    this.renderer.setSize(w,h,false);this.cam.aspect=w/h;
    // on narrow screens pull the camera back and lift the mask above the controls
    const narrow=w<760;
    this.cam.position.z=narrow?14:7.4;
    this.offsetX=narrow?0:1.35;this.offsetY=narrow?.12:0;
    this.cam.updateProjectionMatrix();
  }
  loop(){
    if(this.disposed||!this.el.isConnected){this.dispose();return}
    requestAnimationFrame(()=>this.loop());
    if(!this.visible||document.hidden)return;
    const t=this.clock.getElapsedTime(),now=performance.now(),dt=Math.min((now-this.last)/1000,.05);this.last=now;
    if(!this.dragging&&!reduced){
      if(now<this.holdUntil)this.auto+=(this.insideTarget-this.auto)*(1-Math.exp(-dt*3.2));
      else if(now>(this.resumeAt||0))this.auto+=dt*.24;
    }
    const targetRot=this.auto+(this.mx||0)*.3;
    this.rot+=(targetRot-this.rot)*(1-Math.exp(-dt*5));
    const P=this.pivot;
    P.rotation.y=this.rot;P.rotation.x+=((-(this.my||0)*.25+Math.sin(t*.5)*.03)-P.rotation.x)*.06;
    P.position.set(this.offsetX,this.offsetY+Math.sin(t*.9)*.06,0);
    this.halo.position.x=this.offsetX;this.halo.position.y=this.offsetY;
    const tgt=new this.THREE.Color(this.target);this.col.lerp(tgt,.07);
    for(const l of [this.front,this.rim,this.rim2])l.color.copy(this.col);
    this.front.position.x=this.offsetX;
    const inside=clamp(-Math.cos(P.rotation.y)*1.4-.1);
    this.zc+=(( -3+inside*inside*(3-2*inside)*3.34)-this.zc)*.1;
    P.updateMatrixWorld(true);
    this.cplane.set(new this.THREE.Vector3(0,0,1),-this.zc).applyMatrix4(P.matrixWorld);
    if(this.shellMats){for(const m of this.shellMats){m.emissive.copy(this.col);m.emissiveIntensity=inside*.5}}
    if(this.leds){
      this.ledMat.color.copy(this.col).multiplyScalar(1+inside*.5);this.coreMat.color.copy(this.col).lerp(new this.THREE.Color(0xffffff),.85).multiplyScalar(2+inside*1.2);
      this.ledGlow.material.color.copy(this.col);this.ledGlow.material.opacity=.15+inside*.35;
      this.inner.color.copy(this.col);this.inner.intensity=3+inside*9;
    }
    if(this.el.dataset.inside!==String(inside>.55)){this.el.dataset.inside=String(inside>.55)}
    this.halo.material.color.copy(this.col);this.pts.material.color.copy(this.col);
    this.halo.material.opacity=.6+Math.sin(t*1.4)*.12;
    this.pts.rotation.y=t*.06+this.rot*.3;this.pts.position.x=this.offsetX;
    const pa=this.pts.geometry.attributes.position;
    for(let i=0;i<pa.count;i++)pa.array[i*3+1]+=Math.sin(t*.6+this.seed[i])*.0016;
    pa.needsUpdate=true;
    this.renderer.render(this.scene,this.cam);
  }
  dispose(){
    if(this.disposed&&!this.renderer)return;
    this.disposed=true;clearInterval(this.cycle);this.io?.disconnect();root.classList.remove('px-in-stage');removeEventListener('resize',this.onResize);
    if(this.renderer){this.renderer.dispose();this.renderer.forceContextLoss?.();this.renderer=null}
  }
}
const DETAIL={inside:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-inside-led.webp?v=1792901528',macro:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-macro-led.webp?v=1792901528',strap:'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/lezo-strap-detail.webp?v=1792901528'};
function detailSection(){
  const stageEl=document.querySelector('.px-stage');
  if(!stageEl||document.getElementById('por-dentro')||document.querySelector('.care-page'))return;
  const s=document.createElement('section');s.className='px-detail wrap section';s.id='por-dentro';
  s.innerHTML=`<div class="px-detail__head"><div><span class="eyebrow">${T('Inside the mask','Por dentro')}</span><h2>${T('The light is<br><em>on the inside.</em>','La luz está<br><em>por dentro.</em>')}</h2></div><p>${T('LEDs spread across the whole inner face, so the light wraps around you. An adjustable strap with a buckle keeps your hands free to do whatever you like.','LEDs repartidos por toda la cara interior, para que la luz te envuelva. Una correa ajustable con hebilla te deja las manos libres para hacer lo que quieras.')}</p></div>
  <div class="px-detail__grid">
    <figure class="px-fig px-fig--big"><img src="${DETAIL.inside}" alt="${T('Inside of the LEZO mask with the LED array lit','Interior de la máscara LEZO con la matriz de LEDs encendida')}" width="766" height="620" loading="lazy"><figcaption><b>01</b>${T('Light all around your face','Luz por todo tu rostro')}</figcaption></figure>
    <figure class="px-fig"><img src="${DETAIL.macro}" alt="${T('Close-up of the individual LEDs','Detalle de los LEDs individuales')}" width="570" height="399" loading="lazy"><figcaption><b>02</b>${T('Every LED, up close','Cada LED, de cerca')}</figcaption></figure>
    <figure class="px-fig"><img src="${DETAIL.strap}" alt="${T('Adjustable strap with buckle','Correa ajustable con hebilla')}" width="495" height="399" loading="lazy"><figcaption><b>03</b>${T('Adjustable strap, hands free','Correa ajustable, manos libres')}</figcaption></figure>
  </div>
  <p class="small px-detail__note">${T('Illustrative reference images. Colors and LED layout are approximate.','Imágenes ilustrativas de referencia. Los colores y la distribución de los LEDs son aproximados.')}</p>`;
  stageEl.after(s);
}
function stageInit(){
  const anchor=document.querySelector('main .px-marquee')||document.querySelector('main .trustbar')?.closest('.wrap');
  if(document.querySelector('.px-stage')||!anchor||document.querySelector('.care-page'))return;
  const sec=document.createElement('section');sec.className='px-stage';sec.id='mask3d';sec.setAttribute('aria-label',T('Interactive 3D mask','Máscara 3D interactiva'));
  sec.innerHTML=stageMarkup();
  anchor.after(sec);
  if(reduced)root.classList.add('px-reduced');
  stage=new Stage(sec);
}

/* ---------------- page transitions ---------------- */
function chrome(){
  if(!document.querySelector('.px-progress')){
    document.body.insertAdjacentHTML('beforeend','<div class="px-progress" aria-hidden="true"></div><div class="px-leave" aria-hidden="true"></div>');
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
  tabFunctions();marquee();stageInit();detailSection();shipSection();stickyShip();decorate();heroTilt();magnetic();
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

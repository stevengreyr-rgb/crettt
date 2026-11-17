// Compose ad-style gallery slides: real photo + headline + function callout + stat.
// usage: node compose.js <photosDir> <outDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, photos, out] = process.argv;
const S = [
  { f:'01', h1:'Glow without<br>the', em:'appointment.', pos:'l', y:26.5,
    p:'LED mask, eye wand and collagen duo. A full light ritual at home, in one box.', big:'3-in-1', small:'One box,<br>one ritual' },
  { f:'02', h1:'Hands free.<br>Eyes', em:'closed.', pos:'l', y:60, dark:false,
    p:'Strap it on, pick a light and rest. The mask does the work while you unwind.', big:'20', unit:'min', small:'The whole<br>evening ritual' },
  { f:'03', h1:'Light for every<br>', em:'contour.', pos:'r', y:60,
    p:'A slim LED wand with a chrome head shaped for the delicate skin around the eyes.', big:'USB', small:'Rechargeable,<br>pink or black' },
  { f:'04', h1:'Prep. Light.<br>', em:'Seal.', pos:'l', y:58,
    p:'Gel pads before the light, a few drops of ampoule after. Collagen or ceramide.', big:'2', unit:'steps', small:'Hydration<br>around the light' },
  { f:'05', h1:'Seven lights.<br>One', em:'ritual.', pos:'r', y:52, dark:true, dots:true,
    p:'Red, blue, green, yellow, purple, cyan and white, on the mask and on the wand.', big:'7', small:'Light colors,<br>mask + wand' },
  { f:'06', h1:'Everything in<br>one', em:'box.', pos:'r', y:30, list:true,
    p:'', big:'Free', small:'Tracked US<br>shipping' },
];
const dots = ['#d8352f','#2f6fd8','#3aa45a','#e8c43a','#8a4fc8','#3cc4cf','#f4f4f1'];
const html = (s, img) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@1,6..96,500&family=Jost:wght@400;500&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:1600px;height:2000px;overflow:hidden;font-family:Jost,sans-serif;--ink:${s.dark?'#fff':'#1D2236'};--soft:${s.dark?'rgba(255,255,255,.85)':'#3d4656'};color:var(--ink)}
.ph{position:absolute;inset:0;background:url('${img}') center/cover}
.fade{position:absolute;inset:0 0 auto 0;height:46%;background:linear-gradient(${s.dark?'rgba(10,12,22,.55)':'rgba(255,255,255,.38)'},transparent)}
.logo{position:absolute;top:70px;right:84px;font:500 34px Jost;letter-spacing:.42em}
.kick{position:absolute;top:76px;left:84px;font:400 24px Jost;letter-spacing:.3em;text-transform:uppercase;color:var(--soft)}
h1{position:absolute;top:150px;left:76px;font:500 152px/0.98 Jost;letter-spacing:-.035em}
h1 em{font:italic 500 176px/0.9 'Bodoni Moda',serif;letter-spacing:-.01em;color:${s.dark?'#ff8f86':'#7a2436'}}
.call{position:absolute;${s.pos==='r'?'right:84px':'left:84px'};top:${s.y}%;width:440px}
.call p{font:400 36px/1.32 Jost;color:var(--soft);margin-bottom:34px}
.stat{display:flex;align-items:flex-end;gap:16px}
.stat b{font:500 128px/0.85 Jost;letter-spacing:-.04em}
.stat i{font:500 52px/1 Jost;font-style:normal;margin-right:4px}
.stat span{font:400 24px/1.25 Jost;color:var(--soft);padding-bottom:6px}
.dots{display:flex;gap:12px;margin:0 0 34px}.dots i{width:30px;height:30px;border-radius:50%;background:var(--c);box-shadow:0 0 18px var(--c)}
.list{list-style:none;padding:0;margin:0 0 40px}.list li{font:400 32px/1.3 Jost;padding:18px 0;border-top:1.5px solid rgba(29,34,54,.25)}
.list li small{display:block;font:400 21px Jost;letter-spacing:.24em;color:var(--soft);margin-bottom:4px}
.call.bg{background:rgba(255,255,255,.72);backdrop-filter:blur(6px);padding:36px 38px}
</style></head><body><div class="ph"></div><div class="fade"></div>
<div class="kick">${s.f} / 06</div><div class="logo">SEVENCRUSH</div>
<h1>${s.h1} <em>${s.em}</em></h1>
<div class="call${s.list?' bg':''}">
${s.dots?`<div class="dots">${dots.map(c=>`<i style="--c:${c}"></i>`).join('')}</div>`:''}
${s.list?`<ul class="list"><li><small>01</small>LEZO LED face mask</li><li><small>02</small>Booster Pro eye wand</li><li><small>03</small>Gel pads + ampoule</li></ul>`:`<p>${s.p}</p>`}
<div class="stat"><b>${s.big}</b>${s.unit?`<i>${s.unit}</i>`:''}<span>${s.small}</span></div></div>
</body></html>`;
(async()=>{
  const b = await chromium.launch(); const pg = await b.newPage({viewport:{width:1600,height:2000}});
  const only = process.env.ONLY;
  for (const s of S) {
    if (only && !only.split(',').includes(s.f)) continue;
    const src = path.resolve(photos, s.f + '.png'); if (!fs.existsSync(src)) { console.log('skip', s.f); continue; }
    const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
    await pg.setContent(html(s, data), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.resolve(out, `sc-slide-${s.f}.jpg`), type: 'jpeg', quality: 88 });
    console.log('ok', s.f);
  }
  await b.close();
})();

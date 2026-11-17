// Home hero: photo -> type -> optional cutout on top (mobile depth).
// usage: node compose-hero.js d|m photo.png cut.png|- out.jpg
const { chromium } = require('playwright'); const fs = require('fs');
const [,, mode, photo, cut, out] = process.argv;
const d = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const D = mode === 'd'; const W = D ? 2400 : 1600, H = D ? 1350 : 2000;
const css = `*{margin:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;position:relative;background:#14060c}
.l{position:absolute;inset:0;background:center/cover no-repeat}
.gold{padding-bottom:.22em!important;margin-bottom:-.22em;background:linear-gradient(100deg,#c98f78 0%,#f3d3bf 38%,#d7a089 60%,#f6dccb 82%,#c48a73 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.k{font:500 ${D?24:30}px/1 'Jost',sans-serif;letter-spacing:.5em;text-transform:uppercase;color:#e9cbbb;opacity:.9}
.t1{font:300 ${D?250:300}px/.8 'Jost',sans-serif;letter-spacing:-.035em;color:#f7ebe4;text-transform:uppercase}
.t2{font:italic 500 ${D?300:350}px/.8 'Bodoni Moda',serif;letter-spacing:-.02em}
.rule{width:${D?120:140}px;height:2px;background:#d9a68f;opacity:.8}
.s{font:400 ${D?38:44}px/1.35 'Jost',sans-serif;color:#eadbd3}
.s b{font-weight:500;color:#fff}`;
const body = D ? `
<div class="l" style="background-image:url('${d(photo)}')"></div>
<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,3,7,.55) 0%,rgba(12,3,7,.15) 40%,transparent 60%)"></div>
<div style="position:absolute;left:150px;top:190px;display:flex;flex-direction:column;gap:0">
  <p class="k" style="margin-bottom:56px">The Air Collection</p>
  <p class="t1">Black</p>
  <p class="t2 gold" style="margin:-6px 0 0 70px;padding-right:40px">Friday</p>
  <div style="display:flex;align-items:center;gap:28px;margin-top:64px"><span class="rule"></span>
  <p class="s"><b>30% off</b> air styling &amp; gaming</p></div>
</div>` : `
<div class="l" style="background-image:url('${d(photo)}')"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,3,7,.35) 0%,transparent 30%,transparent 62%,rgba(12,3,7,.85) 100%)"></div>
<div style="position:absolute;left:0;right:0;top:80px;text-align:center">
  <p class="k" style="margin-bottom:40px">The Air Collection</p>
  <p class="t1" style="font-size:230px">Black</p>
</div>
<p class="t2 gold" style="position:absolute;left:0;right:0;top:330px;text-align:center;font-size:300px;padding:0 30px .22em">Friday</p>
${cut!=='-'?`<div class="l" id="cut" style="background-image:url('${d(cut)}')"></div>`:''}
`;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@1,6..96,500&family=Jost:wght@300;400;500&display=block" rel="stylesheet">
<style>${css}</style></head><body>${body}</body></html>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:W,height:H}});
await pg.setContent(html,{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);
await pg.screenshot({path:out,type:'jpeg',quality:94});await b.close();console.log('ok',out)})();

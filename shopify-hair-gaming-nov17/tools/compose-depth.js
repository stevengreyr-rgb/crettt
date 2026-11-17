// Ad slide with depth: photo (bg) -> giant headline -> model cutout on top -> callout.
// usage: node compose-depth.js <photo.png> <cutout.png> <out.jpg> <json>
const { chromium } = require('playwright'); const fs = require('fs');
const [,, photo, cut, out, js] = process.argv; const s = JSON.parse(js);
const d = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@1,6..96,500&family=Jost:wght@400;500&family=Inter+Tight:wght@500&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}
body{width:1600px;height:2000px;overflow:hidden;position:relative;font-family:Jost,sans-serif;color:#1D2236}
.l{position:absolute;inset:0;background:center/cover no-repeat}
h1{position:absolute;left:-14px;right:-14px;top:${s.top||150}px;text-align:center;font:500 ${s.size||300}px/0.86 'Inter Tight',sans-serif;letter-spacing:-.055em;color:#6e1f30;white-space:nowrap}
h1 em{font:italic 500 ${(s.size||300)*1.12}px/0.8 'Bodoni Moda',serif;letter-spacing:-.01em}
h1 .r2{display:block;text-align:${s.align2||'right'};padding:0 60px}
h1 .r1{display:block;text-align:left;padding:0 30px}
.logo{position:absolute;top:56px;right:70px;font:500 34px Jost;letter-spacing:.42em}
.call{position:absolute;${s.cl?"left:64px":"right:44px"};top:${s.cy||58}%;width:${s.cw||400}px}
.call p{font:400 31px/1.3 Jost;color:#3d4656;margin-bottom:26px}
.st{display:flex;white-space:nowrap;align-items:flex-end;gap:14px;${s.stack?"flex-direction:column;align-items:flex-start;gap:10px;":""}}.st b{font:500 ${s.bs||120}px/.82 'Inter Tight';letter-spacing:-.05em;color:#1D2236}.st i{font:500 50px/1 'Inter Tight';font-style:normal}
.st span{font:400 23px/1.2 Jost;color:#3d4656;padding-bottom:4px}
.pan{background:rgba(255,255,255,.78);backdrop-filter:blur(8px);padding:28px 30px;width:${(s.cw||400)+60}px!important}.nm{display:flex;align-items:flex-end;gap:6px}</style></head><body>
<div class="l" style="background-image:url('${d(photo)}')"></div>
<h1><span class="r1">${s.l1}</span><span class="r2">${s.l2}</span></h1>
<div class="l" style="background-image:url('${d(cut)}')"></div>

<div class="call${s.panel?' pan':''}"><p>${s.p}</p><div class="st"><div class="nm"><b>${s.big}</b>${s.unit?`<i>${s.unit}</i>`:''}</div><span>${s.small}</span></div></div>
</body></html>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:2000}});
await pg.setContent(html,{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);
await pg.screenshot({path:out,type:'jpeg',quality:90});await b.close();console.log('ok',out)})();

# v3 carousels: 3 model slides (varied poses) + 2 slides from real product photos, per product.
import json, subprocess, os
from PIL import Image
R = os.path.dirname(os.path.abspath(__file__)); V = os.path.join(R, '..', 'v3'); OUT = os.path.join(R, '..', 'final')
os.makedirs(OUT, exist_ok=True)
def top_of(cut):
    a = Image.open(cut).split()[-1].resize((400, 500))
    return next(y for y in range(500) if max(a.getpixel((x, y)) for x in range(400)) > 128) * 4
def model(name, key, cfg, target=440, dy=None):
    ph, cut = f'{V}/{key}.png', f'{V}/{key}-cut.png'
    if dy is None: dy = max(0, target - top_of(cut))
    subprocess.run(['python3', f'{R}/prep.py', ph, cut, str(dy), f'{V}/{key}-s.png', f'{V}/{key}-cut-s.png', '560'], check=True)
    c = dict(size=200, top=70, cy=31, cw=270, stack=1, bs=110); c.update(cfg)
    subprocess.run(['node', f'{R}/compose-depth.js', f'{V}/{key}-s.png', f'{V}/{key}-cut-s.png', f'{OUT}/{name}.jpg', json.dumps(c)], check=True)
def product(name, canvas, cfg):
    canvas.convert('RGB').save(f'{V}/{name}-canvas.png'); Image.new('RGBA', (1600, 2000)).save(f'{V}/empty.png')
    c = dict(size=170, top=70, cy=31, cw=300, stack=1, bs=110); c.update(cfg)
    subprocess.run(['node', f'{R}/compose-depth.js', f'{V}/{name}-canvas.png', f'{V}/empty.png', f'{OUT}/{name}.jpg', json.dumps(c)], check=True)
def on(bg, img, box):  # paste img fitted into box (x,y,w,h), bottom-centered
    cv = Image.new('RGB', (1600, 2000), bg); im = img.convert('RGBA')
    x, y, w, h = box; s = min(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    cv.paste(im, (x + (w - im.width) // 2, y + h - im.height), im); return cv

# ---------- AirSleek ----------
model('airsleek-1', 'as1', dict(l1='Wet to sleek,', l2='in <em>one pass.</em>',
      p='Air flows through the plates, so hair dries and smooths without extreme heat.', big='2-in-1', small='Dryer + straightener', cl=0))
model('airsleek-2', 'as2', dict(l1='No extreme heat.', l2='Just <em>shine.</em>', size=185, cl=1,
      p='Negative ions and controlled air leave hair smooth and glossy.', big='Ion', small='Negative ion care'))
model('airsleek-3', 'as3', dict(l1='Heat that', l2='<em>stays gentle.</em>', cl=0, cy=33,
      p='Thermostatic control holds it steady, never above 160 °C, to help protect your hair.', big='160', unit='°C', small='Maximum heat'))
pl = Image.open(f'{V}/as-plates-2k.png').convert('RGB')
product('airsleek-4', on(pl.getpixel((8, 8)), pl, (330, 640, 1270, 1360)), dict(l1='Air through', l2='the <em>plates.</em>', cl=1, cy=36, cw=270,
      p='Vents along each plate push warm air through the hair as you straighten, so it dries and smooths at once.', big='Wet', unit='+ dry', small='Use after the towel or on dry hair'))
asw = Image.open(f'{V}/as-white-4k.png'); asw = asw.crop(asw.split()[-1].getbbox() if asw.mode == 'RGBA' else asw.convert('L').point(lambda v: 255 if v < 245 else 0).getbbox())
product('airsleek-5', on((255, 255, 255), asw, (560, 560, 1000, 1400)), dict(l1="What's in", l2='the <em>box.</em>', cl=1, cy=33, cw=380,
      list=[['AirSleek 2-in-1', 'Straightener and dryer in one'], ['360° swivel cord', '1.8 m, turns as you style'], ['Dual voltage', '100–240 V, US or EU plug']]))

# ---------- AirWave ----------
model('airwave-1', 'aw1', dict(l1='Curls with air,', l2='not <em>extreme heat.</em>', size=165, cl=1,
      p='Air wraps each section around the barrel. Set the curl with the cool shot.', big='1500', unit='W', small='High-speed motor'))
model('airwave-2', 'aw2', dict(l1='Defined curls,', l2='less <em>frizz.</em>', cl=0,
      p='The diffuser spreads gentle airflow through natural curls to dry them without blowing them apart.', big='Air', small='Gentle, even drying', panel=1, cy=29))
model('airwave-3', 'aw3', dict(l1='Volume', l2='from the <em>root.</em>', cl=0,
      p='The round brush lifts at the roots and leaves soft bends at the ends, in one step.', big='2-in-1', small='Dries + volumizes'))
at = Image.open(f'{V}/aw-attach-2k.png').convert('RGB')
product('airwave-4', on(at.getpixel((8, 8)), at, (300, 600, 1300, 1400)), dict(l1='Click on,', l2='<em>switch styles.</em>', cl=1, cy=34, cw=270,
      list=[['Conical barrel', 'Wraps hair with air for curls'], ['Round brush', 'Lift and soft bends'], ['Wide-tooth comb', 'Smooths thick hair as it dries']]))
aww = Image.open(f'{V}/aw-white.jpg').convert('RGB'); aww = aww.crop((386, 82, 1216, 1916))
product('airwave-5', on((255, 255, 255), aww, (620, 520, 940, 1440)), dict(l1='Everything', l2='<em>included.</em>', cl=1, cy=33, cw=380,
      list=[['6 attachments', 'Curl, diffuse, dry, smooth, volumize, comb'], ['Presentation case', 'Keeps every piece together'], ['Cool shot', 'Sets the style when you finish']]))

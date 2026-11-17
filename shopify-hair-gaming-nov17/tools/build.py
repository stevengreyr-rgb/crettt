# Build depth slides: python3 tools/build.py <product> [n,n]
# Moves the model so the hair only grazes the 2nd headline line, and puts the side copy
# on the side with free backdrop (frosted panel if neither side is free).
import json, sys, subprocess, os
from PIL import Image
prod = sys.argv[1]; only = sys.argv[2].split(',') if len(sys.argv) > 2 else None
root = os.path.dirname(os.path.abspath(__file__)); base = os.path.join(root, '..', prod + '-carousel')
TARGET = 440  # top of hair (widest band) after shift, in px of 2000
def cover(a, x0, x1, y0, y1):
    box = a.crop((x0, y0, x1, y1)).point(lambda v: 255 if v > 100 else 0)
    px = list(box.get_flattened_data()) if hasattr(box, 'get_flattened_data') else list(box.getdata())
    return sum(px) / 255 / ((x1 - x0) * (y1 - y0))
for s in json.load(open(os.path.join(root, 'slides.json')))[prod]:
    n = s['n']
    if only and n not in only: continue
    d = os.path.join(base, 'depth'); cut = f'{d}/{n}-cut.png'
    a = Image.open(cut).split()[-1].resize((400, 500))
    top = next(y for y in range(500) if max(a.getpixel((x, y)) for x in range(90, 310)) > 128) * 4
    dy = max(0, TARGET - top)
    subprocess.run(['python3', f'{root}/prep.py', f'{d}/{n}.png', cut, str(dy), f'{d}/{n}-s.png', f'{d}/{n}-cut-s.png'], check=True)
    A = Image.open(f'{d}/{n}-cut-s.png').split()[-1]
    cfg = dict(size=200, top=70, cy=31, cw=250, stack=1, bs=110); cfg.update(s)
    y0, y1 = int(2000 * cfg['cy'] / 100), int(2000 * cfg['cy'] / 100) + 330
    L, R = cover(A, 64, 334, y0, y1), cover(A, 1300, 1556, y0, y1)
    cfg['cl'] = 1 if L <= R else 0
    if min(L, R) > 0.04: cfg['panel'] = 1
    print(n, 'dy', dy, 'left', round(L, 2), 'right', round(R, 2), 'panel', cfg.get('panel', 0))
    subprocess.run(['node', f'{root}/compose-depth.js', f'{d}/{n}-s.png', f'{d}/{n}-cut-s.png', f'{base}/{prod}-{n}.jpg', json.dumps(cfg)], check=True, stdout=subprocess.DEVNULL)

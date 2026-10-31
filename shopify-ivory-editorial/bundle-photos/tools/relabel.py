import numpy as np
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/inter/Inter-Regular.otf'
def erase(im, x0, y0, x1, y1, top_only=False):
    top = im[y0 - 3, x0:x1].copy(); bot = top if top_only else im[y1 + 3, x0:x1].copy()
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        im[y, x0:x1] = top * (1 - t) + bot * t
def write(img, x, ycap, text, cap, color=(38, 38, 44), maxw=None):
    size = cap / .727
    f = ImageFont.truetype(F, round(size * 4))
    w = int(f.getlength(text)) + 20; h = int(size * 4 * 1.6)
    layer = Image.new('L', (w, h), 0); d = ImageDraw.Draw(layer)
    asc = f.getmetrics()[0]
    d.text((0, 0), text, font=f, fill=255)
    capt = asc - cap * 4
    tw = (f.getlength(text) / 4)
    sx = min(1, maxw / tw) if maxw else 1
    layer = layer.resize((max(1, int(w / 4 * sx)), h // 4), Image.LANCZOS)
    a = np.asarray(layer).astype(float) / 255 * .92
    oy = int(round(ycap - capt / 4))
    reg = img[oy:oy + a.shape[0], x:x + a.shape[1]]
    a = a[:reg.shape[0], :reg.shape[1]]
    reg[:] = reg * (1 - a[..., None]) + np.array(color) * a[..., None]
def cera(im):
    erase(im, 826, 740, 912, 759, True)
    erase(im, 1285, 621, 1412, 653)
    erase(im, 1285, 704, 1400, 733)
    write(im, 830, 744, 'CERA-NOL', 12)
    write(im, 1288, 623, 'HYDRO', 11)
    write(im, 1288, 639, 'CERA-NOL AMPOULE', 11, maxw=118)
    write(im, 1288, 707, 'Moisturizing,', 9)
    write(im, 1288, 721, 'Strengthening', 9)
    return im

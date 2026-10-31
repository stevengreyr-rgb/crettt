import numpy as np
from PIL import Image, ImageFilter
from fit import comp
def place(scene_path, sx, sy, ox, oy, out=None):
    S = Image.open(scene_path).convert('RGB')
    pk = Image.open('img/sk-cut-booster-pink.png')
    _, _, c = comp(pk, sx, sy)
    # soften the cutout edge by half a pixel so it sits in the photo
    a = c.split()[3].filter(ImageFilter.GaussianBlur(.6))
    c.putalpha(a)
    S.paste(c, (ox, oy), c)
    return S

def place_clean(scene_path, sx, sy, ox, oy):
    S0 = np.asarray(Image.open(scene_path).convert('RGB')).astype(float)
    pk = Image.open('img/sk-cut-booster-pink.png')
    _, _, c = comp(pk, sx, sy)
    al = np.zeros(S0.shape[:2]); ca = np.asarray(c)[..., 3] / 255.
    al[oy:oy + ca.shape[0], ox:ox + ca.shape[1]] = ca
    ys, xs = np.nonzero(al > .5); x0, x1, y0, y1 = xs.min() - 10, xs.max() + 10, ys.min() - 10, ys.max() + 10
    L = S0.mean(2); sat = S0.max(2) - S0.min(2)
    dark = (L < 200) & (sat < 60)
    S = S0.copy()
    # fill the old wand's leftover rim with the background from just outside it, row by row
    for y in range(y0, y1):
        row = dark[y] | (al[y] > .02)
        for x in range(x0, x1):
            if dark[y, x] and al[y, x] < .98:
                for d in range(1, 25):
                    for xx in (x + d, x - d):
                        if x0 - 20 <= xx < x1 + 20 and not row[xx]:
                            S[y, x] = S0[y, xx]; break
                    else:
                        continue
                    break
    # whatever is still near-black under the wand (the old base) takes the plinth color from below
    yb = ys.max()
    for y in range(yb - 6, yb + 14):
        for x in range(x0, x1):
            if al[y, x] < .5 and S[y, x].mean() < 150:
                for d in range(1, 30):
                    if S[y + d, x].mean() >= 170: S[y, x] = S[y + d, x]; break
    # soft contact shadow where the base meets the plinth
    from PIL import ImageDraw
    xs_b = np.nonzero(al[yb - 4] > .5)[0]
    sh = Image.new('L', (S.shape[1], S.shape[0]), 0); dr = ImageDraw.Draw(sh)
    dr.ellipse((xs_b.min() - 10, yb - 6, xs_b.max() + 10, yb + 12), fill=255)
    sh = np.asarray(sh.filter(ImageFilter.GaussianBlur(6))).astype(float) / 255 * .5
    S = S * (1 - sh[..., None]) + np.array([150, 145, 145.]) * sh[..., None]
    base = Image.fromarray(S.clip(0, 255).astype('uint8'))
    a = c.split()[3].filter(ImageFilter.GaussianBlur(.6)); c.putalpha(a)
    base.paste(c, (ox, oy), c)
    return base

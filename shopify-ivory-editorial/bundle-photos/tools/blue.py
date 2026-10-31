import numpy as np, colorsys
from PIL import Image
def blue(im, boxes):
    for x0,y0,x1,y1 in boxes:
        r = im[y0:y1, x0:x1] / 255.
        mx = r.max(2); mn = r.min(2); d = mx - mn + 1e-6
        R,G,B = r[...,0], r[...,1], r[...,2]
        h = np.where(mx == R, ((G - B) / d) % 6, np.where(mx == G, (B - R) / d + 2, (R - G) / d + 4)) * 60
        s = d / (mx + 1e-6); v = mx
        dist = np.minimum(abs(h - 352), 360 - abs(h - 352))
        w = np.clip((30 - dist) / 12, 0, 1) * np.clip((s - .04) / .06, 0, 1)
        nh = 217 / 60.; ns = np.clip(s * 1.3, 0, 1); nv = v * .93
        i = np.floor(nh); f = nh - i
        p = nv * (1 - ns); q = nv * (1 - ns * f); t = nv * (1 - ns * (1 - f))
        # hue 217 -> sector 3 (i=3): (p, q, v)
        out = np.stack([p, q, nv], -1)
        r[:] = r * (1 - w[..., None]) + out * w[..., None]
        im[y0:y1, x0:x1] = r * 255
    return im

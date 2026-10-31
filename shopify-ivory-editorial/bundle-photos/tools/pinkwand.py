import sys, numpy as np
from PIL import Image
def pink(src, box, disp, top=None):
    im = src if isinstance(src, np.ndarray) else np.asarray(Image.open(src).convert('RGB')).astype(float)
    if top:
        tx0,ty0,tx1,ty1 = top; t_ = im[ty0:ty1, tx0:tx1]; Lt = t_.mean(2); st = t_.max(2)-t_.min(2)
        at = np.clip((80 - Lt)/50,0,1)*np.clip((45-st)/20,0,1); tt = np.clip((Lt-8)/105,0,1)[...,None]**.8
        sh = np.array([206,150,160.])*(1-tt)+np.array([252,230,233.])*tt
        t_[:] = t_*(1-at[...,None]) + sh*at[...,None]
    x0,y0,x1,y1 = box
    r = im[y0:y1, x0:x1]
    L = r.mean(2); sat = r.max(2) - r.min(2)
    a = np.clip((175 - L) / 120, 0, 1) * np.clip((45 - sat) / 20, 0, 1)
    yy, xx = np.mgrid[y0:y1, x0:x1]
    cx, cy, rx, ry = disp
    a[((xx-cx)/rx)**2 + ((yy-cy)/ry)**2 < 1] = 0
    t = np.clip((L - 8) / 105, 0, 1)[..., None] ** .8
    dark = np.array([206,150,160.]); light = np.array([252,230,233.])
    shade = dark * (1 - t) + light * t
    r[:] = r * (1 - a[..., None]) + shade * a[..., None]
    return im

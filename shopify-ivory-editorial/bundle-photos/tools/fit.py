import numpy as np
from PIL import Image
def comp(cut, sx, sy):
    w, h = cut.size
    c = cut.resize((max(1, round(w * sx)), max(1, round(h * sy))), Image.LANCZOS)
    a = np.asarray(c).astype(float); al = a[..., 3:4] / 255
    return a[..., :3] * al + 255 * (1 - al), al[..., 0], c
def fit(scene_path, xl, xr, yb):
    S = np.asarray(Image.open(scene_path).convert('RGB')).astype(float)
    blk = Image.open('img/sk-cut-booster-black.png')
    best = None
    s0 = (xr - xl + 1) / 207
    for sx in np.linspace(s0 * .96, s0 * 1.04, 9):
        for sy in np.linspace(s0 * .85, s0 * 1.1, 26):
            rgb, al, _ = comp(blk, sx, sy)
            ox0 = xl - 346 * sx; oy0 = yb - 1155 * sy
            for dx in range(-3, 4):
                for dy in range(-6, 7):
                    ox, oy = int(round(ox0 + dx)), int(round(oy0 + dy))
                    y1, x1 = oy + rgb.shape[0], ox + rgb.shape[1]
                    reg = S[oy:y1, ox:x1]
                    m = al > .5
                    e = ((reg - rgb) ** 2).sum(2)[m].mean()
                    if best is None or e < best[0]: best = (e, sx, sy, ox, oy)
    return best
if __name__ == '__main__':
    print('complete', fit('kit/sc-white-complete-final.png', 248, 365, 757))
    print('daily', fit('kit/sc-white-daily-final.png', 1073, 1196, 816))

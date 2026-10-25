"""High-quality rebuild of creatives A and B from the 2K Higgsfield product stills.

Same copy, timing, overlays and soundtrack as creatives.py; only the picture source changes:
  A  "Front 3D"   - one 2K front shot, recoloured per light (identical geometry), with a
                    perspective yaw swing on every light change instead of the 720p spin.
  B  "Glow Macro" - the real 2K shots per light (red macro, blue eyes, green nose/mouth,
                    purple rim), then the front shot cycling colours under the offer.
Usage: python3 hq.py [a|b]
"""
import sys
import numpy as np
import cv2

import creatives as C
from creatives import W, H, LIGHTS, SEG, END_AT, CTA_AT, END_CYCLE, TOTAL, ease, burst, punch, overlay, finish
import render_video as RV

HF = C.ROOT.parent / 'hf'
BG = 254.0


def load(name):
    return cv2.cvtColor(cv2.imread(str(HF / name)), cv2.COLOR_BGR2RGB).astype(np.float32)


def matte(rgb, cut=True):
    """Premultiplied RGBA cut-out of a product shot on white; `cut` drops the floor reflection."""
    d = 254 - rgb.min(2)
    sil = cv2.morphologyEx((d > 8).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(sil)
    sil = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    inv = (1 - sil).copy(); ff = np.zeros((sil.shape[0] + 2, sil.shape[1] + 2), np.uint8)
    for seed in [(0, 0), (sil.shape[1] - 1, 0), (0, sil.shape[0] - 1), (sil.shape[1] - 1, sil.shape[0] - 1)]:
        if inv[seed[1], seed[0]]:
            cv2.floodFill(inv, ff, seed, 2)
    sil = (inv != 2).astype(np.float32)                                  # silhouette with holes filled
    if cut:
        rows = sil.sum(1); lo, hi = int(len(rows) * 0.72), int(len(rows) * 0.86)
        chin = lo + int(np.argmin(rows[lo:hi])); sil[chin:] = 0
    a = cv2.GaussianBlur(sil, (0, 0), 1.3)
    return a


def rgba(rgb, a):
    return np.dstack([rgb * a[..., None], a])


ROOM = cv2.cvtColor(cv2.imread(str(C.ROOT.parent / 'room.png')), cv2.COLOR_BGR2RGB).astype(np.float32)
ROOM_SOFT = cv2.GaussianBlur(ROOM, (0, 0), 9)
FLOOR = C.blob(W / 2, 1490, 330, 42)


def comp(bg, fg):
    return bg * (1 - fg[..., 3:4]) + fg[..., :3]


def glow_weight(rgb):
    hsv = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    w = np.clip((hsv[..., 1] - 22) / 50, 0, 1)
    return cv2.GaussianBlur(w, (0, 0), 1.2)


def lab_angle(rgb):
    c = np.array([[rgb]], np.float32) / 255
    l = cv2.cvtColor(c, cv2.COLOR_RGB2LAB)[0, 0]
    return np.arctan2(l[2], l[1])


def recolor(rgb, w, target, chroma=1.0):
    """Rotate the glow's LAB hue to `target` RGB; target None = LEDs off (neutral shell)."""
    lab = cv2.cvtColor(rgb / 255, cv2.COLOR_RGB2LAB)
    L, A, B = lab[..., 0], lab[..., 1], lab[..., 2]
    m = w > 0.6
    base = np.median(np.arctan2(B[m], A[m]))
    if target is None:
        nA, nB = A * 0.0, B * 0.0
        L = L + (96 - L) * 0.55 * w                                     # unlit: pale shell, no glow
    else:
        d = lab_angle(target) - base; c, s = np.cos(d), np.sin(d)
        nA, nB = (A * c - B * s) * chroma, (A * s + B * c) * chroma
    out = cv2.cvtColor(np.dstack([L, nA, nB]).astype(np.float32), cv2.COLOR_LAB2RGB) * 255
    return rgb * (1 - w[..., None]) + out * w[..., None]


TARGETS = [(225, 18, 50), None, (40, 215, 90), (160, 70, 245)]          # None = keep native blue


def front_plates():
    blue = load('g_65cab583.png')
    w = glow_weight(blue)
    a = matte(blue)
    plates = [rgba(blue if t is None else recolor(blue, w, t, 1.05), a) for t in TARGETS]
    off = rgba(recolor(blue, w, None), a)
    return plates, off


def weights_at(t, changes, n=4):
    w = np.zeros(n, np.float32); w[changes[0][1]] = 1
    for t0, i in changes[1:]:
        k = ease((t - t0) / 0.25)
        w *= 1 - k; w[i] += k
    return w


def homography(src_pt, dst_pt, scale, yaw_deg=0.0, roll_deg=0.0, f=1700.0):
    """Map source pixels to the frame: scale about src_pt, place at dst_pt, then yaw/roll in 3D."""
    sx, sy = src_pt; dx, dy = dst_pt
    T = np.array([[scale, 0, dx - scale * sx], [0, scale, dy - scale * sy], [0, 0, 1]], np.float64)
    a, r = np.radians(yaw_deg), np.radians(roll_deg)
    R = np.array([[np.cos(a), 0, np.sin(a)], [0, 1, 0], [-np.sin(a), 0, np.cos(a)]])
    R = R @ np.array([[np.cos(r), -np.sin(r), 0], [np.sin(r), np.cos(r), 0], [0, 0, 1]])
    K = np.array([[f, 0, dx], [0, f, dy], [0, 0, 1]])
    return K @ R @ np.linalg.inv(K) @ T


def warp(img, Hm):
    return cv2.warpPerspective(img, Hm, (W, H), flags=cv2.INTER_AREA if Hm[0, 0] < 0.9 else cv2.INTER_CUBIC,
                               borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))


# ---------------------------------------------------------------- A: front 3D
def creative_a():
    plates, off = front_plates()
    spins = [0.0, 3.0, 6.0, 9.0, END_AT]
    changes = [(0.0, 0), (3.5, 1), (6.5, 2), (9.5, 3)] + [(tc, k % 4) for k, tc in enumerate(END_CYCLE)] + [(CTA_AT - 0.25, 0)]
    segs = [(s + 1.0, s + SEG) for s in spins[:4]]
    lands = [(1.0, 1.0), (4.0, 1.0), (7.0, 1.0), (10.0, 1.0)] + [(tc, 0.5) for tc in END_CYCLE] + [(CTA_AT, 0.8)]
    MASK_C = (868.0, 1040.0)                                            # mask centre in the 2K plate
    base_scale = 860 / 1455

    def frame(t):
        w = weights_at(t, changes)
        _, sw = C.tint_at(t, changes)
        yaw = 7.0 * np.sin(2 * np.pi * t / 6.0)                          # slow 3D sway
        roll = 1.5 * np.sin(2 * np.pi * t / 6.0 + 1.0)
        lift = 0.0
        for s in spins:                                                  # swing round toward camera on each light
            if s <= t < s + 1.0:
                u = (t - s); e = ease(u)
                yaw += 28 * (1 - e) * np.cos(np.pi * e * 0.5) * (1 if int(s / 3) % 2 == 0 else -1)
                lift = 0.10 * np.sin(np.pi * u)
        bob = 14 * np.sin(t * 1.3)
        zoom = base_scale * (0.94 + 0.06 * ease(t / 1.0)) * (1 + lift) * (1 + 0.04 * ((t % SEG) / SEG)) * punch(t, lands, 0.06)
        Hm = homography(MASK_C, (W / 2, 820 + bob), zoom, yaw, roll)
        lit = 0.0 if t < 0.85 else (0.4 + 0.2 * np.sin((t - 0.85) * 120) if t < 0.95 else min(1.0, 0.55 + (t - 0.95) * 3))
        a = None
        for i in np.nonzero(w > 1e-3)[0]:
            f = warp(plates[i], Hm) * w[i]
            a = f if a is None else a + f
        if lit < 1:
            a = warp(off, Hm) * (1 - lit) + a * lit
        col = np.array(sw, np.float32)
        bg = ROOM * (1 - (0.16 * (1 - 0.4 * lift)) * FLOOR[..., None])  # soft floor shadow under the float
        bg = bg + (col - bg) * (0.10 * lit * C.HALO + 0.30 * lit * FLOOR)[..., None]   # LED light on wall + floor
        a = comp(bg, a)
        a = burst(a, t, lands, sw, W / 2, 820 + bob)
        return finish(a, overlay(t, segs, sw, hook=True), t)

    chimes = [(4.0, 1), (7.0, 2), (10.0, 3)]
    return frame, chimes, 0.95


# ---------------------------------------------------------------- B: glow macro
def creative_b():
    plates, off = front_plates()
    red_macro = load('g_e227dcfc.png')
    rm_a = matte(red_macro, cut=False)
    red_off = rgba(recolor(red_macro, glow_weight(red_macro), None), rm_a)
    red_macro = rgba(red_macro, rm_a)
    def cut(name):
        im = load(name); return rgba(im, matte(im))
    shots = [
        # (image, (cx0, cy0, cx1, cy1) in source px, scale0, scale1)  - frame covers W x H at `scale`
        (red_macro, (1060, 880, 980, 870), 1.14, 1.26),                  # red: macro eyes + nose, slow push
        (cut('g_65cab583.png'), (870, 900, 870, 860), 1.05, 1.22),      # blue: close on the eye openings
        (cut('g_ea4ae897.png'), (870, 1420, 870, 1330), 1.02, 1.18),    # green: nose + mouth, rising
        (cut('g_a018bef3.png'), (1330, 1100, 1180, 1050), 1.00, 1.15),  # purple: glowing rim + strap, pan
    ]
    END_SRC = (868.0, 1040.0)
    changes = [(0.0, 0), (3.0, 1), (6.0, 2), (9.0, 3)] + [(tc, k % 4) for k, tc in enumerate(END_CYCLE)] + [(CTA_AT - 0.25, 0)]
    segs = [(0.9, SEG)] + [(s + 0.4, s + SEG) for s in (3.0, 6.0, 9.0)]
    lands = [(0.6, 1.0), (3.0, 1.0), (6.0, 1.0), (9.0, 1.0), (END_AT, 1.0)] + [(tc, 0.5) for tc in END_CYCLE] + [(CTA_AT, 0.8)]
    XFADE = 0.22

    def shot(i, u, t, whip, lit):
        img, (x0, y0, x1, y1), s0, s1 = shots[i]
        e = 1 - (1 - min(max(u, 0), 1)) ** 2
        sc = (s0 + (s1 - s0) * e) * whip
        cx = x0 + (x1 - x0) * e + 8 * np.sin(t * 0.8); cy = y0 + (y1 - y0) * e + 14 * np.sin(t * 1.3)
        Hm = homography((cx, cy), (W / 2, H / 2), sc, 3.0 * np.sin(t * 0.9), 0.8 * np.sin(t * 0.7))
        a = warp(img, Hm)
        if i == 0 and lit < 1:
            a = warp(red_off, Hm) * (1 - lit) + a * lit
        a = comp(ROOM_SOFT, a)
        if whip > 1.02:                                                  # zoom blur while whipping
            k = int(6 * (whip - 1) / 0.35) * 2 + 1
            a = cv2.blur(a, (1, max(k, 1))) * 0.5 + a * 0.5
        return a

    def end_shot(t):
        w = weights_at(t, changes)
        u = ease((t - END_AT) / (TOTAL - END_AT))
        sc = (860 / 1455) * (1.18 - 0.18 * u)
        Hm = homography(END_SRC, (W / 2, 840), sc, 6 * np.sin(t * 0.9), 1.0 * np.sin(t * 0.7))
        a = None
        for i in np.nonzero(w > 1e-3)[0]:
            f = warp(plates[i], Hm) * w[i]; a = f if a is None else a + f
        col = np.array(C.tint_at(t, changes)[1], np.float32)
        bg = ROOM * (1 - 0.14 * FLOOR[..., None])
        bg = bg + (col - bg) * (0.10 * C.HALO + 0.30 * FLOOR)[..., None]
        return comp(bg, a)

    def frame(t):
        _, sw = C.tint_at(t, changes)
        lit = 0.0 if t < 0.5 else (0.4 + 0.2 * np.sin((t - 0.5) * 120) if t < 0.6 else min(1.0, 0.55 + (t - 0.6) * 3))
        bounds = [0.0, 3.0, 6.0, 9.0, END_AT, TOTAL]
        acc, wsum = None, 0.0
        for i in range(5):
            st, en = bounds[i], bounds[i + 1]
            if t < st - XFADE / 2 or t > en + XFADE / 2:
                continue
            wt = 1.0
            if st > 0: wt = min(wt, ease((t - (st - XFADE / 2)) / XFADE))
            if en < TOTAL: wt = min(wt, 1 - ease((t - (en - XFADE / 2)) / XFADE))
            if wt <= 0: continue
            whip = 1.0
            if en < TOTAL: whip += 0.30 * ease((t - (en - 0.22)) / 0.22)
            if st > 0: whip += 0.30 * (1 - ease((t - st) / 0.3))
            whip *= punch(t, lands, 0.035)
            f = end_shot(t) if i == 4 else shot(i, (t - st + XFADE / 2) / (en - st + XFADE), t, whip, lit)
            f = f * wt
            acc = f if acc is None else acc + f; wsum += wt
        a = acc / wsum
        a = burst(a, t, lands, sw, W / 2, 820)
        if any(s0 - 0.1 <= t <= s1 + 0.1 for s0, s1 in segs):           # keep the copy readable on macros
            a = a + (250 - a) * (np.asarray(RV.SCRIM.getchannel('A'), np.float32) / 255 * 0.85)[..., None]
        return finish(a, overlay(t, segs, sw), t)

    chimes = [(3.0, 1), (6.0, 2), (9.0, 3)]
    return frame, chimes, 0.55


if __name__ == '__main__':
    for tag in sys.argv[1:] or ['a', 'b']:
        build = {'a': creative_a, 'b': creative_b}[tag]
        if '--preview' in sys.argv:
            continue
        C.render(tag + 'hq', build)

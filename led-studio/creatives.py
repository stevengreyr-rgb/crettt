"""Two 18 s 3D colour-change creatives for the LED face mask (1080x1920, 30 fps).

  A  "360 Spin"   - the existing Higgsfield turntable clip (clips-src/turn-inside-alpha.mp4)
                    keyed onto a white studio; every light change is a full 360 spin.
  B  "Glow Macro" - the floating hero render, one macro angle per light, light-sweep changes.

Colour scenes carry only the light and its key benefit; the long copy and the offer sit at
the end. Usage:  python3 creatives.py [a|b]   (default: both)
"""
from pathlib import Path
import subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw

import render_video as RV
from render_video import (W, H, FPS, SR, INK, GREY, RED, F_BLACK, F_BOLD, F_SEMI,
                          ease, font, text_sprite, pill, put, rise, led_off,
                          _filt, _add, _note)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'render'; OUT.mkdir(exist_ok=True)
TOTAL = 18.0

# light, glow tint (applied to the red LED excess), text swatch, key benefit (cosmetic wording)
LIGHTS = [('RED LIGHT', (1.0, 0.0, 0.0), RED, 'Firmer-looking skin'),
          ('BLUE LIGHT', (.12, .42, 1.0), (38, 110, 240), 'Clearer-looking skin'),
          ('GREEN LIGHT', (.15, 1.0, .45), (18, 168, 92), 'More even-looking tone'),
          ('PURPLE LIGHT', (.72, .25, 1.0), (140, 64, 222), 'A calm, refreshed look')]
SEG = 3.0                       # one light per 3 s
END_AT = 12.0                   # long copy
CTA_AT = 15.0                   # offer (downbeat)
END_CYCLE = [12.5, 13.0, 13.5, 14.0, 14.5]   # quick colour cycle under the long copy, on the beat


def tint_at(t, changes):
    """Blend the LED tint/swatch through a list of (time, light index) changes."""
    tint, sw = np.array(LIGHTS[changes[0][1]][1], np.float32), np.array(LIGHTS[changes[0][1]][2], np.float32)
    for t0, i in changes[1:]:
        k = ease((t - t0) / 0.25)
        tint = tint + (np.array(LIGHTS[i][1]) - tint) * k
        sw = sw + (np.array(LIGHTS[i][2]) - sw) * k
    return tint.astype(np.float32), tuple(int(c) for c in sw)


def relight(a, tint):
    """Re-colour the red LED glow of an RGB float image to `tint`."""
    if tint[1] < 0.01 and tint[2] < 0.01:
        return a
    e = np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]), 0, None)[..., None]
    a = a.copy(); a[..., :1] -= e
    return a + e * tint


# ---------------------------------------------------------------- studio background
def studio():
    y = np.arange(H, dtype=np.float32)[:, None]
    top, wall, floor = np.array([248, 248, 249.]), np.array([236, 236, 239.]), np.array([244, 244, 246.])
    k = np.clip(y / 1300, 0, 1)[..., None]
    bg = top * (1 - k) + wall * k
    f = ease_arr(np.clip((y - 1300) / 220, 0, 1))[..., None]
    bg = bg * (1 - f) + floor * f
    return np.broadcast_to(bg, (H, W, 3)).astype(np.float32).copy()


def ease_arr(x):
    return 0.5 - 0.5 * np.cos(np.pi * x)


YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


def blob(cx, cy, rx, ry):
    return np.exp(-(((XX - cx) / rx) ** 2 + ((YY - cy) / ry) ** 2))


STUDIO = studio()
SHADOW = blob(W / 2, 1420, 300, 38)
HALO = blob(W / 2, 820, 520, 560)


def backdrop(sw, glow, lift):
    """Studio with a soft contact shadow and an LED-coloured halo + floor bounce."""
    col = np.array(sw, np.float32)
    a = STUDIO.copy()
    a *= 1 - (0.10 * (1 - 0.35 * lift)) * SHADOW[..., None]
    a += (col - a) * (0.10 * glow * HALO)[..., None]
    a += (col - a) * (0.16 * glow * SHADOW)[..., None]
    return a


def burst(a, t, lands, sw, cx, cy):
    """Flash of the new light on each change: soft bloom plus a ring that expands out."""
    col = np.array(sw, np.float32)
    for L, strength in lands:
        k = t - L
        if 0 <= k < 0.8:
            r = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
            rad = 180 + 1300 * ease(k / 0.8)
            ring = np.exp(-((r - rad) / (50 + 90 * k)) ** 2) * (1 - k / 0.8) ** 1.5
            bloom = np.exp(-(r / 520) ** 2) * np.exp(-k * 5)
            a = a + (np.minimum(col * 0.6 + 120, 255) - a) * (strength * (0.45 * ring + 0.35 * bloom))[..., None]
    return a


def punch(t, lands, amt):
    """Zoom kick that decays after each change."""
    return 1 + sum(amt * st * np.exp(-(t - L) * 6) for L, st in lands if t >= L)


# ---------------------------------------------------------------- typography
LABEL_F, BEN_F = font(F_SEMI, 40), font(F_BOLD, 76)
LABELS = [text_sprite(l, LABEL_F, (255, 255, 255, 255), tracking=8) for l, *_ in LIGHTS]
BENEFITS = [text_sprite(b, BEN_F, (*INK, 255), tracking=-1) for *_, b in LIGHTS]
HOOK = text_sprite('ONE MASK. EVERY LIGHT.', font(F_BOLD, 50), (*INK, 255), tracking=4)
HL_TOP, HL_COLOR, HL_BOTTOM = RV.HL_TOP, RV.HL_COLOR, RV.HL_BOTTOM
TITLE, OFF45, LIMIT, BUTTON = RV.TITLE, RV.OFF45, RV.LIMIT, RV.BUTTON


def tinted(spr, col):
    im = Image.new('RGBA', spr.size, (*col, 255)); im.putalpha(spr.getchannel('A'))
    return im


def dots(ov, active, sw, alpha, y=1700):
    gap = 34
    for i in range(len(LIGHTS)):
        r = 9 if i == active else 6
        c = (*LIGHTS[i][2], int(255 * alpha)) if i == active else (190, 190, 196, int(200 * alpha))
        d = Image.new('RGBA', (2 * r + 2, 2 * r + 2), (0, 0, 0, 0))
        ImageDraw.Draw(d).ellipse((1, 1, 2 * r, 2 * r), fill=c)
        ov.alpha_composite(d, (int(W / 2 + (i - 1.5) * gap - r), y - r))


def overlay(t, segs, sw, hook=False):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if hook and t < 2.6:
        a, d = rise(t, 0.15)
        put(ov, HOOK, W / 2, 250, a * (1 - ease((t - 2.2) / 0.35)), d)
    for i, (t_in, t_out) in enumerate(segs):
        if t_in - 0.1 <= t <= t_out + 0.1:
            out = 1 - ease((t - (t_out - 0.3)) / 0.28)
            a1, d1 = rise(t, t_in)
            a2, d2 = rise(t, t_in + 0.25)
            put(ov, tinted(LABELS[i], LIGHTS[i][2]), W / 2, 1460, a1 * out, d1)
            put(ov, BENEFITS[i], W / 2, 1520, a2 * out, d2, 1.14 - 0.14 * a2)
            dots(ov, i, sw, a1 * out)
    if END_AT <= t < CTA_AT:
        out = 1 - ease((t - (CTA_AT - 0.35)) / 0.3)
        a, d = rise(t, END_AT + 0.2); put(ov, HL_TOP, W / 2, 1400, a * out, d)
        a, d = rise(t, END_AT + 0.45); put(ov, tinted(HL_COLOR, sw), W / 2, 1466, a * out, d)
        a, d = rise(t, END_AT + 0.7); put(ov, HL_BOTTOM, W / 2, 1578, a * out, d)
    if t >= CTA_AT:
        a, d = rise(t, CTA_AT, 0.5); put(ov, TITLE, W / 2, 1330, a, d)
        k = ease((t - CTA_AT - 0.2) / 0.55)
        put(ov, OFF45, W / 2, 1420, k, 0, 0.86 + 0.14 * k)
        a, d = rise(t, CTA_AT + 0.6); put(ov, LIMIT, W / 2, 1632, a, d)
        a, d = rise(t, CTA_AT + 0.9)
        put(ov, BUTTON, W / 2, 1700, a, d, 1 + 0.025 * np.sin((t - CTA_AT) * 4) ** 2 * (t > CTA_AT + 1.0))
    return ov


def finish(a, ov, t):
    img = Image.alpha_composite(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA'), ov)
    a = np.asarray(img.convert('RGB')).astype(np.float32) + RV.GRAIN[int(t * FPS) % len(RV.GRAIN)] * 0.7
    fade = ease(t / 0.35)
    return np.clip(a * fade + 250 * (1 - fade), 0, 255).astype(np.uint8)


# ---------------------------------------------------------------- creative A: 360 spin
class Turntable:
    """Keyed frames of the turntable clip: frame 0 front, ~72 back (inside LEDs), 144 front."""
    def __init__(self, path):
        raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(path), '-f', 'rawvideo',
                              '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
        f = np.frombuffer(raw, np.uint8).reshape(-1, 960, 960, 3)[:, 60:930, 40:930]
        self.rgb = f; self.n = len(f) - 1

    def sprite(self, pos, tint, lit, blur=1):
        """pos in [0,1) of a revolution; blur = number of sub-frames averaged (motion blur)."""
        idxs = [((pos + j * 0.006) % 1) * self.n for j in range(blur)]
        acc = np.zeros(self.rgb.shape[1:], np.float32); al = np.zeros(self.rgb.shape[1:3], np.float32)
        for ix in idxs:
            fr = self.rgb[int(round(ix)) % (self.n + 1)].astype(np.float32)
            alpha = np.clip((fr.mean(2) - 5) / 28, 0, 1)
            acc += fr; al += alpha
        acc /= len(idxs); al /= len(idxs)
        rgb = acc / np.maximum(al, 1e-3)[..., None]                 # un-premultiply the black key
        rgb = np.clip(rgb * 1.04 + 8, 0, 255)                      # lift the grey key to studio white
        if lit < 1:
            rgb = led_off(rgb) * (1 - lit) + rgb * lit
        rgb = relight(rgb, tint)
        return rgb, al


def creative_a():
    tt = Turntable(ROOT / 'clips-src' / 'turn-inside-alpha.mp4')
    spins = [0.0, 3.0, 6.0, 9.0, END_AT]                           # each light change = one 360
    changes = [(0.0, 0), (3.5, 1), (6.5, 2), (9.5, 3)] + [(tc, k % 4) for k, tc in enumerate(END_CYCLE)] + [(CTA_AT - 0.25, 0)]
    segs = [(s + 1.0, s + SEG) for s in spins[:4]]
    scale = 1.34

    def frame(t):
        tint, sw = tint_at(t, changes)
        pos, blur = 0.0, 1
        for s in spins:
            if s <= t < s + 1.0:
                u = (t - s) / 1.0
                e = u * u * (3 - 2 * u)                           # smoothstep spin
                speed = 6 * u * (1 - u)
                pos, blur = e % 1.0, 1 + int(speed * 4)
                break
        else:                                                       # gentle 3D sway while holding
            sway = 0.018 * np.sin(2 * np.pi * t / 3.0)
            pos = sway % 1.0
        lit = 0.0 if t < 0.85 else (0.4 + 0.2 * np.sin((t - 0.85) * 120) if t < 0.95 else min(1.0, 0.55 + (t - 0.95) * 3))
        rgb, al = tt.sprite(pos, tint, lit, blur)
        glow = lit * (0.9 + 0.1 * np.sin(t * 2.4))
        bob = 16 * np.sin(t * 1.3)
        drift = 34 * np.sin(2 * np.pi * t / 6.0)                     # mask glides across the frame
        lift = 0.0; tilt = 3.0 * np.sin(2 * np.pi * t / 6.0 + 1.0)
        for s in spins:                                             # leaps toward camera while spinning
            if s <= t < s + 1.0:
                u = (t - s); lift = 0.12 * np.sin(np.pi * u); tilt += 6 * np.sin(2 * np.pi * u)
        hold = (t % SEG) / SEG
        zoom = scale * (0.92 + 0.08 * ease(t / 1.0)) * (1 + lift) * (1 + 0.05 * hold) * punch(t, lands, 0.07)
        a = backdrop(sw, glow, bob / 16)
        h0, w0 = al.shape
        nw, nh = int(w0 * zoom), int(h0 * zoom)
        spr = Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA').resize((nw, nh), Image.BICUBIC)
        spr = spr.rotate(tilt, resample=Image.BICUBIC, expand=True)
        base = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
        cx, cy = W / 2 + drift, 800 + bob
        base.alpha_composite(spr, (int(cx - spr.width / 2), int(cy - spr.height / 2)))
        a = burst(np.asarray(base.convert('RGB')).astype(np.float32), t, lands, sw, cx, cy)
        return finish(a, overlay(t, segs, sw, hook=True), t)

    lands = [(1.0, 1.0), (4.0, 1.0), (7.0, 1.0), (10.0, 1.0)] + [(tc, 0.5) for tc in END_CYCLE] + [(CTA_AT, 0.8)]
    chimes = [(4.0, 1), (7.0, 2), (10.0, 3)]
    return frame, chimes, 0.95


# ---------------------------------------------------------------- creative B: glow macro
def creative_b():
    hero = Image.open(ROOT / 'assets' / '06-floating-hero.png').convert('RGB').resize((W * 2, H * 2), Image.LANCZOS)
    hero_a = np.asarray(hero).astype(np.float32)
    hero_off = led_off(hero_a).astype(np.float32)
    # per light: camera (zoom0, zoom1, cx0, cx1, cy0, cy1) on the floating mask
    cams = [(1.00, 1.18, .52, .48, .47, .43),      # red: full float, push in
            (1.50, 1.80, .37, .47, .44, .40),      # blue: close on the eye openings, sliding
            (1.40, 1.70, .36, .38, .58, .48),      # green: nose + mouth, rising
            (1.35, 1.60, .74, .62, .47, .43)]      # purple: strap + glowing rim, pan
    end_cam = (1.18, 1.00, .50, .50, .43, .47)
    changes = [(0.0, 0), (3.0, 1), (6.0, 2), (9.0, 3)] + [(tc, k % 4) for k, tc in enumerate(END_CYCLE)] + [(CTA_AT - 0.25, 0)]
    segs = [(0.9, SEG)] + [(s + 0.4, s + SEG) for s in (3.0, 6.0, 9.0)]
    XFADE = 0.18
    lands = [(0.6, 1.0), (3.0, 1.0), (6.0, 1.0), (9.0, 1.0), (END_AT, 1.0)] + [(tc, 0.5) for tc in END_CYCLE] + [(CTA_AT, 0.8)]

    def shot(cam, u, t, tint, lit, whip=1.0):
        z0, z1, x0, x1, y0, y1 = cam
        e = 1 - (1 - min(max(u, 0), 1)) ** 2                          # fast start, gliding finish
        z = (z0 + (z1 - z0) * e) * whip
        cx = (x0 + (x1 - x0) * e) * W * 2 + 10 * np.sin(t * 0.8)
        cy = (y0 + (y1 - y0) * e) * H * 2 + 24 * np.sin(t * 1.3)
        cw, ch = W * 2 / z, H * 2 / z
        cx = min(max(cx, cw / 2), W * 2 - cw / 2); cy = min(max(cy, ch / 2), H * 2 - ch / 2)
        box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
        src = hero_a if lit >= 1 else hero_off * (1 - lit) + hero_a * lit
        srcim = Image.fromarray(np.clip(src, 0, 255).astype(np.uint8))
        if whip > 1.02:                                                 # zoom blur while whipping
            a = np.zeros((H, W, 3), np.float32)
            ks = 1 + 0.11 * (whip - 1) * np.arange(8) / 7                   # blur length follows the whip
            for k in ks:
                cw2, ch2 = cw / k, ch / k
                a += np.asarray(srcim.transform((W, H), Image.EXTENT, (cx - cw2 / 2, cy - ch2 / 2, cx + cw2 / 2, cy + ch2 / 2), Image.BILINEAR), np.float32)
            a /= len(ks)
        else:
            a = np.asarray(srcim.transform((W, H), Image.EXTENT, box, Image.BICUBIC)).astype(np.float32)
        pulse = 1 + 0.06 * np.sin(t * 2.2)
        red = np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]) - 60, 0, None)[..., None] / 195
        a = a * (1 - red) + np.clip(a * pulse, 0, 255) * red
        return relight(a, tint)

    def frame(t):
        tint, sw = tint_at(t, changes)
        lit = 0.0 if t < 0.5 else (0.4 + 0.2 * np.sin((t - 0.5) * 120) if t < 0.6 else min(1.0, 0.55 + (t - 0.6) * 3))
        bounds = [0.0, 3.0, 6.0, 9.0, END_AT, TOTAL]
        allcams = cams + [end_cam]
        acc, wsum = None, 0.0
        for i, cam in enumerate(allcams):
            st, en = bounds[i], bounds[i + 1]
            if t < st - XFADE / 2 or t > en + XFADE / 2:
                continue
            w = 1.0
            if st > 0: w = min(w, ease((t - (st - XFADE / 2)) / XFADE))
            if en < TOTAL: w = min(w, 1 - ease((t - (en - XFADE / 2)) / XFADE))
            if w <= 0: continue
            seg_tint = np.array(LIGHTS[min(i, 3)][1], np.float32) if i < 4 else tint
            whip = 1.0
            if en < TOTAL: whip += 0.35 * ease((t - (en - 0.22)) / 0.22)        # rush into the next light
            if st > 0: whip += 0.35 * (1 - ease((t - st) / 0.3))             # land from a zoom
            whip *= punch(t, lands, 0.04)
            f = shot(cam, (t - st + XFADE / 2) / (en - st + XFADE), t, seg_tint, lit, whip) * w
            acc = f if acc is None else acc + f; wsum += w
        a = acc / wsum
        a = burst(a, t, lands, sw, W / 2, 820)
        if any(s0 - 0.1 <= t <= s1 + 0.1 for s0, s1 in segs):               # keep the copy readable on macros
            a = a + (250 - a) * (np.asarray(RV.SCRIM.getchannel('A'), np.float32) / 255 * 0.85)[..., None]
        return finish(a, overlay(t, segs, sw), t)

    chimes = [(3.0, 1), (6.0, 2), (9.0, 3)]
    return frame, chimes, 0.55


# ---------------------------------------------------------------- sound
# Ambient bed: slow evolving pad (Am9 - Fmaj9 - Cmaj9 - G6), high shimmer, long reverb.
# No beat and no whooshes; each light change is one crisp button click. Mixed quiet (~-20 LUFS).
def click(rng):
    """Tactile switch: a bright press transient, a tiny body resonance, and a softer release."""
    n = int(0.09 * SR); u = np.arange(n) / SR; out = np.zeros(n)
    press = _filt(rng.normal(0, 1, n), lo=2000, hi=11000) * np.exp(-u * 1100)
    body = np.sin(2 * np.pi * 2300 * u) * np.exp(-u * 260) * 0.35
    out += press + body
    j = int(0.045 * SR)
    out[j:] += 0.45 * (_filt(rng.normal(0, 1, n - j), lo=2500, hi=10000) * np.exp(-u[:n - j] * 1400))
    return out / np.abs(out).max()


def piano_note(f0, dur, vel, rng):
    """Soft felt-piano tone: slightly inharmonic partials, faster decay up high, gentle hammer."""
    n = int(dur * SR); u = np.arange(n) / SR; out = np.zeros(n)
    for k in range(1, 9):
        fk = k * f0 * np.sqrt(1 + 0.0004 * k * k)
        if fk > 9000: break
        out += (vel ** (0.6 + 0.15 * k)) / k ** 1.6 * np.sin(2 * np.pi * fk * u + rng.uniform(0, 6.3)) * np.exp(-u * (0.55 + 0.45 * k) * (f0 / 260) ** 0.4)
    out += 0.02 * vel * _filt(rng.normal(0, 1, n), lo=400, hi=3000) * np.exp(-u * 90)
    return out * np.minimum(u / 0.004, 1) * np.clip((dur - u) / 0.3, 0, 1)


def piano_bed(n, rng):
    """Sparse ambient piano over Am9 - Fmaj9 - Cmaj9 - G6: low root, then a slow, airy figure."""
    out = np.zeros(n)
    bars = [(45, [69, 72, 76, 71, 67]), (41, [69, 72, 76, 79, 76]), (48, [67, 71, 74, 76, 71]), (43, [67, 71, 74, 69, 74])]
    span = TOTAL / 4
    figure = [0.35, 1.15, 1.95, 2.95, 3.7]
    for c, (root, top) in enumerate(bars):
        t0 = c * span
        _add(out, piano_note(_note(root), 4.5, 0.45, rng), t0, 0.8)
        _add(out, piano_note(_note(root + 12), 4.0, 0.35, rng), t0 + 0.02, 0.5)
        for dt, m in zip(figure, top):
            if t0 + dt < CTA_AT - 0.2 or c == 3:
                _add(out, piano_note(_note(m), 3.0, 0.42 + 0.08 * rng.random(), rng), t0 + dt, 0.55)
    for k, m in enumerate([57, 64, 67, 71, 76]):                       # rolled chord for the offer
        _add(out, piano_note(_note(m), 3.0, 0.5, rng), CTA_AT + 0.06 * k, 0.5)
    return _filt(out, lo=50, hi=4200)


def soundtrack(path, chimes, power_on, bed='pad'):
    n = int(TOTAL * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(11)
    if bed == 'piano':
        piano_soundtrack(path, chimes, power_on, n, t, rng)
        return
    chords = [[45, 57, 60, 64, 67, 71], [41, 53, 57, 60, 64, 67], [48, 55, 59, 62, 64, 71], [43, 55, 59, 62, 64, 69]]
    span = TOTAL / len(chords)
    pad = np.zeros(n); shim = np.zeros(n)
    for c, notes in enumerate(chords):
        t0 = c * span
        env = np.clip((t - t0 + 1.2) / 2.0, 0, 1) * np.clip((t0 + span + 1.2 - t) / 2.0, 0, 1)
        env = np.sin(env * np.pi / 2) ** 2
        for m in notes:
            f0 = _note(m)
            for det in (-0.0018, 0.0, 0.0021):
                pad += env * np.sin(2 * np.pi * f0 * (1 + det) * t + rng.uniform(0, 6.3)) * (0.6 if m < 50 else 1.0)
            shim += env * np.sin(2 * np.pi * f0 * 4 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.13 + 0.02 * m % 3) * t)) * (m > 54)
    swell = 1 + 0.35 * np.clip((t - CTA_AT) / 1.5, 0, 1)                 # lifts for the offer
    pad = _filt(pad, lo=60, hi=1400) * (1 + 0.08 * np.sin(2 * np.pi * 0.21 * t)) * swell
    shim = _filt(shim, hi=7000) * 0.05 * swell
    L = pad + shim; R = pad * 0.98 + np.roll(shim, 700)
    fx = np.zeros(n)
    dry = np.zeros(n)                                                 # clicks stay close and dry
    for t0 in [c for c, _ in chimes] + END_CYCLE + [CTA_AT - 0.25]:   # every light change
        _add(dry, click(rng), t0 - 0.02, 0.9)
    _add(dry, click(rng), power_on - 0.12, 0.9)                       # power-on: click + soft beep
    m = int(.24 * SR); u = np.arange(m) / SR
    _add(fx, np.sin(np.pi * u / .24) ** 2 * (np.sin(2 * np.pi * 1568 * u) + .15 * np.sin(2 * np.pi * 3136 * u)), power_on, 0.45)
    ir_n = int(3.0 * SR); iu = np.arange(ir_n) / SR                    # long, soft hall
    irs = [_filt(rng.normal(0, 1, ir_n), lo=150, hi=6000) * np.exp(-iu / 0.9) for _ in range(2)]
    irs = [ir / np.sqrt((ir ** 2).sum()) * 0.5 for ir in irs]
    wetL, wetR = RV._conv(L * 0.4 + fx, irs[0]), RV._conv(R * 0.4 + fx, irs[1])
    norm = 1 / (np.sqrt(np.mean(L ** 2)) + 1e-9)
    wetL += RV._conv(dry, irs[0]) * 0.15; wetR += RV._conv(dry, irs[1]) * 0.15
    st = np.stack([(L + fx + dry * 3.2 + wetL) * norm, (R + fx + dry * 3.2 + wetR) * norm], 1)
    st *= (np.clip(t / 1.2, 0, 1) * np.clip((TOTAL - t) / 1.0, 0, 1))[:, None]
    st *= 10 ** (-22.4 / 20)                                          # quiet, ambient level
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())


def piano_soundtrack(path, chimes, power_on, n, t, rng):
    """Quiet ambient piano bed (~-24 LUFS) with the light-change clicks kept clear on top."""
    p = piano_bed(n, rng)
    ir_n = int(3.5 * SR); iu = np.arange(ir_n) / SR
    irs = [_filt(rng.normal(0, 1, ir_n), lo=200, hi=5000) * np.exp(-iu / 1.1) for _ in range(2)]
    irs = [ir / np.sqrt((ir ** 2).sum()) * 0.6 for ir in irs]
    bedL = p + RV._conv(p, irs[0]); bedR = p * 0.97 + RV._conv(p, irs[1])
    g = 10 ** (-28 / 20) / (np.sqrt(np.mean(bedL ** 2)) + 1e-9)             # bed sits low
    dry = np.zeros(n)
    for t0 in [c for c, _ in chimes] + END_CYCLE + [CTA_AT - 0.25]:
        _add(dry, click(rng), t0 - 0.02, 1.0)
    _add(dry, click(rng), power_on - 0.12, 1.0)
    m = int(.24 * SR); u = np.arange(m) / SR
    _add(dry, 0.25 * np.sin(np.pi * u / .24) ** 2 * (np.sin(2 * np.pi * 1568 * u) + .15 * np.sin(2 * np.pi * 3136 * u)), power_on, 1.0)
    fxL = dry + RV._conv(dry, irs[0]) * 0.12; fxR = dry + RV._conv(dry, irs[1]) * 0.12
    st = np.stack([bedL * g + fxL * 10 ** (-13 / 20), bedR * g + fxR * 10 ** (-13 / 20)], 1)
    st *= (np.clip(t / 0.8, 0, 1) * np.clip((TOTAL - t) / 1.0, 0, 1))[:, None]
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())


# ---------------------------------------------------------------- render
BEDS = {'a': 'pad', 'b': 'piano'}       # B: ambient piano, no instrumental pad


def render(tag, build):
    frame, chimes, power_on = build()
    wav = OUT / f'creative-{tag}.wav'
    soundtrack(wav, chimes, power_on, BEDS[tag])
    out = ROOT / f'LED-Creative-{tag.upper()}-18s.mp4'
    p = subprocess.Popen(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                          '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', str(wav),
                          '-c:v', 'libx264', '-preset', 'slow', '-b:v', '10M', '-maxrate', '12M', '-bufsize', '20M',
                          '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k',
                          '-t', str(TOTAL), '-movflags', '+faststart', str(out)], stdin=subprocess.PIPE)
    nframes = int(TOTAL * FPS)
    for k in range(nframes):
        p.stdin.write(frame(k / FPS).tobytes())
        if k % 90 == 0:
            print(f'{tag}: frame {k}/{nframes}', flush=True)
    p.stdin.close(); p.wait()
    print('done ->', out, flush=True)


if __name__ == '__main__':
    which = sys.argv[1:] or ['a', 'b']
    for tag in which:
        render(tag, {'a': creative_a, 'b': creative_b}[tag])

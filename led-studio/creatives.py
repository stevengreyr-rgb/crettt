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
from render_video import (W, H, FPS, SR, BPM, INK, GREY, RED, F_BLACK, F_BOLD, F_SEMI,
                          ease, font, text_sprite, pill, put, rise, led_off,
                          groove, _filt, _add, _env, _note)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'render'; OUT.mkdir(exist_ok=True)
TOTAL = 18.0
BEAT = 60 / BPM

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
            put(ov, BENEFITS[i], W / 2, 1520, a2 * out, d2)
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
        ph = ((t - CTA_AT) * BPM / 60) % 1
        put(ov, BUTTON, W / 2, 1700, a, d, 1 + 0.03 * np.exp(-ph * 6) * (t > CTA_AT + 1.0))
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
        bob = 12 * np.sin(t * 1.3)
        zoom = scale * (0.94 + 0.06 * ease(t / 1.0)) * (1 + 0.012 * np.sin(t * 0.9))
        a = backdrop(sw, glow, bob / 12)
        h0, w0 = al.shape
        nw, nh = int(w0 * zoom), int(h0 * zoom)
        spr = Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA').resize((nw, nh), Image.BICUBIC)
        base = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
        base.alpha_composite(spr, (int(W / 2 - nw / 2), int(800 + bob - nh / 2)))
        a = np.asarray(base.convert('RGB')).astype(np.float32)
        return finish(a, overlay(t, segs, sw, hook=True), t)

    sfx = [(0.0, 1.0, None)] + [(s, 1.0, i) for i, s in enumerate(spins[1:4], 1)] + [(END_AT, 1.0, None)]
    return frame, sfx, 0.95


# ---------------------------------------------------------------- creative B: glow macro
def creative_b():
    hero = Image.open(ROOT / 'assets' / '06-floating-hero.png').convert('RGB').resize((W * 2, H * 2), Image.LANCZOS)
    hero_a = np.asarray(hero).astype(np.float32)
    hero_off = led_off(hero_a).astype(np.float32)
    # per light: camera (zoom0, zoom1, cx0, cx1, cy0, cy1) on the floating mask
    cams = [(1.00, 1.10, .50, .49, .46, .44),      # red: full float, push in
            (1.62, 1.75, .40, .45, .43, .41),      # blue: close on the eye openings
            (1.50, 1.62, .36, .36, .54, .49),      # green: nose + mouth, rising
            (1.45, 1.52, .70, .64, .46, .45)]      # purple: strap + glowing rim, pan
    end_cam = (1.10, 1.00, .50, .50, .44, .47)
    changes = [(0.0, 0), (3.0, 1), (6.0, 2), (9.0, 3)] + [(tc, k % 4) for k, tc in enumerate(END_CYCLE)] + [(CTA_AT - 0.25, 0)]
    segs = [(0.9, SEG)] + [(s + 0.4, s + SEG) for s in (3.0, 6.0, 9.0)]
    XFADE = 0.3

    def shot(cam, u, t, tint, lit):
        z0, z1, x0, x1, y0, y1 = cam
        e = ease(u)
        z = z0 + (z1 - z0) * e
        cx = (x0 + (x1 - x0) * e) * W * 2 + 10 * np.sin(t * 0.8)
        cy = (y0 + (y1 - y0) * e) * H * 2 + 24 * np.sin(t * 1.3)
        cw, ch = W * 2 / z, H * 2 / z
        cx = min(max(cx, cw / 2), W * 2 - cw / 2); cy = min(max(cy, ch / 2), H * 2 - ch / 2)
        box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
        src = hero_a if lit >= 1 else hero_off * (1 - lit) + hero_a * lit
        im = Image.fromarray(np.clip(src, 0, 255).astype(np.uint8)).transform((W, H), Image.EXTENT, box, Image.BICUBIC)
        a = np.asarray(im).astype(np.float32)
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
            f = shot(cam, (t - st + XFADE / 2) / (en - st + XFADE), t, seg_tint, lit) * w
            acc = f if acc is None else acc + f; wsum += w
        a = acc / wsum
        for st in (3.0, 6.0, 9.0, END_AT):                          # light sweep across each change
            u = (t - (st - 0.35)) / 0.7
            if 0 <= u <= 1:
                band = np.exp(-(((XX * 0.8 + YY * 0.45) - (-400 + u * 2600)) / 220) ** 2)
                light = np.array(sw, np.float32) * 0.35 + 255 * 0.65           # tinted white light pass
                k = np.sin(np.pi * u)
                a = a + (light - a) * (k * (0.32 * band + 0.10))[..., None]
        if any(s0 - 0.1 <= t <= s1 + 0.1 for s0, s1 in segs):               # keep the copy readable on macros
            a = a + (250 - a) * (np.asarray(RV.SCRIM.getchannel('A'), np.float32) / 255 * 0.85)[..., None]
        return finish(a, overlay(t, segs, sw), t)

    sfx = [(0.0, 0.5, None)] + [(s - 0.4, 0.8, i) for i, s in enumerate((3.0, 6.0, 9.0), 1)] + [(END_AT - 0.4, 0.8, None)]
    return frame, sfx, 0.55


# ---------------------------------------------------------------- sound
def swirl(dur, rng):
    """Airy 360 'turn': band-passed noise whose centre sweeps up and back, panned round the head."""
    n = int(dur * SR); u = np.arange(n) / n
    noise = rng.normal(0, 1, n)
    hop, win = 256, 1024; w = np.hanning(win); out = np.zeros(n + win)
    f = np.fft.rfftfreq(win, 1 / SR)
    for i in range(0, n, hop):
        seg = np.zeros(win); m = min(win, n - i); seg[:m] = noise[i:i + m]
        p = min(i / n, 1)
        fc = 500 + 3800 * np.sin(np.pi * p) ** 1.5
        out[i:i + win] += np.fft.irfft(np.fft.rfft(seg * w) * np.exp(-((f - fc) / (fc * 0.35)) ** 2), win) * w
    out = out[:n] / (np.abs(out).max() + 1e-9) * np.sin(np.pi * u) ** 1.2
    # soft gliding tone underneath (gives the turn a pitch, like a whirring disc)
    ph = 2 * np.pi * np.cumsum(330 + 330 * np.sin(np.pi * u)) / SR
    out = out * 0.8 + 0.12 * np.sin(ph) * np.sin(np.pi * u) ** 2
    pan = 0.5 + 0.5 * np.sin(2 * np.pi * u - np.pi / 2)            # L -> R -> L : one revolution
    return out * np.sqrt(1 - pan), out * np.sqrt(pan)


def bell(freq, dur=1.6):
    n = int(dur * SR); u = np.arange(n) / SR
    s = (np.sin(2 * np.pi * freq * u + 0.6 * np.sin(2 * np.pi * freq * 2 * u) * np.exp(-u * 6)) * np.exp(-u * 2.6)
         + 0.25 * np.sin(2 * np.pi * freq * 2.76 * u) * np.exp(-u * 7))
    return s * np.minimum(u / 0.003, 1)


def soundtrack(path, sfx, power_on):
    n = int(TOTAL * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(11)
    musicL, musicR = groove(TOTAL, 17.0, lambda tb: tb >= 1.0 and not (11.0 <= tb < 12.0), CTA_AT,
                            [0, 1, 3, 12, 15, 18], [0.15, 0.45, 0.65, 0.8, 1.0, 1.0], rng)
    L = np.zeros(n); R = np.zeros(n)
    chime = {1: _note(76), 2: _note(79), 3: _note(81)}               # E5, G5, A5 - inside the A minor groove
    for t0, dur, light in sfx:
        sl, sr_ = swirl(dur, rng)
        _add(L, sl, t0, 0.20); _add(R, sr_, t0, 0.20)
        if light in chime:
            b = bell(chime[light]); _add(L, b, t0 + dur, 0.10); _add(R, b, t0 + dur, 0.10)
    for k, tc in enumerate(END_CYCLE):                                # light arpeggio under the long copy
        b = bell(_note([76, 79, 81, 84, 88][k]), 1.0)
        _add(L, b, tc, 0.06); _add(R, b, tc, 0.06)
    m = int(.05 * SR); u = np.arange(m) / SR                         # power-on: click + soft beep
    click = _filt(rng.normal(0, 1, m), lo=2500) * np.exp(-u * 900)
    _add(L, click, power_on - 0.1, 0.5); _add(R, click, power_on - 0.1, 0.5)
    m = int(.24 * SR); u = np.arange(m) / SR
    bp = np.sin(np.pi * u / .24) ** 2 * (np.sin(2 * np.pi * 1568 * u) + .15 * np.sin(2 * np.pi * 3136 * u))
    _add(L, bp, power_on, 0.10); _add(R, bp, power_on, 0.10)
    m = int(2.5 * SR); u = np.arange(m) / SR                         # low impact on the offer
    boom = np.sin(2 * np.pi * np.cumsum(38 + 30 * np.exp(-u * 8)) / SR) * np.exp(-u * 2.2)
    _add(L, boom, CTA_AT, 0.35); _add(R, boom, CTA_AT, 0.35)
    st = np.stack([musicL * 0.55 + L, musicR * 0.55 + R], 1)
    st *= np.clip((TOTAL - t) / 0.6, 0, 1)[:, None]
    st = st / np.percentile(np.abs(st), 99.95) * 0.75
    st = np.tanh(st * 1.2) / np.tanh(1.2) * 0.66                    # headroom for the swirls after AAC
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())


# ---------------------------------------------------------------- render
def render(tag, build):
    frame, sfx, power_on = build()
    wav = OUT / f'creative-{tag}.wav'
    soundtrack(wav, sfx, power_on)
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

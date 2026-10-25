"""LED Face Mask — 23 s vertical commercial (1080x1920, 30 fps, H.264 + AAC).

Usage:  python3 render_video.py

Shot sources
  * If clips/0N.mp4 exists (real image-to-video motion, see PRODUCTION.md), it is used.
  * Otherwise the still in assets/ gets a slow eased camera move (editorial animatic).

Sound design is synthesized here: soft white-noise room tone + airy pad, no
transition whooshes, and a single gentle beep when the mask's LEDs power on.
"""
from pathlib import Path
import subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'render'; OUT.mkdir(exist_ok=True)
CLIPS = ROOT / 'clips'
W, H, FPS = 1080, 1920, 30
XF = 0.5                      # soft crossfade between shots (no sound on cuts)
INTER = '/usr/share/fonts/opentype/inter/'
F_BLACK = INTER + 'InterDisplay-ExtraBold.otf'
F_BOLD = INTER + 'InterDisplay-Bold.otf'
F_SEMI = INTER + 'Inter-SemiBold.otf'
F_MED = INTER + 'Inter-Medium.otf'
INK = (24, 24, 28); GREY = (110, 110, 118); RED = (226, 36, 44)

# name, start, duration, camera (zoom0, zoom1, cx0, cx1, cy0, cy1) in normalized coords,
# problem -> solution copy (best 5 problem/solution pairs, no medical claims)
SHOTS = [
    ('01-approach', 0.0, 3.0, (1.06, 1.16, .46, .55, .50, .52), 'NO TIME FOR THE SPA?', 'Your spa ritual, at home.'),
    ('02-pick-up', 3.0, 3.0, (1.16, 1.06, .50, .50, .48, .50), 'PRICEY MONTHLY TREATMENTS?', 'One-time investment.'),
    ('03-recline', 6.0, 3.0, (1.12, 1.12, .44, .56, .46, .46), 'UNCOMFORTABLE MASKS?', 'Light, with an adjustable strap.'),
    ('04-put-on', 9.0, 3.0, (1.04, 1.15, .52, .50, .50, .40), 'COMPLICATED DEVICES?', 'Just put it on. Done.'),
    ('05-relax', 12.0, 3.0, (1.15, 1.04, .48, .50, .36, .46), 'STRESSFUL DAY?', 'Unwind while it glows.'),
    ('06-floating-hero', 15.0, 8.0, (1.07, 1.00, .50, .50, .47, .50), None, None),
]
TOTAL = 23.0
LED_ON = 12.55                 # LEDs power on (beep) inside shot 5
COLORS_AT = 17.45              # "every single color" headline + mask colour cycle
CTA_AT = 19.95
# LED colour keyframes for the hero (unit tint for the glow, swatch for the headline)
LED_CYCLE = [(17.75, (.12, .42, 1.0), (38, 110, 240)),     # blue
             (18.45, (.15, 1.0, .45), (18, 168, 92)),      # green
             (19.15, (.72, .25, 1.0), (140, 64, 222)),     # purple
             (19.85, (1.0, 0.0, 0.0), RED)]                # back to red for the offer


def led_color(t):
    tint, sw = (1.0, 0.0, 0.0), RED
    for t0, nt, ns in LED_CYCLE:
        k = ease((t - t0) / 0.22)
        tint = tuple(a + (b - a) * k for a, b in zip(tint, nt))
        sw = tuple(a + (b - a) * k for a, b in zip(sw, ns))
    return np.array(tint, np.float32), tuple(int(c) for c in sw)


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return 0.5 - 0.5 * np.cos(np.pi * x)


def font(path, size):
    return ImageFont.truetype(path, size)


# ---------------------------------------------------------------- shot sources
class Still:
    def __init__(self, name, cam, dur):
        im = Image.open(ROOT / 'assets' / f'{name}.png').convert('RGB')
        self.big = im.resize((W * 2, H * 2), Image.LANCZOS)
        self.cam, self.dur = cam, dur
        self.hero = name == '06-floating-hero'
        self.off = None
        if name == '05-relax':
            self.off = Image.fromarray(led_off(np.asarray(self.big)))
            self.glow = self._glow(np.asarray(self.big))

    @staticmethod
    def _glow(a):
        a = a.astype(np.float32)
        red = np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]) - 90, 0, None) / 165
        g = Image.fromarray((np.clip(red, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(60))
        return g

    def frame(self, u, t_abs):
        z0, z1, x0, x1, y0, y1 = self.cam
        e = ease(u)
        z = z0 + (z1 - z0) * e
        cx = (x0 + (x1 - x0) * e) * W * 2
        cy = (y0 + (y1 - y0) * e) * H * 2
        if self.hero:      # hero: weightless float
            cy += 14 * np.sin(t_abs * 1.3) * 2
            cx += 6 * np.sin(t_abs * 0.8) * 2
        cw, ch = W * 2 / z, H * 2 / z
        cx = min(max(cx, cw / 2), W * 2 - cw / 2)
        cy = min(max(cy, ch / 2), H * 2 - ch / 2)
        box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
        src = self.big
        if self.off is not None:
            k = led_level(t_abs)
            if k < 1:
                src = Image.blend(self.off, self.big, k)
            img = src.transform((W, H), Image.EXTENT, box, Image.BICUBIC)
            gl = self.glow.transform((W, H), Image.EXTENT, box, Image.BILINEAR)
            a = np.asarray(img).astype(np.float32)
            g = np.asarray(gl).astype(np.float32)[..., None] / 255 * k * (0.9 + 0.1 * np.sin(t_abs * 2.2))
            a += g * np.array([70, 8, 10])
            return np.clip(a, 0, 255).astype(np.uint8)
        img = src.transform((W, H), Image.EXTENT, box, Image.BICUBIC)
        if self.hero:
            a = np.asarray(img).astype(np.float32)
            pulse = 1 + 0.06 * np.sin(t_abs * 2.0)
            red = np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]) - 60, 0, None)[..., None] / 195
            a = a * (1 - red) + np.clip(a * pulse, 0, 255) * red
            tint, _ = led_color(t_abs)
            if tint[1] > 0.01 or tint[2] > 0.01:          # re-light the LEDs in another colour
                e = np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]), 0, None)[..., None]
                a[..., :1] -= e
                a += e * tint
            return np.clip(a, 0, 255).astype(np.uint8)
        return np.asarray(img)


def led_off(a):
    a = a.astype(np.float32)
    r, mx = a[..., 0], np.maximum(a[..., 1], a[..., 2])
    off = a.copy(); off[..., 0] = r - np.clip(r - mx - 38, 0, None)
    strong = np.clip((r - mx - 110) / 60, 0, 1)[..., None]
    off = off * (1 - strong) + (0.55 * mx)[..., None] * strong
    return np.clip(off, 0, 255).astype(np.uint8)


def led_level(t):
    u = t - LED_ON
    if u < 0:
        return 0.0
    if u < 0.12:                       # brief flicker as the LEDs strike
        return 0.35 + 0.25 * np.sin(u * 160)
    return float(min(1.0, 0.45 + 0.55 * ease((u - 0.12) / 0.45)))


class Clip:
    """Real motion clip (from an image-to-video model), cover-scaled to 1080x1920."""
    def __init__(self, path, dur):
        n = int(round((dur + XF) * FPS)) + 2
        raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(path), '-vf',
                              f'fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}',
                              '-frames:v', str(n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                             capture_output=True, check=True).stdout
        self.frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
        self.dur = dur

    def frame(self, u, t_abs):
        i = int(round((u * self.dur + XF / 2) * FPS))
        return self.frames[min(max(i, 0), len(self.frames) - 1)]


# ---------------------------------------------------------------- typography
def text_sprite(txt, fnt, fill, tracking=0):
    d = ImageDraw.Draw(Image.new('L', (1, 1)))
    widths = [d.textlength(c, font=fnt) for c in txt]
    tw = int(sum(widths) + tracking * (len(txt) - 1)) + 8
    asc, desc = fnt.getmetrics()
    im = Image.new('RGBA', (tw, asc + desc + 8), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im); x = 4
    for c, w in zip(txt, widths):
        dr.text((x, 4), c, font=fnt, fill=fill); x += w + tracking
    return im


def pill(txt, fnt, fg, bg, padx, pady, outline=None):
    s = text_sprite(txt, fnt, fg, tracking=1)
    asc, _ = fnt.getmetrics()
    w, h = s.width + padx * 2, asc + pady * 2
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=bg, outline=outline, width=2)
    im.alpha_composite(s, (padx, pady - 4 - int(asc * 0.06)))
    return im


def scrim():
    y = np.arange(H)[:, None]
    a = np.clip((y - 1080) / 300, 0, 1) * np.clip((1840 - y) / 260, 0, 1)
    a = (np.broadcast_to(a, (H, W)) * 0.82 * 255).astype(np.uint8)
    im = Image.new('RGBA', (W, H), (250, 250, 250, 0)); im.putalpha(Image.fromarray(a))
    return im


SCRIM = scrim()
P_FONT, S_FONT = font(F_SEMI, 38), font(F_BOLD, 66)
LINES = []
for name, st, dur, cam, prob, sol in SHOTS[:5]:
    LINES.append((st, dur, text_sprite(prob, P_FONT, (*GREY, 255), tracking=3),
                  text_sprite(sol, S_FONT, (*INK, 255), tracking=-1)))
ACCENT = Image.new('RGBA', (56, 5), (*RED, 255))
TITLE = text_sprite('LED FACE MASK', font(F_BLACK, 74), (*INK, 255), tracking=6)
CHIPS = [pill(t, font(F_MED, 34), (*INK, 255), (255, 255, 255, 235), 28, 20, outline=(220, 220, 224))
         for t in ('Red LED light', 'Adjustable strap', 'At-home use')]
OFF45 = text_sprite('45% OFF', font(F_BLACK, 176), (*RED, 255), tracking=-2)
LIMIT = text_sprite('LIMITED-TIME OFFER', font(F_SEMI, 32), (*GREY, 255), tracking=4)
HL_TOP = text_sprite('DISCOVER WHAT', font(F_BOLD, 54), (*INK, 255), tracking=3)
HL_COLOR = text_sprite('EVERY SINGLE COLOR', font(F_BLACK, 84), (255, 255, 255, 255), tracking=0)
HL_BOTTOM = text_sprite('OFFERS FOR YOUR ROUTINE', font(F_BOLD, 54), (*INK, 255), tracking=3)
BUTTON = pill('SHOP NOW  →', font(F_BOLD, 44), (255, 255, 255, 255), (*INK, 255), 64, 34)


def put(canvas, spr, cx, y, alpha, dy=0.0, scale=1.0):
    if alpha <= 0.002:
        return
    s = spr
    if scale != 1.0:
        s = spr.resize((max(1, int(spr.width * scale)), max(1, int(spr.height * scale))), Image.LANCZOS)
    if alpha < 1:
        s = s.copy(); s.putalpha(s.getchannel('A').point(lambda v: int(v * alpha)))
    canvas.alpha_composite(s, (int(cx - s.width / 2), int(y + dy - (s.height - spr.height) / 2)))


def rise(t, t0, d=0.45):
    """alpha, y-offset for an element entering at t0 (slide up + fade)."""
    k = ease((t - t0) / d)
    return k, (1 - k) * 34


def overlay(t):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    vis = 0.0
    for st, dur, prob, sol in LINES:
        if not (st - 0.1 <= t <= st + dur + 0.1):
            continue
        out = 1 - ease((t - (st + dur - 0.32)) / 0.3)
        a1, d1 = rise(t, st + 0.2)
        a2, d2 = rise(t, st + 0.85)
        vis = max(vis, a1 * out)
        put(ov, ACCENT, W / 2, 1290, a1 * out, d1)
        put(ov, prob, W / 2, 1318, a1 * out, d1)
        put(ov, sol, W / 2, 1384, a2 * out, d2)
    if t >= 15.0:
        vis = max(vis, ease((t - 15.2) / 0.5))
        a, d = rise(t, 15.35, 0.6)
        put(ov, TITLE, W / 2, 1222, a, d)
        chip_out = 1 - ease((t - (COLORS_AT - 0.35)) / 0.3)
        widths = [c.width for c in CHIPS]; gap = 18
        x = W / 2 - (sum(widths) + gap * 2) / 2
        for i, c in enumerate(CHIPS):
            a, d = rise(t, 15.9 + 0.38 * i)
            put(ov, c, x + c.width / 2, 1350, a * chip_out, d); x += c.width + gap
        if COLORS_AT <= t < CTA_AT:
            out = 1 - ease((t - (CTA_AT - 0.35)) / 0.3)
            _, sw = led_color(t)
            col = Image.new('RGBA', HL_COLOR.size, (*sw, 255)); col.putalpha(HL_COLOR.getchannel('A'))
            a, d = rise(t, COLORS_AT); put(ov, HL_TOP, W / 2, 1352, a * out, d)
            a, d = rise(t, COLORS_AT + 0.25); put(ov, col, W / 2, 1418, a * out, d)
            a, d = rise(t, COLORS_AT + 0.5); put(ov, HL_BOTTOM, W / 2, 1530, a * out, d)
        if t >= CTA_AT:
            k = ease((t - CTA_AT) / 0.55)
            put(ov, OFF45, W / 2, 1318, k, 0, 0.86 + 0.14 * k)
            a, d = rise(t, CTA_AT + 0.45)
            put(ov, LIMIT, W / 2, 1530, a, d)
            a, d = rise(t, CTA_AT + 0.8)
            beat = 1 + 0.025 * max(0.0, np.sin((t - CTA_AT - 1.3) * 2 * np.pi / 1.1)) * (t > CTA_AT + 1.3)
            put(ov, BUTTON, W / 2, 1600, a, d, beat)
    if vis > 0:
        s = SCRIM.copy(); s.putalpha(s.getchannel('A').point(lambda v: int(v * vis)))
        ov = Image.alpha_composite(s, ov)
    return ov


# ---------------------------------------------------------------- finishing
yy, xx = np.mgrid[0:H, 0:W]
VIGNETTE = (1 - 0.10 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 2)[..., None].astype(np.float32)
RNG = np.random.default_rng(7)
GRAIN = [RNG.normal(0, 2.4, (H, W, 1)).astype(np.float32) for _ in range(8)]


def compose(t, srcs):
    acc, wsum = None, 0.0
    for (name, st, dur, *_), src in zip(SHOTS, srcs):
        if t < st - XF / 2 or t > st + dur + XF / 2:
            continue
        w = 1.0
        if st > 0:
            w = min(w, ease((t - (st - XF / 2)) / XF))
        if st + dur < TOTAL:
            w = min(w, 1 - ease((t - (st + dur - XF / 2)) / XF))
        if w <= 0:
            continue
        u = (t - st + XF / 2) / (dur + XF)
        f = src.frame(u, t).astype(np.float32)
        acc = f * w if acc is None else acc + f * w
        wsum += w
    img = Image.fromarray(np.clip(acc / wsum, 0, 255).astype(np.uint8)).convert('RGBA')
    img = Image.alpha_composite(img, overlay(t)).convert('RGB')
    a = np.asarray(img).astype(np.float32) * VIGNETTE + GRAIN[int(t * FPS) % len(GRAIN)]
    fade = ease(t / 0.4)                      # open from studio white
    a = a * fade + 250 * (1 - fade)
    return np.clip(a, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------- sound
def sound(path):
    sr = 48000; n = int(TOTAL * sr); t = np.arange(n) / sr
    rng = np.random.default_rng(42)

    def lp(x, fc):                      # FFT brickwall-ish low-pass with soft knee
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / sr)
        return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

    def hp(x, fc):
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / sr)
        return np.fft.irfft(X / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** 4), len(x))

    # white-noise room tone, softened top, gently breathing, stereo-decorrelated
    room = [hp(lp(rng.normal(0, 1, n), 5200), 120) for _ in range(2)]
    breathe = 1 + 0.18 * np.sin(2 * np.pi * 0.11 * t) + 0.08 * np.sin(2 * np.pi * 0.047 * t + 1)
    room = [r / np.std(r) * 0.022 * breathe for r in room]
    # airy pad (Cmaj9 voicing), very low, slow swell, lifts slightly for the CTA
    pad = np.zeros(n)
    for f0, amp in [(130.81, 1), (196.0, .8), (246.94, .55), (293.66, .5), (392.0, .35)]:
        pad += amp * np.sin(2 * np.pi * f0 * t + 0.25 * np.sin(2 * np.pi * 0.13 * t + f0))
    pad = lp(pad, 1800) * 0.012 * (1 + 0.6 * np.clip((t - CTA_AT) / 2.0, 0, 1))
    # power-on beep: one soft, short tone with rounded edges + faint electrical hum after
    beep = np.zeros(n); u = t - LED_ON
    env = np.where((u >= 0) & (u < 0.22), np.sin(np.pi * np.clip(u / 0.22, 0, 1)) ** 2, 0)
    beep += 0.075 * env * (np.sin(2 * np.pi * 1568 * u) + 0.18 * np.sin(2 * np.pi * 3136 * u))
    hum_env = np.clip((t - LED_ON) / 0.6, 0, 1) * np.clip((15.4 - t) / 0.8, 0, 1)
    beep += 0.004 * hum_env * (np.sin(2 * np.pi * 120 * t) + 0.5 * np.sin(2 * np.pi * 240 * t))
    master = np.minimum(t / 0.8, 1) * np.clip((TOTAL - t) / 1.2, 0, 1)
    L = (room[0] + pad + beep) * master
    R = (room[1] + pad * 0.97 + beep) * master
    st = np.tanh(np.stack([L, R], 1) * 1.4) / 1.4
    st *= 10 ** (-1 / 20) / max(1e-9, np.abs(st).max()) * 0.5   # peaks ~ -7 dBFS
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr)
        f.writeframes((st * 32767).astype('<i2').tobytes())


# ---------------------------------------------------------------- render
def main():
    srcs = []
    for i, (name, st, dur, cam, *_) in enumerate(SHOTS):
        clip = CLIPS / f'{name[:2]}.mp4'
        srcs.append(Clip(clip, dur) if clip.exists() else Still(name, cam, dur))
        print(f'shot {i + 1}: {"motion clip" if clip.exists() else "still + camera"}', flush=True)
    sound(OUT / 'sound.wav')
    out = OUT / 'LED-Face-Mask.mp4'
    p = subprocess.Popen(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                          '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', str(OUT / 'sound.wav'),
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
                          '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-t', str(TOTAL),
                          '-movflags', '+faststart', str(out)], stdin=subprocess.PIPE)
    nframes = int(TOTAL * FPS)
    for k in range(nframes):
        p.stdin.write(compose(k / FPS, srcs).tobytes())
        if k % 60 == 0:
            print(f'frame {k}/{nframes}', flush=True)
    p.stdin.close(); p.wait()
    print('done ->', out)


if __name__ == '__main__':
    main()

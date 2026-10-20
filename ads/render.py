"""Render silence-themed kinetic-text ads: python3 render.py <A|B|C>
Words are revealed in time with the voiceover clips in work/NN.wav."""
import sys, wave, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
FONT = "/usr/share/fonts/opentype/inter/"
LEAD, GAP, TAIL = 1.0, 0.55, 3.0
KEYWORDS = {"silencio", "mente", "aquieta", "adentro", "calma", "paz", "claridad",
            "presencia", "viaje", "ti", "aquí", "esperándote", "nada"}

ADS = {
    "A": dict(title="cuando la mente se aquieta", clips=range(0, 7),
              top=(10, 8, 30), bot=(40, 22, 78), accent=(190, 170, 255), ring=(150, 120, 255),
              phrases=["Hay un momento, en que el ruido se detiene.", "No afuera. Adentro.",
                       "Cuando la mente se aquieta, los pensamientos pierden su prisa.",
                       "Se vuelven nubes. Pasan. Se alejan.", "Y queda algo que siempre estuvo ahí.",
                       "Una calma que no necesita nada.", "Encuentra tu silencio."]),
    "B": dict(title="el viaje hacia el silencio", clips=range(7, 14),
              top=(4, 18, 22), bot=(10, 62, 66), accent=(150, 235, 220), ring=(80, 210, 190),
              phrases=["El silencio no es un lugar al que se llega corriendo.", "Es un viaje hacia adentro.",
                       "Primero, respiras. Y sueltas.", "Luego, escuchas todo lo que antes no oías.",
                       "Poco a poco, el mundo se vuelve más suave.", "Cada paso te acerca a ti.",
                       "Empieza hoy. Escucha el silencio."]),
    "C": dict(title="lo que descubres en el silencio", clips=range(14, 21),
              top=(22, 10, 8), bot=(88, 44, 22), accent=(255, 205, 140), ring=(255, 160, 90),
              phrases=["Sigue el silencio, y verás adónde te lleva.", "Detrás del ruido, hay claridad.",
                       "Detrás de la prisa, hay presencia.", "Y en el fondo, una paz que no depende de nada.",
                       "No hacía falta buscar más lejos.", "Estaba aquí, esperándote.",
                       "Vuelve a tu silencio."]),
}

def ease(x):
    x = min(1, max(0, x)); return 1 - (1 - x) ** 3

def read_wav(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

def build_layout(text, fonts, last):
    words = text.split()
    for size in range(150 if len(words) <= 4 else 112, 56, -4):
        fr = ImageFont.truetype(FONT + "InterDisplay-Light.otf", size)
        fk = ImageFont.truetype(FONT + "InterDisplay-Medium.otf", size)
        items = []
        for w in words:
            clean = w.strip(".,").lower()
            f = fk if clean in KEYWORDS else fr
            items.append((w, f, clean in KEYWORDS, f.getlength(w)))
        space = size * 0.28
        lines, cur, curw = [], [], 0
        for it in items:
            add = it[3] + (space if cur else 0)
            if cur and curw + add > 860:
                lines.append(cur); cur, curw = [], 0; add = it[3]
            cur.append(it); curw += add
        lines.append(cur)
        if len(lines) <= 4 or size <= 60: break
    lh = int(size * 1.3)
    y0 = H // 2 - (len(lines) * lh) // 2 - 40
    placed = []
    for li, line in enumerate(lines):
        tw = sum(i[3] for i in line) + space * (len(line) - 1)
        x = (W - tw) / 2
        for w, f, kw, wl in line:
            placed.append((w, f, kw, x, y0 + li * lh, size)); x += wl + space
    return placed

def word_masks(w, f, size):
    pad = 40
    bb = f.getbbox(w)
    iw, ih = int(f.getlength(w)) + pad * 2, int(size * 1.5) + pad
    m = Image.new("L", (iw, ih), 0)
    ImageDraw.Draw(m).text((pad, pad // 2), w, font=f, fill=255)
    return [np.asarray(m.filter(ImageFilter.GaussianBlur(b)) if b else m, np.float32) / 255 for b in (0, 5, 12)], pad

def main(key):
    ad = ADS[key]
    # timeline
    t, slots = LEAD, []
    clips = []
    for ci in ad["clips"]:
        a = read_wav(f"work/{ci:02d}.wav"); clips.append(a)
        d = len(a) / 44100; slots.append((t, d)); t += d + GAP
    total = slots[-1][0] + slots[-1][1] + TAIL
    n = int(total * FPS)
    # audio: voice + soft drone
    sr = 44100; au = np.zeros(int(total * sr), np.float32)
    for a, (s, d) in zip(clips, slots):
        i = int(s * sr); au[i:i + len(a)] += a * 0.95
    tt = np.arange(len(au)) / sr
    drone = sum(math.sin(0) + np.sin(2 * np.pi * f * tt + p) * g for f, g, p in
                [(110, 1, 0), (165.2, .6, 1.3), (220.4, .35, 2.1), (82.4, .8, .4)])
    drone *= (0.55 + 0.45 * np.sin(2 * np.pi * tt / 9)) * 0.022
    fade = np.minimum(1, np.minimum(tt / 3, (total - tt) / 3))
    au = np.clip((au + drone * fade) * 1, -1, 1)
    with wave.open(f"work/audio_{key}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((au * 32767).astype(np.int16).tobytes())
    # word timing + masks
    words = []  # dict per word
    for pi, (text, (s, d)) in enumerate(zip(ad["phrases"], slots)):
        pl = build_layout(text, None, pi == 6)
        wts = [len(p[0].strip('.,')) + 2 + (3 if p[0][-1] in ".," else 0) for p in pl]
        tot = sum(wts); acc = 0
        end = s + d + (TAIL - 0.5 if pi == 6 else GAP * 0.7)
        for p, wt in zip(pl, wts):
            ts = s - 0.06 + d * acc / tot; acc += wt
            masks, pad = word_masks(p[0], p[1], p[5])
            words.append(dict(ts=ts, te=end, masks=masks, pad=pad, x=int(p[3]) - pad, y=int(p[4]) - pad // 2,
                              kw=p[2], last=(pi == 6)))
    # background
    ys = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    top, bot = np.array(ad["top"], np.float32), np.array(ad["bot"], np.float32)
    bg = top * (1 - ys) + bot * ys * 0.9
    bg = np.broadcast_to(bg, (H, W, 3)).copy()
    vy, vx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.45 * (((vx - W / 2) / (W / 1.3)) ** 2 + ((vy - H / 2) / (H / 1.3)) ** 2)
    bg *= np.clip(vig, 0.4, 1)[:, :, None]
    rng = np.random.default_rng(7)
    parts = rng.random((60, 4))
    accent = np.array(ad["accent"], np.float32); ring = np.array(ad["ring"], np.float32)
    title_font = ImageFont.truetype(FONT + "Inter-Medium.otf", 30)

    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-i", f"work/audio_{key}.wav", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
           f"silencio_{key}.mp4"]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    sw, sh = W // 4, H // 4
    for fi in range(n):
        t = fi / FPS
        # low-res glow layer: breathing orb + expanding rings + particles
        glow = Image.new("RGB", (sw, sh), (0, 0, 0)); gd = ImageDraw.Draw(glow)
        breath = 0.5 + 0.5 * math.sin(2 * math.pi * t / 6 - 1.2)
        cx, cy = sw / 2, sh * 0.47
        for k in range(4):
            ph = ((t / 7) + k / 4) % 1
            r = 20 + ph * 330; a = (1 - ph) ** 2 * 0.55 * min(1, t / 3)
            gd.ellipse([cx - r, cy - r, cx + r, cy + r], outline=tuple((ring * a).astype(int)), width=2)
        r0 = 75 + 18 * breath
        gd.ellipse([cx - r0, cy - r0, cx + r0, cy + r0], fill=tuple((ring * (0.16 + 0.1 * breath)).astype(int)))
        for px, py, ps, pb in parts:
            yy = (py - t * (0.012 + ps * 0.02)) % 1; xx = (px + math.sin(t * .3 + pb * 6) * 0.02) % 1
            tw = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(t * (.6 + pb) + pb * 9))
            c = tuple((accent * 0.5 * tw).astype(int)); x, y = xx * sw, yy * sh; rr = 1 + ps * 1.5
            gd.ellipse([x - rr, y - rr, x + rr, y + rr], fill=c)
        glow = glow.filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.BILINEAR)
        fr = bg + np.asarray(glow, np.float32) * 0.9
        # words
        for wd in words:
            if t < wd["ts"] or t > wd["te"] + 0.05: continue
            p = ease((t - wd["ts"]) / 0.7)
            a = p
            fo = (wd["te"] - t) / (0.6 if not wd["last"] else 1.2)
            a *= min(1, max(0, fo))
            if a <= 0.01: continue
            m = wd["masks"][0 if p > .75 else 1 if p > .35 else 2]
            rise = int((1 - p) * 28 + (1 - min(1, max(0, fo))) * -18)
            x, y = wd["x"], wd["y"] + rise
            h, w_ = m.shape
            ys_, xs_ = max(0, y), max(0, x); ye, xe = min(H, y + h), min(W, x + w_)
            if ye <= ys_ or xe <= xs_: continue
            mm = m[ys_ - y:ye - y, xs_ - x:xe - x, None] * a
            col = accent if wd["kw"] else np.array([245, 245, 250], np.float32)
            fr[ys_:ye, xs_:xe] = fr[ys_:ye, xs_:xe] * (1 - mm) + col * mm
        # journey line + title
        prog = min(1, t / (total - 1))
        fr[H - 120:H - 117, 140:W - 140] += 22
        fr[H - 120:H - 117, 140:140 + int((W - 280) * prog)] = accent
        img = Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8))
        d2 = ImageDraw.Draw(img, "RGBA")
        ta = int(130 * min(1, t / 2) * min(1, (total - t) / 1.5))
        tx = ad["title"].upper(); tl = title_font.getlength(tx) + len(tx) * 5
        x = (W - tl) / 2
        for ch in tx:
            d2.text((x, 130), ch, font=title_font, fill=(255, 255, 255, ta)); x += title_font.getlength(ch) + 5
        pr.stdin.write(img.tobytes())
    pr.stdin.close(); pr.wait()
    print(key, "done", round(total, 1), "s")

main(sys.argv[1])

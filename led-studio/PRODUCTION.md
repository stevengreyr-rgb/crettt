# LED Face Mask — 23 s commercial

Vertical 1080×1920, 30 fps, H.264 + AAC, faststart. Render: `python3 render_video.py` → `render/LED-Face-Mask.mp4` (master). Delivery file: `LED-Face-Mask-23s.mp4` (10 Mbps, faststart).

## Edit

| Time | Shot | On-screen copy (problem → solution) |
|---|---|---|
| 0–3 s | 01 approach | NO TIME FOR THE SPA? → Your spa ritual, at home. |
| 3–6 s | 02 pick-up | PRICEY MONTHLY TREATMENTS? → One-time investment. |
| 6–9 s | 03 recline | UNCOMFORTABLE MASKS? → Light, with an adjustable strap. |
| 9–12 s | 04 put-on | COMPLICATED DEVICES? → Just put it on. Done. |
| 12–15 s | 05 relax | STRESSFUL DAY? → Unwind while it glows. LEDs power on at 12.55 s with a soft beep. |
| 15–17.5 s | 06 hero | LED FACE MASK · Red LED light / Adjustable strap / At-home use |
| 17.5–20 s | 06 hero | DISCOVER WHAT / EVERY SINGLE COLOR / OFFERS FOR YOUR ROUTINE: the mask cycles blue → green → purple and the headline takes each colour |
| 20–23 s | 06 hero | Back to red: 45% OFF · LIMITED-TIME OFFER · SHOP NOW |

Every shot is 3 s (the hero close runs 8 s), 0.5 s soft dissolves, text animates in while the shot plays.

Sound: white-noise room tone + low airy pad throughout, nothing on the cuts, one gentle beep when the mask turns on with a faint electrical hum underneath, pad lifts a little for the CTA.

## Real body motion (image-to-video)

The current render animates the stills with camera moves only. For real, natural movement, generate one clip per shot with each PNG in `assets/` as the **start image**, 9:16, 1080p, 4–5 s, audio off, and save them as `clips/01.mp4` … `clips/06.mp4`. The script uses any clip it finds there automatically; the titles, timing and sound stay the same.

Checked on Higgsfield (Seedance 2.0): 22.5 credits per 5 s clip at 720p, 60 at 1080p. That's 135 / 360 credits for all six. The account had 0.77 credits.

Prompts (append to each: *"Same woman, same white robe, same white studio. Natural, slow, realistic movement, steady camera. Keep the mask shape, white shell and gray strap unchanged. No text."*):

1. She walks slowly toward the white side table, glancing at the mask with a soft smile; gentle forward camera drift.
2. She lifts the mask off the table with both hands, the strap hanging naturally, looking at it calmly.
3. She settles back onto the treatment bed, holding the unlit mask, relaxing her shoulders.
4. Reclined, she places the unlit mask on her face and adjusts both sides with her hands.
5. Hands resting on her abdomen, breathing slowly; the mask's red LEDs softly turn on.
6. The glowing mask floats and rotates very slightly in the white studio; slow push-in.

## 3D colour creatives (18 s each)

`python3 creatives.py` → `LED-Creative-A-18s.mp4`, `LED-Creative-B-18s.mp4` (1080×1920, 30 fps, ~−31.5 LUFS).

- **A · 360 Spin**: the Higgsfield turntable clip (`clips-src/turn-inside-alpha.mp4`, background removed) keyed onto a white studio. Every light change is a full 360° turn that shows the LED field inside the shell.
- **B · Glow Macro**: the floating hero render, with a different close angle per light and a tinted light sweep on each change.

| Time | On screen |
|---|---|
| 0–3 s | Power-on (click + beep) → RED LIGHT · Firmer-looking skin |
| 3–6 s | BLUE LIGHT · Clearer-looking skin |
| 6–9 s | GREEN LIGHT · More even-looking tone |
| 9–12 s | PURPLE LIGHT · A calm, refreshed look |
| 12–15 s | DISCOVER WHAT / EVERY SINGLE COLOR / OFFERS FOR YOUR ROUTINE: the light cycles on the beat |
| 15–18 s | LED FACE MASK · 45% OFF · LIMITED-TIME OFFER · SHOP NOW |

Visuals: a zoom punch, colour bloom and expanding light ring on every light change. A spins toward the camera and glides with a slight tilt; B whip-zooms (with zoom blur) from one close-up to the next.

Sound (both): a warm chill bed. Soft dark ambient air and muted electric-piano chords sit under a slow, laid-back groove at 80 BPM (soft kick, brushed snare, quiet shaker, warm sine bass). One bar is 3 s, so the downbeats land on the light changes. Every light change gets a muffled click and a soft low thump. There are no bells, beeps or bright notes, and the whole mix is rolled off above 5 kHz. Level is about −31.5 LUFS (very quiet, background only).

Source clips in `clips-src/` (Higgsfield): `turn-red*` (360° turn, red glow), `turn-inside*` (360° turn showing the inside LEDs), `woman-blue` / `woman-green` (Kling, 3 s, real motion; not used yet).

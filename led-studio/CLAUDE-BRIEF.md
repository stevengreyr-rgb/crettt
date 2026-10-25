# LED studio commercial — 13 seconds

This project was prepared and rendered in ChatGPT, not Claude Code. The supplied MP4 is an editorial animatic using still photographs and camera motion. Do not represent it as live-action or generated body motion.

## Creative direction

Deliver a premium vertical 1080 × 1920 H.264 MP4, exactly 13 seconds, 30 fps, AAC audio and faststart. Maintain the same adult woman, face, low bun, opaque white bathrobe, treatment bed, pillow, white cylinder table and white cyclorama throughout. No scene or wardrobe changes. Preserve the LED mask geometry, white rigid shell, gray strap, openings and natural face-sized scale. No collage or product storyboard grids.

## Timeline

| Time | Action | Frame reference |
|---|---|---|
| 0–1.6 s | Woman approaches the mask on the table; subtle forward tracking camera | 01-approach.png |
| 1.6–3.2 s | She picks it up with both hands; natural hand contact and hanging strap | 02-pick-up.png |
| 3.2–4.8 s | She reclines on the bed holding the unlit mask; relaxed, plausible movement | 03-recline.png |
| 4.8–6.5 s | She aligns and puts on the unlit mask, adjusts both sides and strap | 04-put-on.png |
| 6.5–8.5 s | Hands rest on abdomen; red LEDs illuminate softly; relaxed breathing | 05-relax.png |
| 8.5–13 s | Match cut to identical mask hovering in same white studio; subtle float and descriptions | 06-floating-hero.png |

Keep an unobstructed product silhouette for the final 4.5 seconds. Overlay crisp editable typography in post, never inside generated video. Title: LED FACE MASK. Descriptions: Red LED illumination / Adjustable head strap / At-home use. Fade descriptions in sequentially. No unsupported medical results, wavelengths, treatment duration, reviews, discounts or certifications.

## To create full character motion

Use an authenticated image-to-video service explicitly authorized by the user. Claude Code is the coding/editorial orchestrator, not itself a video-generation model. First query available models, supported reference roles, duration, resolution and current cost. Do not install tools, assume API access, spend credits or claim a service ran without evidence. Use the included photographs as identity and start/end references where supported. Generate each action separately with natural small movements, preserving identity, hand anatomy and mask shape. Trim and assemble the clips to the above exact timing. Avoid warping or optical-flow morphing between still photographs as a substitute for body motion.

## Working local render

Run `python3 render_video.py` with FFmpeg, numpy and the listed Nimbus font files available. All images are in `assets/`. Output is `render/LED-Studio-13s-HD.mp4`. Replace the still-image shot-rendering section with verified generated motion clips for the final animated-body version; keep the timeline, titles and sound design. The original ambient sound and chimes in this project are synthesized by the script.

## QA requirements

Verify 13.000 s duration, 1080 × 1920, 30 fps, H.264 and AAC. Inspect all transitions, face/hand anatomy, strap continuity, mask fit, typography margins, end-frame readability and audio peaks. Export a playable faststart MP4. The current source photographs are below output resolution and are resampled; do not claim native 4K or new detail.

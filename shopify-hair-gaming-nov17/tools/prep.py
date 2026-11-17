# Resize photo + cutout to 1600x2000 and move the model down by dy px (top filled from the backdrop).
# The cutout is kept ONLY in the headline band (y < band) so the rest of the slide is the untouched photo
# (no cut-out edges, no halo). Alpha is kept as-is from the matting model (no blur/erode).
# usage: python3 prep.py photo.png cut.png dy out_photo.png out_cut.png [band]
import sys
from PIL import Image, ImageDraw, ImageFilter
ph, cu, dy, op, oc = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
band = int(sys.argv[6]) if len(sys.argv) > 6 else 560
def place(im, fill):
    out = Image.new('RGBA', (1600, 2000), (0, 0, 0, 0))
    if fill and dy > 0:
        out.paste(im.crop((0, 0, 1600, 4)).resize((1600, dy + 4)), (0, 0))
    out.alpha_composite(im, (0, dy)) if im.mode == 'RGBA' else out.paste(im, (0, dy))
    return out
photo = Image.open(ph).convert('RGBA').resize((1600, 2000), Image.LANCZOS)
place(photo, True).convert('RGB').save(op)
cut = place(Image.open(cu).convert('RGBA').resize((1600, 2000), Image.LANCZOS), False)
# fade the cutout out just below the headline band so nothing below it is a composite
m = Image.new('L', (1600, 2000), 0); ImageDraw.Draw(m).rectangle((0, 0, 1600, band), fill=255)
m = m.filter(ImageFilter.GaussianBlur(25))
r, g, b, a = cut.split()
a = Image.composite(a, Image.new('L', a.size, 0), m)
Image.merge('RGBA', (r, g, b, a)).save(oc)

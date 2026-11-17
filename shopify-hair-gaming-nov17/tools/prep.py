# Resize photo + cutout to 1600x2000 and move the model down by dy px (top filled from the backdrop).
# usage: python3 prep.py photo.png cut.png dy out_photo.png out_cut.png
import sys
from PIL import Image, ImageFilter
ph, cu, dy, op, oc = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
def go(src, dst, fill, erode):
    im = Image.open(src).convert('RGBA').resize((1600, 2000), Image.LANCZOS)
    if erode:
        r, g, b, a = im.split()
        a = a.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
        im = Image.merge('RGBA', (r, g, b, a))
    out = Image.new('RGBA', (1600, 2000), (0, 0, 0, 0))
    if fill and dy > 0:
        out.paste(im.crop((0, 0, 1600, 8)).resize((1600, dy + 8)), (0, 0))
    out.paste(im, (0, dy), im)
    out.save(dst)
go(ph, op, True, False); go(cu, oc, False, True)

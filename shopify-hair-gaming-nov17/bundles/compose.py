from PIL import Image, ImageFilter, ImageDraw
import sys
W,H=1200,1620
def trim(im):
    im=im.convert('RGBA');a=im.split()[3].point(lambda v:255 if v>8 else 0);return im.crop(a.getbbox())
def fit(im,h=None,w=None):
    if h: return im.resize((round(im.width*h/im.height),h),Image.LANCZOS)
    return im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
def canvas(top,bot):
    c=Image.new('RGBA',(W,H));d=ImageDraw.Draw(c)
    for y in range(H):
        t=y/H;d.line([(0,y),(W,y)],fill=tuple(round(top[i]*(1-t)+bot[i]*t) for i in range(3))+(255,))
    return c
def shadow(c,cx,y,w,h=36,op=70,blur=22):
    s=Image.new('L',(W,H),0);ImageDraw.Draw(s).ellipse([cx-w/2,y-h/2,cx+w/2,y+h/2],fill=op)
    s=s.filter(ImageFilter.GaussianBlur(blur));sh=Image.new('RGBA',(W,H),(60,30,30,0));sh.putalpha(s);c.alpha_composite(sh)
def place(c,im,x,y): c.alpha_composite(im,(round(x),round(y)))
floor=880
# HAIR
c=canvas((250,236,240),(243,221,229))
wand=fit(trim(Image.open('airwave-wand-t.png')),h=720);dry=fit(trim(Image.open('superair-cut-t.png')),h=660);sl=fit(trim(Image.open('airsleek-cut-t.png')),h=720)
for im,cx in [(wand,330),(dry,600),(sl,880)]: shadow(c,cx,floor,im.width*1.5)
place(c,wand,330-wand.width/2,floor-wand.height);place(c,dry,600-dry.width/2,floor-dry.height);place(c,sl,880-sl.width/2,floor-sl.height)
c.convert('RGB').save('../bundle-hair.jpg',quality=90)
# PLAY
c=canvas((238,240,246),(222,226,238))
sw=fit(trim(Image.open('switch-cut.png')),w=820);po=fit(trim(Image.open('portal-cut.png')),w=720)
shadow(c,520,640,760,40,60);place(c,sw,520-sw.width/2,640-sw.height)
shadow(c,700,floor,700,40,80);place(c,po,700-po.width/2,floor-po.height)
c.convert('RGB').save('../bundle-play.jpg',quality=90)
# AUDIO
c=canvas((244,240,236),(232,225,219))
ev=fit(trim(Image.open('everyday-cut.png')),h=600);x=fit(trim(Image.open('x15-cut.png')),h=560)
shadow(c,390,floor,ev.width*1.0,40,70);place(c,ev,390-ev.width/2,floor-ev.height)
shadow(c,830,floor,x.width*1.0,40,90);place(c,x,830-x.width/2,floor-x.height)
c.convert('RGB').save('../bundle-audio.jpg',quality=90)

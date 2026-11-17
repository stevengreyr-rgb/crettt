from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import sys,os
S='src/'
def cut(f):
    im=Image.open(S+f).convert('RGBA');a=im.split()[3]
    # erode alpha 1px to kill fringe/halo
    a=a.filter(ImageFilter.MinFilter(3));im.putalpha(a)
    return im.crop(a.point(lambda v:255 if v>8 else 0).getbbox())
def fit(im,h=None,w=None):
    r=(h/im.height) if h else (w/im.width)
    im=im.resize((round(im.width*r),round(im.height*r)),Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2,percent=70,threshold=2))
def shadow(c,cx,y,w,h,op=95,blur=18):
    s=Image.new('L',c.size,0);ImageDraw.Draw(s).ellipse([cx-w/2,y-h/2,cx+w/2,y+h/2],fill=op)
    s=s.filter(ImageFilter.GaussianBlur(blur));sh=Image.new('RGBA',c.size,(70,60,75,0));sh.putalpha(s);c.alpha_composite(sh)
def refl(c,im,x,y,op=0.18):
    r=im.transpose(Image.FLIP_TOP_BOTTOM);a=r.split()[3]
    g=Image.new('L',r.size);d=ImageDraw.Draw(g)
    for yy in range(r.height): d.line([(0,yy),(r.width,yy)],fill=int(255*op*max(0,1-yy/(r.height*0.35))))
    from PIL import ImageChops
    r.putalpha(ImageChops.multiply(a,g));c.alpha_composite(r,(round(x),round(y)))
def put(c,im,cx,floor,sw=1.0,shop=95):
    x=cx-im.width/2;y=floor-im.height
    refl(c,im,x,floor);shadow(c,cx,floor,im.width*sw,max(16,im.width*0.07),shop)
    c.alpha_composite(im,(round(x),round(y)))
K=1.0
def mobile(bgf,out):
    global K;K=1.16
    W,H=1500,2232
    c=Image.open(bgf).convert('RGBA').resize((W,H),Image.LANCZOS)
    U=H/1024  # units from 1024-high design
    sw_=fit(cut('switch-cut.png'),w=round(330*U*K));sa=fit(cut('superair-hd.png'),h=round(300*U*K));sl=fit(cut('airsleek-hd.png'),h=round(255*U*K))
    wd=fit(cut('airwave-wand-t.png'),h=round(300*U*K));po=fit(cut('portal-hd.png'),w=round(250*U*K));x15=fit(cut('x15-cut.png'),h=round(92*U*K));ev=fit(cut('everyday-cut.png'),h=round(100*U*K))
    put(c,sw_,W*0.30,654*U,0.95,80)
    put(c,sa,W*0.62,662*U,1.4)
    put(c,wd,W*0.47,666*U,2.2)
    put(c,sl,W*0.84,670*U,1.1)
    put(c,po,W*0.31,714*U,0.95,110)
    put(c,ev,W*0.66,718*U,0.9,90)
    put(c,x15,W*0.86,722*U,0.9,110)
    c.convert('RGB').save(out,quality=92)
def desktop(bgf,out):
    global K;K=1.12
    W,H=2400,1343
    c=Image.open(bgf).convert('RGBA').resize((W,H),Image.LANCZOS)
    U=H/752
    sw_=fit(cut('switch-cut.png'),w=round(330*U*K));sa=fit(cut('superair-hd.png'),h=round(300*U*K));sl=fit(cut('airsleek-hd.png'),h=round(255*U*K))
    wd=fit(cut('airwave-wand-t.png'),h=round(300*U*K));po=fit(cut('portal-hd.png'),w=round(250*U*K));x15=fit(cut('x15-cut.png'),h=round(92*U*K));ev=fit(cut('everyday-cut.png'),h=round(100*U*K))
    put(c,sw_,W*0.17,505*U,0.95,80)
    put(c,sa,W*0.36,512*U,1.4)
    put(c,wd,W*0.27,516*U,2.2)
    put(c,sl,W*0.48,520*U,1.1)
    put(c,po,W*0.19,566*U,0.95,110)
    put(c,ev,W*0.38,570*U,0.9,90)
    put(c,x15,W*0.49,574*U,0.9,110)
    c.convert('RGB').save(out,quality=92)
if sys.argv[1]=='m': mobile(sys.argv[2],sys.argv[3])
else: desktop(sys.argv[2],sys.argv[3])

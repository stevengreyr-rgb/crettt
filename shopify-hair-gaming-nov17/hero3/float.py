from PIL import Image, ImageFilter
import sys
BG=(250,248,244)
S='src/'
def cut(f):
    im=Image.open(S+f).convert('RGBA');a=im.split()[3].filter(ImageFilter.MinFilter(3));im.putalpha(a)
    return im.crop(a.point(lambda v:255 if v>8 else 0).getbbox())
def fit(im,h=None,w=None,rot=0):
    r=(h/im.height) if h else (w/im.width)
    im=im.resize((round(im.width*r),round(im.height*r)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2,70,2))
    return im.rotate(rot,resample=Image.BICUBIC,expand=True) if rot else im
def put(c,im,cx,cy):
    x,y=round(cx-im.width/2),round(cy-im.height/2)
    a=im.split()[3].point(lambda v:int(v*0.10));sh=Image.new('RGBA',im.size,(60,40,50,0));sh.putalpha(a)
    pad=Image.new('RGBA',(im.width+160,im.height+160),(0,0,0,0));pad.alpha_composite(sh,(80,80));pad=pad.filter(ImageFilter.GaussianBlur(28))
    c.alpha_composite(pad,(x-80+18,y-80+46));c.alpha_composite(im,(x,y))
def letters(): return cut('letters-cut.png')
def mobile():
    W,H=1500,2100;c=Image.new('RGBA',(W,H),BG+(255,))
    L=fit(letters(),w=1240);put(c,L,W/2,50+L.height/2);top=L.height+90
    put(c,fit(cut('switch-cut.png'),w=600,rot=7),380,top+200)
    put(c,fit(cut('airwave-wand-t.png'),h=760,rot=-14),770,top+430)
    put(c,fit(cut('superair-hd.png'),h=660,rot=9),1010,top+380)
    put(c,fit(cut('airsleek-hd.png'),h=600,rot=-8),1270,top+440)
    put(c,fit(cut('portal-hd.png'),w=540,rot=-7),390,top+600)
    put(c,fit(cut('everyday-cut.png'),h=270,rot=-10),850,top+800)
    put(c,fit(cut('x15-cut.png'),h=240,rot=12),1170,top+820)
    return c.crop((0,0,W,top+990))
def desktop():
    W,H=2400,1100;c=Image.new('RGBA',(W,H),BG+(255,))
    L=fit(letters(),w=760);put(c,L,1870,40+L.height/2)
    put(c,fit(cut('switch-cut.png'),w=520,rot=7),330,300)
    put(c,fit(cut('airwave-wand-t.png'),h=700,rot=-14),690,480)
    put(c,fit(cut('superair-hd.png'),h=620,rot=9),900,430)
    put(c,fit(cut('airsleek-hd.png'),h=560,rot=-8),1130,500)
    put(c,fit(cut('portal-hd.png'),w=500,rot=-7),320,720)
    put(c,fit(cut('everyday-cut.png'),h=240,rot=-10),730,880)
    put(c,fit(cut('x15-cut.png'),h=215,rot=12),990,900)
    return c
mobile().convert('RGB').save('hero2-m.jpg',quality=93)
desktop().convert('RGB').save('hero2-d.jpg',quality=93)

from PIL import Image, ImageFilter, ImageDraw, ImageFont
W,H=1200,640
TINT={'hair':(250,229,237),'play':(229,234,253),'audio':(244,233,221)}
F='../fonts/';I='/usr/share/fonts/opentype/inter/'
osw=lambda s:ImageFont.truetype(F+'Oswald-Bold.ttf',s)
inter=lambda s,w='ExtraBold':ImageFont.truetype(I+f'Inter-{w}.otf',s)
def cut(f):
    im=Image.open(f).convert('RGBA');a=im.split()[3].filter(ImageFilter.MinFilter(3));im.putalpha(a)
    return im.crop(a.point(lambda v:255 if v>8 else 0).getbbox())
def fit(im,h=None,w=None,rot=0):
    r=(h/im.height) if h else (w/im.width)
    im=im.resize((round(im.width*r),round(im.height*r)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2,70,2))
    return im.rotate(rot,resample=Image.BICUBIC,expand=True) if rot else im
def put(c,im,cx,cy): c.alpha_composite(im,(round(cx-im.width/2),round(cy-im.height/2)))
S='src/'
def hair(c):
    put(c,fit(cut(S+'airwave-wand-t.png'),h=520,rot=8),150,400)
    put(c,fit(cut(S+'superair-cut-t.png'),h=480,rot=-6),390,390)
    put(c,fit(cut(S+'airsleek-cut-t.png'),h=520,rot=7),680,410)
def play(c):
    put(c,fit(cut(S+'switch-cut.png'),w=470,rot=5),500,300)
    put(c,fit(cut(S+'portal-cut.png'),w=440,rot=-6),530,520)
def audio(c):
    put(c,fit(cut(S+'everyday-cut.png'),h=420,rot=-7),300,420)
    put(c,fit(cut(S+'x15-cut.png'),h=390,rot=8),640,440)
X0,X1=600,1160
def text(c,acc,kicker,title,line,now,was,save):
    d=ImageDraw.Draw(c);ink=(26,18,22)
    d.text((X0,60),kicker.upper(),font=inter(28),fill=acc)
    s=110
    while d.textlength(title.upper(),font=osw(s))>X1-X0: s-=2
    d.text((X0,96),title.upper(),font=osw(s),fill=ink)
    d.text((X0,250),line.upper(),font=inter(25),fill=ink)
    fn,fw,fs=inter(50,'Black'),inter(32,'Medium'),inter(23,'ExtraBold')
    x=X0;y=292
    d.text((x,y),now,font=fn,fill=ink);x+=d.textlength(now,font=fn)+16
    gw=d.textlength(was,font=fw);d.text((x,y+14),was,font=fw,fill=(150,140,145));d.line([(x,y+34),(x+gw,y+34)],fill=(150,140,145),width=3)
    sv=f'YOU SAVE {save}';pw=d.textlength(sv,font=fs)+36
    d.rounded_rectangle([X0,y+76,X0+pw,y+120],radius=22,fill=acc);d.text((X0+18,y+84),sv,font=fs,fill=(255,255,255))
    d.text((X0,y+136),'Applied automatically · No code',font=inter(22,'Medium'),fill=(120,110,115))
    # bottom zone y 500-600 reserved for the HTML button
PINK=(209,40,109);BLUE=(58,75,209);BROWN=(138,90,60)
jobs={
 'hair-fl':('hair',hair,PINK,'Flash sale · 30% off each','The Hair Set','Any 2 hair tools · Ends Nov 19','$558.60','$798.00','$239.40'),
 'hair':('hair',hair,PINK,'Save 15% · Buy 3, save 25%','The Hair Set','Buy any 2 hair tools','$678.30','$798.00','$119.70'),
 'play':('play',play,BLUE,'Save 15%','The Play Duo','Any 2 consoles or controllers','From $295.80','$348.00','$52.20'),
 'audio-fl':('audio',audio,BROWN,'Flash sale · 30% off','The Audio Pair','Every pair · Ends Nov 19','$68.60','$98.00','$29.40'),
 'audio':('audio',audio,BROWN,'Save 15%','The Audio Pair','Any 2 audio items','$83.30','$98.00','$14.70'),
}
def group(fn):
    L=Image.new('RGBA',(1400,1000),(0,0,0,0));fn(L)
    L=L.crop(L.getbbox());bw,bh=550,560;r=min(bw/L.width,bh/L.height)
    L=L.resize((round(L.width*r),round(L.height*r)),Image.LANCZOS)
    return L
for k,(t,fn,acc,*tx) in jobs.items():
    c=Image.new('RGBA',(W,H),TINT[t]+(255,));L=group(fn);c.alpha_composite(L,(round(25+(550-L.width)/2),round((H-L.height)/2)));text(c,acc,*tx);c.convert('RGB').save(f'pm-{k}.jpg',quality=92)

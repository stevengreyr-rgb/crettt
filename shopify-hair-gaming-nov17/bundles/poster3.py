from PIL import Image, ImageFilter, ImageDraw, ImageFont
BG=(250,248,244)
TINT={'hair':(250,229,237),'play':(229,234,253),'audio':(244,233,221)};W,H=1200,1400
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
def ctext(d,y,txt,font,fill,track=0):
    w=sum(d.textlength(ch,font=font) for ch in txt)+track*(len(txt)-1);x=(W-w)/2
    for ch in txt: d.text((x,y),ch,font=font,fill=fill);x+=d.textlength(ch,font=font)+track
def textblock(c,acc,kicker,title,line,now,was,save,y0=800):
    d=ImageDraw.Draw(c);ink=(26,18,22)
    ctext(d,y0,kicker.upper(),inter(40),acc,3)
    ctext(d,y0+50,title.upper(),osw(170),ink)
    ctext(d,y0+280,line.upper(),inter(38),ink)
    # price row
    fn,fw,fs=inter(70,'Black'),inter(44,'Medium'),inter(32,'ExtraBold')
    sv=f'YOU SAVE {save}'.upper();pw=d.textlength(sv,font=fs)+48
    tw=d.textlength(now,font=fn)+24+d.textlength(was,font=fw)+24+pw;x=(W-tw)/2;y=y0+350
    d.text((x,y),now,font=fn,fill=ink);x+=d.textlength(now,font=fn)+24
    gw=d.textlength(was,font=fw);d.text((x,y+18),was,font=fw,fill=(150,140,145));d.line([(x,y+46),(x+gw,y+46)],fill=(150,140,145),width=4);x+=gw+24
    d.rounded_rectangle([x,y+12,x+pw,y+68],radius=28,fill=acc);d.text((x+24,y+22),sv,font=fs,fill=(255,255,255))
    ctext(d,y0+470,'Applied automatically at checkout · No code',inter(30,'Medium'),(120,110,115))
S='src/'
def hair():
    c=Image.new('RGBA',(W,H),TINT['hair']+(255,))
    put(c,fit(cut(S+'airwave-wand-t.png'),h=600,rot=8),250,390)
    put(c,fit(cut(S+'superair-cut-t.png'),h=570,rot=-6),560,370)
    put(c,fit(cut(S+'airsleek-cut-t.png'),h=600,rot=7),920,410)
    return c
def play():
    c=Image.new('RGBA',(W,H),TINT['play']+(255,))
    put(c,fit(cut(S+'switch-cut.png'),w=760,rot=5),520,290)
    put(c,fit(cut(S+'portal-cut.png'),w=700,rot=-6),690,600)
    return c
def audio():
    c=Image.new('RGBA',(W,H),TINT['audio']+(255,))
    put(c,fit(cut(S+'everyday-cut.png'),h=540,rot=-7),400,410)
    put(c,fit(cut(S+'x15-cut.png'),h=500,rot=8),820,440)
    return c
PINK=(209,40,109);BLUE=(58,75,209);BROWN=(138,90,60)
jobs={
 'hair-fl':(hair,PINK,'Flash sale · 30% off each','The Hair Set','Any 2 hair tools · Ends Nov 19','$558.60','$798.00','$239.40'),
 'hair':(hair,PINK,'Save 15% · Buy 3, save 25%','The Hair Set','Buy any 2 hair tools','$678.30','$798.00','$119.70'),
 'play':(play,BLUE,'Save 15%','The Play Duo','Any 2 consoles or controllers','From $295.80','$348.00','$52.20'),
 'audio-fl':(audio,BROWN,'Flash sale · 30% off','The Audio Pair','Every pair of earbuds · Ends Nov 19','$68.60','$98.00','$29.40'),
 'audio':(audio,BROWN,'Save 15%','The Audio Pair','Any 2 audio items','$83.30','$98.00','$14.70'),
}
for k,(fn,acc,*t) in jobs.items():
    c=fn();textblock(c,acc,*t);c.convert('RGB').save(f'p3-{k}.jpg',quality=92)

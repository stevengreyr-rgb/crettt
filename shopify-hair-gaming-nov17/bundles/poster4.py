import sys
from PIL import Image, ImageFilter, ImageDraw, ImageFont
F='../fonts/';I='/usr/share/fonts/opentype/inter/'
osw=lambda s:ImageFont.truetype(F+'Oswald-Bold.ttf',s)
inter=lambda s,w='ExtraBold':ImageFont.truetype(I+f'Inter-{w}.otf',s)
TINT={'hair':(250,229,237),'play':(229,234,253),'audio':(244,233,221)}
SH={'hair':(120,40,70),'play':(40,50,120),'audio':(100,70,45)}
P={k:Image.open(f'up/{k}-3d.png') for k in ['airwave','superair','airsleek','switch','portal','everyday','x15']}
def prod(k,h=None,w=None,rot=0):
    im=P[k];r=(h/im.height) if h else (w/im.width)
    im=im.resize((round(im.width*r),round(im.height*r)),Image.LANCZOS)
    return im.rotate(rot,resample=Image.BICUBIC,expand=True) if rot else im
LAY={
 'hair':[('airwave',dict(h=1000,rot=8),300,560),('superair',dict(h=950,rot=-6),760,540),('airsleek',dict(h=1000,rot=7),1240,580)],
 'play':[('switch',dict(w=1300,rot=5),760,420),('portal',dict(w=1200,rot=-6),860,900)],
 'audio':[('everyday',dict(h=900,rot=-7),520,560),('x15',dict(h=850,rot=8),1160,600)],
}
def group(t,bw,bh):
    L=Image.new('RGBA',(2000,1500),(0,0,0,0));S=Image.new('RGBA',L.size,(0,0,0,0))
    for k,kw,cx,cy in LAY[t]:
        im=prod(k,**kw);x,y=round(cx-im.width/2),round(cy-im.height/2)
        L.alpha_composite(im,(x,y))
        sh=Image.new('RGBA',im.size,SH[t]+(0,));sh.putalpha(im.split()[3].point(lambda v:int(v*0.20)))
        S.alpha_composite(sh,(x+10,y+60))
    S=S.filter(ImageFilter.GaussianBlur(34));S.alpha_composite(L);G=S
    bb=L.getbbox();G=G.crop((bb[0]-60,bb[1]-60,bb[2]+60,bb[3]+110))
    r=min(bw/G.width,bh/G.height);G=G.resize((round(G.width*r),round(G.height*r)),Image.LANCZOS)
    return G.filter(ImageFilter.UnsharpMask(1.0,60,2))
def ctext(d,W,y,txt,font,fill,track=0):
    w=sum(d.textlength(ch,font=font) for ch in txt)+track*(len(txt)-1);x=(W-w)/2
    for ch in txt: d.text((x,y),ch,font=font,fill=fill);x+=d.textlength(ch,font=font)+track
def desk(t,acc,kicker,title,line,now,was,save):
    W,H=1200,1400;c=Image.new('RGBA',(W,H),TINT[t]+(255,))
    G=group(t,1180,800);c.alpha_composite(G,(round((W-G.width)/2),round(max(0,790-G.height)/2)))
    d=ImageDraw.Draw(c);ink=(26,18,22);y0=800
    ctext(d,W,y0,kicker.upper(),inter(40),acc,3);ctext(d,W,y0+50,title.upper(),osw(170),ink);ctext(d,W,y0+280,line.upper(),inter(38),ink)
    fn,fw,fs=inter(70,'Black'),inter(44,'Medium'),inter(32,'ExtraBold');sv=f'YOU SAVE {save}';pw=d.textlength(sv,font=fs)+48
    tw=d.textlength(now,font=fn)+24+d.textlength(was,font=fw)+24+pw;x=(W-tw)/2;y=y0+350
    d.text((x,y),now,font=fn,fill=ink);x+=d.textlength(now,font=fn)+24
    gw=d.textlength(was,font=fw);d.text((x,y+18),was,font=fw,fill=(150,140,145));d.line([(x,y+46),(x+gw,y+46)],fill=(150,140,145),width=4);x+=gw+24
    d.rounded_rectangle([x,y+12,x+pw,y+68],radius=28,fill=acc);d.text((x+24,y+22),sv,font=fs,fill=(255,255,255))
    ctext(d,W,y0+470,'Applied automatically at checkout · No code',inter(30,'Medium'),(120,110,115))
    return c
def mob(t,acc,kicker,title,line,now,was,save):
    W,H=1200,640;c=Image.new('RGBA',(W,H),TINT[t]+(255,))
    G=group(t,600,630);c.alpha_composite(G,(round(10+(600-G.width)/2),round((H-G.height)/2)))
    d=ImageDraw.Draw(c);ink=(26,18,22);X0,X1=620,1170
    d.text((X0,60),kicker.upper(),font=inter(28),fill=acc)
    s=110
    while d.textlength(title.upper(),font=osw(s))>X1-X0: s-=2
    d.text((X0,96),title.upper(),font=osw(s),fill=ink);d.text((X0,250),line.upper(),font=inter(25),fill=ink)
    fn,fw,fs=inter(50,'Black'),inter(32,'Medium'),inter(23,'ExtraBold');x=X0;y=292
    d.text((x,y),now,font=fn,fill=ink);x+=d.textlength(now,font=fn)+16
    gw=d.textlength(was,font=fw);d.text((x,y+14),was,font=fw,fill=(150,140,145));d.line([(x,y+34),(x+gw,y+34)],fill=(150,140,145),width=3)
    sv=f'YOU SAVE {save}';pw=d.textlength(sv,font=fs)+36
    d.rounded_rectangle([X0,y+76,X0+pw,y+120],radius=22,fill=acc);d.text((X0+18,y+84),sv,font=fs,fill=(255,255,255))
    d.text((X0,y+136),'Applied automatically · No code',font=inter(22,'Medium'),fill=(120,110,115))
    return c
PINK=(209,40,109);BLUE=(58,75,209);BROWN=(138,90,60)
J={
 'hair-fl':('hair',PINK,'Flash sale · 30% off each','The Hair Set','Any 2 hair tools · Ends Nov 19','$558.60','$798.00','$239.40'),
 'hair':('hair',PINK,'Save 15% · Buy 3, save 25%','The Hair Set','Buy any 2 hair tools','$678.30','$798.00','$119.70'),
 'play':('play',BLUE,'Save 15%','The Play Duo','Any 2 consoles or controllers','From $295.80','$348.00','$52.20'),
 'audio-fl':('audio',BROWN,'Flash sale · 30% off','The Audio Pair','Every pair of earbuds · Ends Nov 19','$68.60','$98.00','$29.40'),
 'audio':('audio',BROWN,'Save 15%','The Audio Pair','Any 2 audio items','$83.30','$98.00','$14.70'),
}
ML={'audio-fl':'Every pair · Ends Nov 19'}
for k,(t,acc,*tx) in J.items():
    desk(t,acc,*tx).convert('RGB').save(f'p4-{k}.jpg',quality=93)
    tm=list(tx); tm[2]=ML.get(k,tm[2]); mob(t,acc,*tm).convert('RGB').save(f'pm4-{k}.jpg',quality=93)

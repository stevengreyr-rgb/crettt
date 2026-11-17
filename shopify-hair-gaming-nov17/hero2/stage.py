from PIL import Image, ImageFilter, ImageDraw, ImageEnhance, ImageChops
def P(n,h=None,w=None):
    im=Image.open(f'src/{n}.png').convert('RGBA')
    if h: return im.resize((int(im.width*h/im.height),h),Image.LANCZOS)
    return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
def refl(c,im,x,y0,k=.28,gap=0):
    r=im.transpose(Image.FLIP_TOP_BOTTOM); r=ImageEnhance.Brightness(r).enhance(.65)
    g=Image.linear_gradient('L').resize(r.size).point(lambda v:int(max(0,255-v*1.6)*k))
    r.putalpha(ImageChops.multiply(r.split()[3],g)); r=r.filter(ImageFilter.GaussianBlur(3+gap/20))
    c.alpha_composite(r,(x,y0))
def stand(c,im,cx,base):
    x=int(cx-im.width/2)
    sh=Image.new('L',c.size,0); ImageDraw.Draw(sh).ellipse((x+im.width*.05,base-12,x+im.width*.95,base+14),fill=190)
    c.paste(Image.new('RGBA',c.size,(4,2,12,255)),(0,0),sh.filter(ImageFilter.GaussianBlur(12)))
    refl(c,im,x,base); c.alpha_composite(im,(x,base-im.height))
def floatp(c,im,cx,bottom,floor):
    x=int(cx-im.width/2)
    # soft light pool on floor
    pool=Image.new('L',c.size,0); ImageDraw.Draw(pool).ellipse((cx-im.width*.9,floor-18,cx+im.width*.9,floor+22),fill=110)
    c.paste(Image.new('RGBA',c.size,(255,140,220,255)),(0,0),pool.filter(ImageFilter.GaussianBlur(26)))
    refl(c,im,x,floor+(floor-bottom),k=.18,gap=floor-bottom)
    c.alpha_composite(im,(x,bottom-im.height))
def build(mode):
    if mode=='d':
        c=Image.open('bg-d.png').convert('RGBA').resize((2400,1350),Image.LANCZOS); F=1010
        hair=[('airwave-wand-t',820,1390,900),('superair-cut-t',700,1640,880),('airsleek-cut-t',700,1960,900)]
        game=[('switch-cut',dict(w=660),1530,1235),('portal-cut',dict(w=560),2060,1235)]
    else:
        bg=Image.open('bg-m.png').convert('RGBA').resize((1600,2000),Image.LANCZOS)
        c=Image.new('RGBA',(1600,2400)); c.paste(bg.crop((0,0,1600,6)).resize((1600,400)),(0,0)); c.paste(bg,(0,400)); F=1820
        hair=[('airwave-wand-t',760,330,1700),('superair-cut-t',650,750,1680),('airsleek-cut-t',640,1210,1700)]
        game=[('switch-cut',dict(w=760),520,2270),('portal-cut',dict(w=640),1180,2270)]
    for n,h,cx,b in hair: floatp(c,P(n,h=h),cx,b,F)
    for n,kw,cx,b in game: stand(c,P(n,**kw),cx,b)
    c.convert('RGB').save(f'stage-{mode}.jpg',quality=93)
build('d'); build('m')

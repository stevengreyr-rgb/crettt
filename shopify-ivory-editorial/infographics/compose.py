from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys
F='/tmp/claude-0/-home-user-crettt/188f4596-ba69-5b98-9657-80a0662c3097/scratchpad/fonts/inter/extras/ttf/'
def font(w,s): return ImageFont.truetype(F+'Inter-'+w+'.ttf',s)
INK=(51,37,33); GREY=(110,96,88); ACC=(149,130,94)

def wrap(d,text,f,w):
    lines=[];cur=''
    for word in text.split():
        t=(cur+' '+word).strip()
        if d.textlength(t,font=f)<=w: cur=t
        else: lines.append(cur); cur=word
    if cur: lines.append(cur)
    return lines

def make(bgfile,out,shift,kicker,title,sub,beams,foot,colw):
    bg=Image.open(bgfile).convert('RGB').resize((2048,2048),Image.LANCZOS)
    cream=bg.getpixel((20,20))
    cv=Image.new('RGB',(2048,2048),cream)
    cv.paste(bg,(0,shift))
    # blend the seam at the top of the pasted image
    grad=Image.new('L',(2048,120)); 
    for y in range(120): ImageDraw.Draw(grad).line([(0,y),(2048,y)],fill=int(255*y/120))
    top=Image.new('RGB',(2048,120),cream); cv.paste(top,(0,shift),Image.eval(grad,lambda v:255-v))
    d=ImageDraw.Draw(cv)
    x0=110
    d.text((x0,96),kicker.upper(),font=font('SemiBold',30),fill=ACC,spacing=0)
    d.text((x0,146),title,font=font('SemiBold',76),fill=INK)
    yy=250
    for ln in wrap(d,sub,font('Regular',36),1500):
        d.text((x0,yy),ln,font=font('Regular',36),fill=GREY); yy+=50
    ly=yy+40
    for (bx,name,nm,desc) in beams:
        X=int(bx*2)-40
        X=max(x0-10,min(X,2048-colw-60))
        y=ly
        d.text((X,y),name,font=font('SemiBold',38),fill=INK); y+=48
        if nm: d.text((X,y),nm,font=font('SemiBold',38),fill=INK); y+=48
        y+=10
        for ln in wrap(d,desc,font('Regular',28),colw):
            d.text((X,y),ln,font=font('Regular',28),fill=GREY); y+=37
    fy=1990-34*(len(foot)-1)
    for fl in foot:
        fw=d.textlength(fl,font=font('Regular',24))
        d.text(((2048-fw)/2,fy),fl,font=font('Regular',24),fill=GREY); fy+=34
    cv.save(out,quality=88)
    print(out,'labels end ~',y)

make('bg-lezo.png','lezo-light-layers.jpg',105,'LEZO LED Mask · how the light reaches your skin','Four wavelengths. Six colors.',
 'Shorter wavelengths stay near the surface; longer ones travel deeper.',
 [(236,'Blue Light','470nm','Surface layer. For blemish-prone skin.'),
  (384,'Green Light','520nm','Upper layers. For a more even-looking tone.'),
  (532,'Yellow Light','590nm','Calms the look of redness and dullness.'),
  (686,'Red Light','630nm','Travels deepest. For firmer-looking skin.')],
 ['Purple = red + blue · Cyan = blue + green · Wavelengths as listed by the maker.','Illustration, not to scale. Cosmetic use; results vary.'],262)
make('bg-booster.png','booster-light-layers.jpg',150,'Booster Pro Wand · light where you look closest','Five lights in your hand.',
 'For the small areas a mask passes over: under the eyes, the smile lines and the jaw.',
 [(174,'Blue Light','','Surface. For clearer-looking skin.'),
  (337,'Purple Light','','A combined setting. Pick it in the menu.'),
  (493,'Green Light','','For a more even-looking tone.'),
  (645,'Yellow Light','','For calmer, brighter-looking skin.'),
  (818,'Red Light','','Reaches deepest. For firmer-looking skin.')],
 ['Colors as shown on the device. Illustration, not to scale. Cosmetic use; results vary.'],280)

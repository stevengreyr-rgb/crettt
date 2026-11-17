import sys,numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
im=Image.open(sys.argv[1]).convert('RGB');a=np.asarray(im).astype(float)
bg=np.median(np.concatenate([a[:8].reshape(-1,3),a[-8:].reshape(-1,3),a[:,:8].reshape(-1,3),a[:,-8:].reshape(-1,3)]),axis=0)
d=np.sqrt(((a-bg)**2).sum(-1))
cand=d<28
lab,n=ndimage.label(cand)
border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bgm=np.isin(lab,list(border))
alpha=np.where(bgm,0,255).astype(np.uint8)
# soft edge: use distance-based ramp near boundary
soft=np.clip((d-10)/30,0,1)*255
edge=ndimage.binary_dilation(bgm,iterations=2)&~bgm
alpha=np.where(edge|(bgm&(d>10)),np.maximum(alpha,soft).astype(np.uint8)*(~bgm|(d>10)),alpha)
alpha[bgm & (d<=10)]=0
A=Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
out=im.convert('RGBA');out.putalpha(A);out.save(sys.argv[2]);print(bg,n)

# 3D finish for product cutouts: shape is never changed (alpha only resized)
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageChops
def finish(rgb_up, alpha_small):
    """rgb_up: upscaled RGB of the padded input; alpha_small: alpha of the padded input"""
    W,H=rgb_up.size
    a=alpha_small.resize((W,H),Image.LANCZOS).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.8))
    im=rgb_up.convert('RGB')
    # clarity: local contrast at large radius -> volume
    im=im.filter(ImageFilter.UnsharpMask(radius=max(W,H)/90,percent=55,threshold=0))
    # micro texture
    im=im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=90,threshold=2))
    im=ImageEnhance.Color(im).enhance(1.10)
    # soft directional light: brighter top-left, deeper bottom-right (inside the shape only)
    yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
    g=((xx/W)*0.45+(yy/H)*0.55)          # 0 top-left -> 1 bottom-right
    shade=1.08-0.18*g
    # rim depth: darken slightly near edges using distance from alpha interior
    inner=np.asarray(a.filter(ImageFilter.GaussianBlur(max(W,H)/120)),np.float32)/255
    edge=np.clip(inner,0,1)**0.6
    m=(shade*(0.90+0.10*edge))[...,None]
    arr=np.clip(np.asarray(im,np.float32)*m,0,255).astype(np.uint8)
    out=Image.fromarray(arr).convert('RGBA');out.putalpha(a)
    return out.crop(a.getbbox())

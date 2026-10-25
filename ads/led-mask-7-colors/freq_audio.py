"""Calm 'frequency' bed: A=432 tuning drone, 6 Hz binaural (theta) offset, faint 528 Hz shimmer.
usage: python3 freq_audio.py <seconds> <out.wav>"""
import sys, wave, numpy as np
DUR=float(sys.argv[1]); OUT=sys.argv[2]
SR=48000; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(3)
breath=0.75+0.25*np.sin(2*np.pi*t/10.0-np.pi/2)           # slow 10 s breathing swell
L=np.zeros(N); R=np.zeros(N)
for f,a in [(108,.50),(216,.40),(324,.16),(432,.10)]:      # 432-tuned drone (A=432 harmonic series)
    ph=rng.uniform(0,2*np.pi)
    L+=a*np.sin(2*np.pi*f*t+ph); R+=a*np.sin(2*np.pi*(f+0.15)*t+ph)
L+=0.30*np.sin(2*np.pi*216*t); R+=0.30*np.sin(2*np.pi*222*t)   # 6 Hz binaural beat (theta)
sh=0.05*np.sin(2*np.pi*528*t)*(0.5+0.5*np.sin(2*np.pi*t/7.0))   # faint 528 Hz shimmer
L+=sh; R+=sh
air=np.convolve(rng.normal(0,1,N),np.ones(200)/200,'same')*0.6  # soft room air
L=(L+air)*breath; R=(R+np.roll(air,700))*breath
env=np.clip(t/1.5,0,1)*np.clip((DUR-t)/1.5,0,1)
st=np.stack([L*env,R*env],1); st/=np.abs(st).max(); st*=0.6
with wave.open(OUT,'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())

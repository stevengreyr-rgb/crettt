import wave, numpy as np
from scipy.signal import lfilter, butter
sr=44100
def midi(n): return 440*2**((n-69)/12)
def lpf(x,fc,o=2): b,a=butter(o,fc/(sr/2)); return lfilter(b,a,x)
def hpf(x,fc,o=2): b,a=butter(o,fc/(sr/2),'high'); return lfilter(b,a,x)
def bpf(x,lo,hi): b,a=butter(2,[lo/(sr/2),hi/(sr/2)],'band'); return lfilter(b,a,x)
def T(n): return np.arange(n)/sr
rng=np.random.default_rng(7)
def saw(f,n): return 2*((f*T(n))%1)-1
def reed(f,n,dur,att=.01,rel=.04,trem=5.5,td=.08,bright=2600):
    x=(saw(f,n)+saw(f*1.005,n)+.7*saw(f*.4975,n))/2.7
    x=lpf(x,bright)*(1+td*np.sin(2*np.pi*trem*T(n)))
    e=np.minimum(T(n)/att,1)*np.minimum(np.maximum((dur-T(n))/rel,0),1)
    return x*e
def drum(f0,f1,n,decay,noise=.15):
    t=T(n); x=np.sin(2*np.pi*(f1*t+(f0-f1)*(1-np.exp(-t*40))/40))*np.exp(-t*decay)
    return x+noise*lpf(rng.standard_normal(n),2500)*np.exp(-t*decay*2.2)
def wood(f,n=2200):  # palos / claves
    t=T(n); return (np.sin(2*np.pi*f*t)*np.exp(-t*90)+.4*np.sin(2*np.pi*f*2.7*t)*np.exp(-t*140))
def scrape(n=2500): return hpf(rng.standard_normal(n),5000)*np.exp(-T(n)*60)

ROOTS=[45,41,36,43]  # Am F C G, bass octave
def conga(f,kind,n=None):
    n=n or int(.4*sr); t=T(n)
    if kind=='open': x=np.sin(2*np.pi*(f*t+f*.35*(1-np.exp(-t*60))/60))*np.exp(-t*11)+.3*np.sin(2*np.pi*f*2.1*t)*np.exp(-t*25)
    elif kind=='mute': x=np.sin(2*np.pi*f*t)*np.exp(-t*45)
    else: x=bpf(rng.standard_normal(n),1500,4500)*np.exp(-t*50)*.8+.4*np.sin(2*np.pi*f*1.4*t)*np.exp(-t*30)
    return x
def whoosh(dur,up=True):
    n=int(dur*sr); x=rng.standard_normal(n); out=np.zeros(n); seg=40
    for i in range(0,n,n//seg):
        p=i/n; c=300+(6500-300)*(p**2 if up else (1-p)**2)
        out[i:i+n//seg]=bpf(x,c*.7,min(c*1.4,20000))[i:i+n//seg]
    e=np.sin(np.pi*np.linspace(0,1,n))**(1.5 if up else 1.5)
    return out*e*1.6
def impact(n=None):
    n=n or int(1.2*sr); t=T(n)
    return np.sin(2*np.pi*(38*t+90*(1-np.exp(-t*25))/25))*np.exp(-t*3.2)+.25*lpf(rng.standard_normal(n),1800)*np.exp(-t*9)
def sub(f,n,dur):
    t=T(n); x=np.sin(2*np.pi*f*t)+.25*np.sin(4*np.pi*f*t)
    return np.tanh(1.6*x)*np.minimum(t/.01,1)*np.minimum(np.maximum((dur-t)/.05,0),1)
def make(bpm,dur,style,cuts,out,risers=()):
    N=int(dur*sr); L=np.zeros(N); R=np.zeros(N); beat=60/bpm; e8=beat/2
    def add(x,t,g,pan=0):
        i=int(t*sr)
        if i>=N or i<0: return
        x=x[:N-i]; L[i:i+len(x)]+=x*g*(1-max(pan,0)); R[i:i+len(x)]+=x*g*(1+min(pan,0))
    duck=np.ones(N)
    for bar in range(int(dur/(4*beat))+2):
        r=ROOTS[bar%4]; t0=bar*4*beat
        for b in range(4):
            t=t0+b*beat
            if style in('tech','drive'):
                add(sub(midi(r),int(beat*sr),beat*.9),t+e8*0,.75)
                i=int(t*sr); d=int(.18*sr)
                if i<N: duck[i:i+d]*=np.linspace(.35,1,min(d,N-i))
            else:
                if b in(0,2): add(sub(midi(r),int(2*beat*sr),beat*1.8),t,.8)
        # conga tumbao
        pat=[('mute',0),('open',.5),('slap',1),('open',1.5),('mute',2),('open',2.5),('slap',3),('open',3.5)] if style!='chill' else [('mute',0),('open',1.5),('slap',2),('open',3),('mute',3.5)]
        for kind,o in pat:
            f=330 if kind!='slap' else 420
            add(conga(f,kind),t0+o*beat,.55 if kind=='open' else .4,pan=.35)
        if style!='chill':
            for k in (0.25,1.25,2.25,3.25): add(conga(500,'mute'),t0+k*beat,.18,pan=-.35)
        if style=='drive':
            for k in range(8): add(conga(480,'slap'),t0+k*e8+e8*.5,.18,pan=-.4)
    L*=duck; R*=duck
    # effects: whoosh into each cut, impact on cut, risers
    for c in cuts:
        if c>0.4: add(whoosh(.45),c-.4,.5,pan=-.3); add(whoosh(.3,False),c,.25,pan=.3)
        add(impact(),c,.75)
    for a,b in risers: add(whoosh(b-a),a,.45)
    m=np.stack([L,R],1)
    m*=np.minimum(T(N)/.02,1)[:,None]; m*=np.minimum((N-np.arange(N))/sr/.7,1)[:,None]
    m=np.tanh(m*1.1); m/=np.abs(m).max()/0.6
    with wave.open(out,'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((m*32767).astype(np.int16).tobytes())
c10=[0,2,4,6,8]
make(120,10,'tech',c10,'mA.wav',risers=[(4.8,6.0)])
make(90,10,'chill',c10,'mB.wav',risers=[(4.6,6.0)])
make(150,10,'drive',c10,'mC.wav',risers=[(4.2,6.0),(7.0,8.0)])
make(120,26.3,'tech',[0,3.1,6.06,8.1,11.56,13.46,15.3,15.79,20.79],'mL.wav',risers=[(14.3,15.79),(19.3,20.79)])

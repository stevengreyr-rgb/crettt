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

ROOTS=[45,45,43,40]  # A A G E (low)
def tom(f,n=None,dec=9): n=n or int(.5*sr); return drum(f*1.5,f,n,dec,.08)
def bellows(f,n,dur,swell,sec=True):
    x=reed(f,n,dur,att=.03,rel=.15,trem=4.5,td=.12,bright=900)
    x+=reed(f*1.5,n,dur,att=.03,rel=.15,trem=4.5,td=.12,bright=700)*.5 if sec else 0
    sw=np.sin(np.pi*np.clip(T(n)/dur,0,1))**swell
    return x*(.35+.65*sw)
def make(bpm,dur,style,out):
    N=int(dur*sr); L=np.zeros(N); R=np.zeros(N); beat=60/bpm; e8=beat/2; e16=beat/4
    def add(x,t,g,pan=0):
        i=int(t*sr)
        if i>=N or i<0: return
        x=x[:N-i]; L[i:i+len(x)]+=x*g*(1-max(pan,0)); R[i:i+len(x)]+=x*g*(1+min(pan,0))
    for bar in range(int(dur/(4*beat))+2):
        r=ROOTS[bar%4]; t0=bar*4*beat; f=midi(r)
        if style=='ritual':
            add(bellows(f,int(4*beat*sr),4*beat*.95,1.2),t0,.7)
            add(tom(95,dec=6),t0,.9); add(tom(95,dec=6),t0+2*beat,.7)
            add(tom(140,dec=8),t0+3.5*beat,.6,pan=.3)
            for k in (1,3): add(wood(1300,3000),t0+k*beat,.5,pan=.5)
            add(wood(1800),t0+3.75*beat,.3,pan=.5)
        elif style=='tribal':
            for b in range(4):
                t=t0+b*beat
                add(bellows(f if b%2==0 else midi(r+7),int(beat*sr),beat*.9,.8,False),t,.6)
                add(tom(90,dec=10),t,.9 if b%2==0 else .6)
                add(tom(150,dec=12),t+e8,.55,pan=-.3)
                if b in(1,3): add(tom(210,dec=14),t+e16*3,.45,pan=.3)
                add(wood(1500),t+e8,.5,pan=.5); add(wood(2200),t+e16,.25,pan=.5) if b%2 else None
        else: # stomp
            for b in range(4):
                t=t0+b*beat
                add(bellows(f,int(beat*sr),beat*.5,.6,False),t,.65)
                add(tom(80,dec=11),t,1.0 if b%2==0 else .7)
                for s in range(4):
                    add(wood(1600+200*(s%2),2200),t+s*e16,.4 if s%2==0 else .22,pan=.5)
                if b in(1,3): add(tom(170,dec=14),t+e8,.6,pan=-.3)
    m=np.stack([L,R],1)
    m*=np.minimum(T(N)/.03,1)[:,None]; m*=np.minimum((N-np.arange(N))/sr/.6,1)[:,None]
    m=np.tanh(m*1.2); m/=np.abs(m).max()/0.89
    with wave.open(out,'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((m*32767).astype(np.int16).tobytes())
make(120,10,'tribal','mA.wav'); make(90,10,'ritual','mB.wav'); make(150,10,'stomp','mC.wav'); make(120,26.3,'tribal','mL.wav')

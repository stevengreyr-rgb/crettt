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

CH=[(48,[64,67,72]),(45,[64,67,73]),(50,[62,66,72]),(43,[62,65,71])]  # C  A7  D7  G7 (bass root, trumpet stab voicing)
WALK=[[0,4,7,9],[0,4,7,6],[0,3,7,9],[0,4,7,5]]  # walking intervals per chord
def trumpet(f,n,dur,vib=True):
    t=T(n); fv=f*(1+(0.004*np.sin(2*np.pi*5.5*t)*np.minimum(t/.25,1) if vib else 0))
    ph=np.cumsum(fv)/sr; x=2*(ph%1)-1
    dark=lpf(x,900); bright=lpf(x,4200); w=.35+.65*np.exp(-t/.07)
    y=dark*(1-w)+bright*w
    y+=.5*bpf(x,1100,1900)
    e=np.minimum(t/.012,1)*np.minimum(np.maximum((dur-t)/.04,0),1)
    return y*e
def stomp(n=None):
    n=n or int(.18*sr); t=T(n); return np.sin(2*np.pi*95*t)*np.exp(-t*30)+.5*lpf(rng.standard_normal(n),900)*np.exp(-t*45)
def clap(n=None):
    n=n or int(.2*sr); t=T(n); return bpf(rng.standard_normal(n),1000,3500)*(np.exp(-t*35)+.5*np.exp(-((t-.012)*60)**2))
def ride(n=None):
    n=n or int(.35*sr); t=T(n); return hpf(rng.standard_normal(n),6500)*np.exp(-t*22)*.5+.15*np.sin(2*np.pi*3400*t)*np.exp(-t*18)
def pluck(f,n,dur):
    t=T(n); x=np.sin(2*np.pi*f*t)+.4*np.sin(4*np.pi*f*t)*np.exp(-t*8)
    return np.tanh(1.4*x)*np.exp(-t*(3.5))*np.minimum(np.maximum((dur-t)/.03,0),1)
def make(bpm,dur,style,cuts,out):
    N=int(dur*sr); L=np.zeros(N); R=np.zeros(N); beat=60/bpm
    sw=(2/3)*beat if style!='straight' else beat/2   # swung offbeat
    def add(x,t,g,pan=0):
        i=int(t*sr)
        if i>=N or i<0: return
        x=x[:N-i]; L[i:i+len(x)]+=x*g*(1-max(pan,0)); R[i:i+len(x)]+=x*g*(1+min(pan,0))
    kick_n=int(.4*sr); tk=T(kick_n)
    kick=(np.sin(2*np.pi*(52*tk+60*(1-np.exp(-tk*28))/28))*np.exp(-tk*7.5))+.25*lpf(rng.standard_normal(kick_n),3000)*np.exp(-tk*120)
    for bar in range(int(dur/(4*beat))+2):
        root,st=CH[bar%4]; t0=bar*4*beat
        for b in range(4):
            t=t0+b*beat
            add(kick,t,1.0 if b%2==0 else .85)                  # bombo en cada tiempo
            if b%2==1: add(stomp(),t,.85,pan=-.2); add(clap(),t,.6,pan=.3)   # pisadas + palmas en 2 y 4
            add(ride(),t,.3,pan=.4); add(ride(),t+sw,.2,pan=.4)  # ride swing
            # walking bass
            nb=root+WALK[bar%4][b]-0
            add(pluck(midi(nb),int(beat*sr),beat*.9),t,.7)
            # trumpets: stabs following the beat
            if b in(0,2):
                for n in st: add(trumpet(midi(n),int(beat*.5*sr),beat*.32),t,.17,pan=-.15)
            else:
                add(trumpet(midi(st[2]+(0 if b==1 else 2)),int(beat*sr),beat*.28),t+sw,.2,pan=.15)
                add(trumpet(midi(st[1]),int(beat*sr),beat*.3),t+sw-0.0,.0)
        # riff on last beat of each 2nd bar (call & response)
        if bar%2==1:
            for k,n in enumerate([st[0]+0,st[1],st[2],st[2]+4]):
                add(trumpet(midi(n+0),int(beat*.5*sr),beat*.22),t0+3*beat+k*beat/4,.22,pan=.1)
    for c in cuts:
        add(kick,c,.5)
    m=np.stack([L,R],1)
    m*=np.minimum(T(N)/.02,1)[:,None]; m*=np.minimum((N-np.arange(N))/sr/.5,1)[:,None]
    m=np.tanh(m*1.15); m/=np.abs(m).max()/0.85
    with wave.open(out,'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((m*32767).astype(np.int16).tobytes())
c10=[0,2,4,6,8]
make(120,10,'swing',c10,'mA.wav'); make(90,10,'swing',c10,'mB.wav'); make(150,10,'swing',c10,'mC.wav')
make(120,26.3,'swing',[0,3.1,6.06,8.1,11.56,13.46,15.3,15.79,20.79],'mL.wav')

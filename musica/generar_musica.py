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
CH=[(45,[57,60,64]),(50,[57,62,65]),(40,[56,59,64]),(45,[57,60,64])]  # Am Dm E Am
def make(bpm,dur,style,out):
    N=int(dur*sr); L=np.zeros(N); R=np.zeros(N); beat=60/bpm; e8=beat/2; e16=beat/4
    def add(x,t,g,pan=0):
        i=int(t*sr)
        if i>=N or i<0: return
        x=x[:N-i]; L[i:i+len(x)]+=x*g*(1-max(pan,0)); R[i:i+len(x)]+=x*g*(1+min(pan,0))
    nbar=int(dur/(4*beat))+2
    for bar in range(nbar):
        root,ch=CH[bar%4]; t0=bar*4*beat; fifth=root+7
        for b in range(4):
            t=t0+b*beat
            # accordion bass: root/fifth alternating + chord stabs
            bnote=root if b%2==0 else fifth
            if style=='cumbia':
                if b in(0,2): add(reed(midi(bnote),int(beat*sr),beat*.85,bright=700),t,.55)
                if b in(1,3):
                    for n in ch: add(reed(midi(n),int(.5*beat*sr),.3*beat,bright=2200),t+e8*.0,.13,pan=.3)
            elif style=='merengue':
                add(reed(midi(bnote),int(beat*sr),beat*.6,bright=800),t,.55)
                for n in ch: add(reed(midi(n),int(e8*sr),e8*.7,bright=2400),t+e8,.12,pan=-.3)
            else: # polka oom-pah
                if b%2==0: add(reed(midi(bnote),int(beat*sr),beat*.55,bright=800),t,.6)
                else:
                    for n in ch: add(reed(midi(n),int(beat*sr),beat*.5,bright=2500),t,.15,pan=.3)
            # percussion
            if style=='merengue':
                add(drum(150,85,int(.3*sr),14),t,.7)            # tambora parche
                for k in (0,1):
                    pat={(0,1):1,(1,1):1,(2,1):1,(3,1):1}
                add(wood(1700),t+e8,.5,pan=.4)                 # palos en el aro
                if b in(1,3): add(wood(2300),t+e16*3+e16*0,.35,pan=.4)
                for s in range(4): add(scrape(),t+s*e16,.22 if s%2==0 else .12,pan=-.5)
            elif style=='cumbia':
                if b in(1,3): add(drum(330,230,int(.12*sr),30,.3),t,.55,pan=-.2)    # llamador
                if b in(0,2): add(drum(190,120,int(.25*sr),16),t,.6)               # tambor alegre
                if b==3: add(drum(200,130,int(.2*sr),18),t+e8,.4)
                add(wood(1500),t+(e8 if b%2==0 else 0),.45,pan=.5)                 # claves/palos
                if b in(0,2): add(wood(1900),t+e16*3,.3,pan=.5)
                for s in range(2): add(scrape(),t+s*e8,.28 if s==0 else .16,pan=-.5)
            else:
                add(drum(120,55,int(.3*sr),11),t,.8 if b%2==0 else .5)             # bombo
                if b%2==1: add(wood(2000),t,.45,pan=.4)
                add(wood(1400),t+e8,.35,pan=.4)
                add(scrape(),t+e8,.2,pan=-.5); add(scrape(),t,.14,pan=-.5)
    # accordion melody riff
    scale=[57,60,62,64,65,68,69,72]
    mel=[0,2,3,2,4,3,2,0, 2,3,5,4,3,2,0,2]
    for s in range(int(dur/e8)+1):
        t=s*e8; bar=int(t/(4*beat))
        n=scale[mel[s%16]]+(12 if style=='polka' else 0)-(0 if style!='cumbia' else 0)
        if style=='cumbia' and s%2: continue
        add(reed(midi(n),int(e8*1.6*sr),e8*1.3,att=.012,rel=.06,bright=3000),t,.2,pan=.15)
    m=np.stack([L,R],1)
    m*=np.minimum(T(N)/.03,1)[:,None]; m*=np.minimum((N-np.arange(N))/sr/.6,1)[:,None]
    m=np.tanh(m*1.2); m/=np.abs(m).max()/0.89
    with wave.open(out,'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((m*32767).astype(np.int16).tobytes())
make(120,10,'merengue','mA.wav'); make(90,10,'cumbia','mB.wav'); make(150,10,'polka','mC.wav'); make(120,26.3,'merengue','mL.wav')

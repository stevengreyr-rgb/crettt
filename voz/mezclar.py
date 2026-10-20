import subprocess, shutil
D='/home/user/crettt'; F='/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def fx(idx,limit):
    f=f'y/t{idx}.wav'; sp=max(1.0,dur(f)/limit); out=f'y/fx{idx}_{int(limit*10)}.wav'
    fc=f'[0:a]atempo={sp:.3f},loudnorm=I=-17:TP=-2,aresample=44100,pan=stereo|c0=c0|c1=c0,apad=pad_dur=0.3,alimiter=limit=0.95[o]'
    subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-filter_complex',fc,'-map','[o]','-ar','44100',out],check=True); return out
def mix(video,lines,total,fade_at,fade_d,out,captions=None):
    ins=['-i',video]; fc=[]; labs=[]
    for k,(idx,start,limit) in enumerate(lines):
        ins+=['-i',fx(idx,limit)]; fc.append(f'[{k+1}:a]adelay={int(start*1000)}|{int(start*1000)}[v{k}]'); labs.append(f'[v{k}]')
    n=len(lines)+1
    ins+=['-f','lavfi','-i',f'anoisesrc=d={total}:c=pink:r=44100:a=0.5']
    fc.append(f'[{n}:a]highpass=f=150,lowpass=f=3200,tremolo=f=0.35:d=0.4,volume=0.4,afade=t=out:st={fade_at}:d={fade_d},pan=stereo|c0=c0|c1=c0[nz]')
    labs.append('[nz]')
    fc.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0:duration=longest,alimiter=limit=0.95[a]')
    vf=[]
    cmd=['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fc)]
    if captions:
        dts=[]
        for i,t in enumerate(captions):
            idx,s,limit=lines[i]; d=dur(f'y/t{idx}.wav'); e=s+d/max(1.0,d/limit)+0.25
            a=f"if(lt(t,{s+.15}),(t-{s})/.15,if(gt(t,{e-.15}),({e}-t)/.15,1))"
            dts.append(f"drawtext=fontfile={F}:text='{t}':fontsize={36 if len(t)<=30 else 30}:fontcolor=white:alpha='{a}':box=1:boxcolor=black@0.5:boxborderw=18:x=(w-text_w)/2:y=h*0.84:enable='between(t,{s},{e})'")
        cmd=['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fc)+f';[0:v]{",".join(dts)}[vv]']; vm=['-map','[vv]','-c:v','libx264','-crf','18','-pix_fmt','yuv420p']
    else: vm=['-map','0:v','-c:v','copy']
    subprocess.run([*cmd,*vm,'-map','[a]','-c:a','aac','-b:a','192k','-t',str(total),out],check=True)
def sched(ids,start,gap,end_pin,coll=5):
    body=ids[:-1]; ds=[dur(f'y/t{i}.wav') for i in body]
    avail=end_pin-start-gap*(len(body))
    sp=max(1.0,sum(ds)/avail); t=start; out=[]
    for i,d in zip(body,ds):
        out.append((i,round(t,2),d/sp)); t+=d/sp+gap
    out.append((ids[-1],end_pin,dur(f'y/t{ids[-1]}.wav')))
    return out
SC={'A':[81,82,83,84,23],'B':[81,86,87,88,23],'C':[89,90,91,92,23]}
CAP={'A':["If only you knew","what you could discover","if you lowered your outside noise","and merged with the silence","Discover it."],
     'B':["If only you knew","what lies on the other side of the noise","Merge with the silence","that these earbuds offer you.","Discover it."],
     'C':["Turn down the noise around you,","and merge with the silence.","Discover who you already are.","These earbuds offer you the way in.","Discover it."]}
for v,ids in SC.items():
    L=sched(ids,0.15,0.2,8.3)
    print(v,[(i,st) for i,st,_ in L])
    fade=max(L[2][1]-0.2,1.0)
    mix(f'src_{v}.mp4',L,10,fade,2.2,f'q_{v}.mp4')
    mix(f'src_{v}.mp4',L,10,fade,2.2,f'q_{v}_t.mp4',captions=CAP[v])
LL=sched([81,82,93,84,88,91,23],0.5,1.1,21.0)
print('L',[(i,st) for i,st,_ in LL])
mix('src_L.mp4',LL,26.29,LL[3][1]-0.5,3.0,'q_L.mp4')
for f in ['A','B','C','A_t','B_t','C_t','L']: print(f,dur(f'q_{f}.mp4'))

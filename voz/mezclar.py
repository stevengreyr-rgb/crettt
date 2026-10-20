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
LN={'A':[(24,0.1,2.4),(25,2.6,1.9),(23,4.3,1.3),(18,6.1,1.9),(5,8.1,1.9)],
    'B':[(26,0.1,1.9),(27,2.1,1.95),(28,4.1,1.4),(29,6.1,1.4),(5,8.1,1.9)],
    'C':[(30,0.1,2.7),(31,2.9,1.9),(25,5.0,1.8),(23,7.0,1.1),(5,8.3,1.5)]}
CAP={'A':["Between two thoughts, there\u2019s silence.","That silence is you.","Discover it.","Shaped to your ear.","The Silence Collection."],
     'B':["Have you heard it?","The silence between thoughts.","That\u2019s you.","Step inside.","The Silence Collection."],
     'C':["One thought. Then... another.","Between them, silence.","That silence is you.","Discover it.","The Silence Collection."]}
for v,L in LN.items():
    mix(f'src_{v}.mp4',L,10,3.6,2.2,f'q_{v}.mp4')
    mix(f'src_{v}.mp4',L,10,3.6,2.2,f'q_{v}_t.mp4',captions=CAP[v])
mix('src_L.mp4',[(21,0.3,4.5),(22,5.0,2.4),(23,7.6,1.4),(16,9.4,2.6),(18,12.6,2.0),(13,16.0,1.5),(5,21.0,2.6)],26.29,7.5,3.0,'q_L.mp4')
for f in ['A','B','C','A_t','B_t','C_t','L']: print(f,dur(f'q_{f}.mp4'))

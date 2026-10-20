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
            s=i*2+0.1; e=s+1.8
            a=f"if(lt(t,{s+.15}),(t-{s})/.15,if(gt(t,{e-.15}),({e}-t)/.15,1))"
            dts.append(f"drawtext=fontfile={F}:text='{t}':fontsize=36:fontcolor=white:alpha='{a}':box=1:boxcolor=black@0.5:boxborderw=18:x=(w-text_w)/2:y=h*0.84:enable='between(t,{s},{e})'")
        cmd=['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fc)+f';[0:v]{",".join(dts)}[vv]']; vm=['-map','[vv]','-c:v','libx264','-crf','18','-pix_fmt','yuv420p']
    else: vm=['-map','0:v','-c:v','copy']
    subprocess.run([*cmd,*vm,'-map','[a]','-c:a','aac','-b:a','192k','-t',str(total),out],check=True)
ST=[0.1,2.1,4.1,6.1,8.1]
S={'A':[1,2,3,4,5],'B':[6,7,8,9,5],'C':[10,3,12,13,5]}
CAP={'A':["Between every sound, a gap.","Step inside it.","What waits behind the silence?","Your own thoughts.","The Silence Collection."],
     'B':["There\u2019s a gap in the noise.","Most never find it.","Behind it, stillness.","Wide. Deep. Yours.","The Silence Collection."],
     'C':["Listen to the gap.","What waits behind the silence?","Everything you\u2019ve been missing.","Step through.","The Silence Collection."]}
for v,ids in S.items():
    L=[(i,s,1.9) for i,s in zip(ids,ST)]
    mix(f'src_{v}.mp4',L,10,3.6,2.2,f'q_{v}.mp4')
    mix(f'src_{v}.mp4',L,10,3.6,2.2,f'q_{v}_t.mp4',captions=CAP[v])
mix('src_L.mp4',[(1,0.3,2.6),(15,3.4,2.5),(16,6.2,2.6),(17,9.0,2.6),(13,12.0,1.5),(18,16.0,2.0),(5,21.0,2.6)],26.29,7.5,3.0,'q_L.mp4')
for f in ['A','B','C','A_t','B_t','C_t','L']: print(f,dur(f'q_{f}.mp4'))

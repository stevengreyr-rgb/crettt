import subprocess
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def mix(video,lines,out,total):
    ins=['-i',video]; fc=[]; labs=[]
    for k,(idx,start,limit) in enumerate(lines):
        f=f'h/c{idx}.wav'; sp=max(1.0,dur(f)/limit); ins+=['-i',f]
        fc.append(f'[{k+1}:a]atempo={sp:.3f},loudnorm=I=-16:TP=-2,adelay={int(start*1000)}|{int(start*1000)}[v{k}]'); labs.append(f'[v{k}]')
    fc.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0:duration=longest,apad,alimiter=limit=0.95[a]')
    subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fc),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(total),out],check=True)
ST=[0.1,2.1,4.1,6.1,8.1]
S={'A':[1,2,3,4,5],'B':[6,7,8,9,10],'C':[11,12,13,14,15]}
for v,ids in S.items():
    mix(f'src_{v}.mp4',[(i,s,1.9) for i,s in zip(ids,ST)],f'p_{v}.mp4',10)
mix('src_L.mp4',[(16,0.3,2.5),(17,3.3,2.7),(8,6.1,2.0),(18,8.4,3.0),(19,11.6,2.3),(20,15.95,3.1),(5,20.95,2.4)],'p_L.mp4',26.29)
for v in 'ABCL': print(v,dur(f'p_{v}.mp4'))

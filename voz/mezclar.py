import subprocess, shutil
D='/home/user/crettt'
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def mix(video,music,lines,out,total,limit):
    ins=['-i',video,'-i',music]; fc=[]; labs=['[m]']
    for k,(idx,start) in enumerate(lines):
        f=f'g/t{idx}.wav'; d=dur(f); sp=max(1.0,d/limit)
        ins+=['-i',f]
        fc.append(f'[{k+2}:a]atempo={sp:.3f},loudnorm=I=-17:TP=-2,volume=1.0,adelay={int(start*1000)}|{int(start*1000)}[v{k}]')
        labs.append(f'[v{k}]')
    fc.insert(0,'[1:a]volume=0.38[m]')
    fc.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0:duration=first,alimiter=limit=0.95[a]')
    subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fc),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(total),out],check=True)
ST=[0.1,2.1,4.1,6.1,8.1]
S={'A':[0,1,2,3,4],'B':[5,6,7,3,4],'C':[8,9,10,3,4]}
for v,ids in S.items():
    src=f'{D}/airpods_10s_{v}.mp4'; shutil.copy(src,f'src_{v}.mp4')
    mix(f'src_{v}.mp4',f'm{v}.wav',list(zip(ids,ST)),f'o_{v}.mp4',10,1.9)
shutil.copy(f'{D}/airpods_editado.mp4','src_L.mp4')
mix('src_L.mp4','mL.wav',[(0,0.3),(11,3.3),(2,8.3),(7,11.8),(3,15.95),(4,20.95)],'o_L.mp4',26.29,3.0)
for v in 'ABCL': print(v,dur(f'o_{v}.mp4'))

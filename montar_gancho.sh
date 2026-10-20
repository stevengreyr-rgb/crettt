#!/bin/bash
# Uso: ./montar_gancho.sh clip_generado.mp4 salida.mp4
# Clip de 10 s en un solo plano: choque -> earbuds al piso -> plano bajo enfocado.
# Agrega pitido (tinnitus) en la camara lenta y titulos + CTA sobre el plano final.
IN="${1:?clip}"; OUT="${2:-airpods_gancho_final.mp4}"
F=/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf
T(){ # texto inicio fin tamano y
  echo "drawtext=fontfile=$F:text='$1':fontcolor=white:fontsize=$4:x=(w-text_w)/2:y=$5:shadowcolor=black@0.55:shadowx=0:shadowy=3:alpha='if(lt(t,$2),0,if(lt(t,$2+0.4),(t-$2)/0.4,if(lt(t,$3-0.3),1,max(0,($3-t)/0.3))))'"
}
ffmpeg -v error -y -i "$IN" -i voz/hook_pitido.wav -filter_complex \
"[0:v]scale=720:1280,fps=24,setsar=1,$(T 'Silence. Finally.' 5.0 7.2 54 'h*0.16'),$(T 'Sevencrush Everyday Earbuds' 7.0 10 38 'h*0.16'),$(T 'Shop now ↓' 8.2 10 46 'h*0.78')[v];\
[1:a]apad=whole_dur=10,afade=t=out:st=9.5:d=0.5[a]" \
-map "[v]" -map "[a]" -t 10 -c:v libx264 -pix_fmt yuv420p -c:a aac "$OUT"

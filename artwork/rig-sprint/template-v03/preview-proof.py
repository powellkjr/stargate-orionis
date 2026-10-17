"""Offline pose review of the prepared rig; never touches live registries."""
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
RUNTIME=ROOT/'demos/shared/sprites/offworld/rigs/technician-v01-preferred-proof-v03'
OUT=ROOT/'artwork/rig-sprint/preferred-master-v01'


def main():
    rig=json.loads((RUNTIME/'rig.json').read_text())
    layers={part:Image.open(RUNTIME/Path(entry['src']).name).convert('RGBA') for part,entry in rig['parts'].items()}
    order=sorted(layers,key=lambda part:rig['parts'][part]['z'])
    poses=json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {rigPose} from './demos/shared/sprites/character-rig.mjs';"
        "console.log(JSON.stringify(Array.from({length:16},(_,i)=>rigPose('WALK',i*37.5))));"
    ],cwd=ROOT,text=True))

    def render(pose):
        output=Image.new('RGBA',(128,128))
        for part in order:
            image=layers[part]
            angle=pose.get(part,0)
            if angle:
                image=image.rotate(-angle,resample=Image.Resampling.BICUBIC,center=tuple(rig['parts'][part]['pivot']))
            if part=='torso' or rig['parts'][part]['parent']=='torso':
                bob=pose.get('torsoY',0)
                if bob:
                    image=image.transform((128,128),Image.Transform.AFFINE,(1,0,0,0,1,-bob),resample=Image.Resampling.BICUBIC)
            output.alpha_composite(image)
        if pose.get('rootAngle'):
            output=output.rotate(-pose['rootAngle'],resample=Image.Resampling.BICUBIC)
        return output

    examples=[('IDLE',{}),('arms +12 / legs +15',{'left_arm':12,'right_arm':12,'left_leg':15,'right_leg':15}),
              ('arms -12 / legs -15',{'left_arm':-12,'right_arm':-12,'left_leg':-15,'right_leg':-15}),
              ('arms out / legs out',{'left_arm':-12,'right_arm':12,'left_leg':-15,'right_leg':15}),
              ('arms in / legs in',{'left_arm':12,'right_arm':-12,'left_leg':15,'right_leg':-15}),
              ('WALK 0ms',poses[0]),('WALK 300ms',poses[8]),('DOWN',{'rootAngle':90})]
    sheet=Image.new('RGB',(1024,576),'#e4e7ea')
    draw=ImageDraw.Draw(sheet)
    for index,(label,pose) in enumerate(examples):
        x,y=(index%4)*256,(index//4)*288
        image=render(pose)
        sheet.paste(image.resize((256,256),Image.Resampling.NEAREST),(x,y),image.resize((256,256),Image.Resampling.NEAREST))
        draw.text((x+5,y+259),label,fill='black')
        # Actual 22-pixel analogue, shown unscaled beside each label.
        small=image.resize((22,22),Image.Resampling.LANCZOS)
        sheet.paste(small,(x+229,y+258),small)
    sheet.save(OUT/'pose-extremes.png')
    frames=[]
    for pose in poses:
        image=render(pose).resize((384,384),Image.Resampling.NEAREST)
        frame=Image.new('RGB',(384,408),'#e4e7ea')
        frame.paste(image,(0,0),image)
        ImageDraw.Draw(frame).text((8,389),'WALK | presentation proof only | 600ms cycle',fill='black')
        frames.append(frame)
    frames[0].save(OUT/'walk-proof.gif',save_all=True,append_images=frames[1:],duration=[40,40,40,30]*4,loop=0)
    parts=Image.new('RGB',(1024,576),'#e4e7ea')
    draw=ImageDraw.Draw(parts)
    for index,part in enumerate(order):
        x,y=(index%4)*256,(index//4)*288
        image=layers[part].resize((256,256),Image.Resampling.NEAREST)
        parts.paste(image,(x,y),image)
        draw.text((x+5,y+260),f'{part} | pivot {rig["parts"][part]["pivot"]}',fill='black')
    parts.save(OUT/'seven-layer-review.png')
    print('Wrote source-independent pose, layer and WALK review artifacts; no activation.')


if __name__=='__main__':
    main()

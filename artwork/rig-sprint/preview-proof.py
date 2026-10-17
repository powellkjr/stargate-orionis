"""Offline pose review of the prepared rig; never touches live registries."""
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
RUNTIME=ROOT/'demos/shared/sprites/offworld/rigs/technician-v01-jointed-proof-v04'
OUT=ROOT/'artwork/rig-sprint/jointed-proof-v04'


def main():
    rig=json.loads((RUNTIME/'rig.json').read_text())
    layers={part:Image.open(RUNTIME/Path(entry['src']).name).convert('RGBA') for part,entry in rig['parts'].items()}
    order=sorted(layers,key=lambda part:rig['parts'][part]['z'])
    samples=json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {readFileSync} from 'node:fs';"
        "import {rigPose,rigPartMatrix} from './demos/shared/sprites/character-rig.mjs';"
        "const rig=JSON.parse(readFileSync(process.argv[1]));"
        "const sample=(label,pose)=>({label,pose,matrices:Object.fromEntries(Object.keys(rig.parts).map(k=>[k,rigPartMatrix(rig,pose,k)]))});"
        "const walk=Array.from({length:16},(_,i)=>sample('WALK '+i*37.5+'ms',rigPose('WALK',i*37.5)));"
        "const examples=[sample('IDLE',rigPose('IDLE')),walk[0],walk[4],walk[8],walk[12],"
        "sample('elbows +/-15', {...rigPose('IDLE'),left_forearm:15,right_forearm:-15}),"
        "sample('knees +/-15', {...rigPose('IDLE'),left_lower_leg:15,right_lower_leg:-15}),"
        "sample('DOWN',rigPose('DOWN'))];console.log(JSON.stringify({walk,examples}));",
        str(RUNTIME/'rig.json')
    ],cwd=ROOT,text=True))

    def render(sample):
        output=Image.new('RGBA',(128,128))
        for part in order:
            image=layers[part]
            a,b,c,d,e,f=sample['matrices'][part]
            det=a*d-b*c
            inverse=(d/det,-c/det,(c*f-d*e)/det,-b/det,a/det,(b*e-a*f)/det)
            if inverse!=(1,0,0,0,1,0):
                image=image.transform((128,128),Image.Transform.AFFINE,inverse,resample=Image.Resampling.BICUBIC)
            output.alpha_composite(image)
        pose=sample['pose']
        if pose.get('rootAngle'):
            output=output.rotate(-pose['rootAngle'],resample=Image.Resampling.BICUBIC)
        return output

    sheet=Image.new('RGB',(1024,576),'#e4e7ea')
    draw=ImageDraw.Draw(sheet)
    for index,sample in enumerate(samples['examples']):
        x,y=(index%4)*256,(index//4)*288
        image=render(sample)
        sheet.paste(image.resize((256,256),Image.Resampling.NEAREST),(x,y),image.resize((256,256),Image.Resampling.NEAREST))
        draw.text((x+5,y+259),sample['label'],fill='black')
        # Actual 22-pixel analogue, shown unscaled beside each label.
        small=image.resize((22,22),Image.Resampling.LANCZOS)
        sheet.paste(small,(x+229,y+258),small)
    sheet.save(OUT/'pose-extremes.png')
    frames=[]
    frame_components=[]
    def components(image):
        values=list(image.getchannel('A').getdata())
        remaining={i for i,a in enumerate(values) if a>=128}
        areas=[]
        while remaining:
            start=remaining.pop();stack=[start];area=0
            while stack:
                index=stack.pop();area+=1;x=index%128;y=index//128
                neighbors=[]
                if x:neighbors.append(index-1)
                if x<127:neighbors.append(index+1)
                if y:neighbors.append(index-128)
                if y<127:neighbors.append(index+128)
                for other in neighbors:
                    if other in remaining:
                        remaining.remove(other);stack.append(other)
            areas.append(area)
        return sorted(areas,reverse=True)
    frame_sheet=Image.new('RGB',(1024,1152),'#e4e7ea')
    joint_sheet=Image.new('RGB',(1088,768),'#e4e7ea')
    for index,sample in enumerate(samples['walk']):
        raw=render(sample)
        frame_components.append({'frame':index,'time_ms':index*37.5,'alpha128_component_areas':components(raw)})
        enlarged=raw.resize((256,256),Image.Resampling.NEAREST)
        x,y=(index%4)*256,(index//4)*288
        frame_sheet.paste(enlarged,(x,y),enlarged)
        ImageDraw.Draw(frame_sheet).text((x+5,y+262),sample['label'],fill='black')
        crop=raw.crop((30,36,98,78)).resize((272,168),Image.Resampling.NEAREST)
        x,y=(index%4)*272,(index//4)*192
        joint_sheet.paste(crop,(x,y),crop)
        ImageDraw.Draw(joint_sheet).text((x+5,y+173),sample['label'],fill='black')
        image=raw.resize((384,384),Image.Resampling.NEAREST)
        frame=Image.new('RGB',(384,408),'#e4e7ea')
        frame.paste(image,(0,0),image)
        ImageDraw.Draw(frame).text((8,389),'WALK | presentation proof only | 600ms cycle',fill='black')
        frames.append(frame)
    frame_sheet.save(OUT/'all-walk-frames.png')
    joint_sheet.save(OUT/'attachment-frames.png')
    frames[-1].save(OUT/'walk-last-frame-review.png')
    frames[0].save(OUT/'walk-proof.gif',save_all=True,append_images=frames[1:],duration=[40,40,40,30]*4,loop=0)
    parts=Image.new('RGB',(1024,864),'#e4e7ea')
    draw=ImageDraw.Draw(parts)
    for index,part in enumerate(order):
        x,y=(index%4)*256,(index//4)*288
        image=layers[part].resize((256,256),Image.Resampling.NEAREST)
        parts.paste(image,(x,y),image)
        draw.text((x+5,y+260),f'{part} | pivot {rig["parts"][part]["pivot"]}',fill='black')
    parts.save(OUT/'eleven-layer-review.png')
    (OUT/'frame-checks.json').write_text(json.dumps({'frames':frame_components,
        'matrices_and_poses':samples,'criterion':'No detached alpha>=128 component of 3 or more pixels beside the main character.'},indent=2)+'\n',encoding='utf-8')
    print('Frame component areas:',[frame['alpha128_component_areas'] for frame in frame_components])
    print('Wrote source-independent pose, layer and WALK review artifacts; no activation.')


if __name__=='__main__':
    main()

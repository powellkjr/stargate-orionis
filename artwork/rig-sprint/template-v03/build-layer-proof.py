"""Source-specific mask extraction and deterministic hidden overlap proof.

Copies approved visible pixels, never generates new visible anatomy. Hidden
backing extrapolates nearby source colors only underneath opaque occluders.
This is a review proof, not an automatic installation or generic segmentation.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
MASTER = ROOT / 'artwork/rig-sprint/preferred-master-v01'
OUT = ROOT / 'artwork/rig-sources/technician-v01-preferred-proof-v03'


def polygon(points):
    image = Image.new('L', (1024,1024))
    ImageDraw.Draw(image).polygon(points,fill=255)
    return np.array(image)>0


def ellipse(x,y,rx,ry):
    yy,xx=np.indices((1024,1024))
    return ((xx-x)/rx)**2+((yy-y)/ry)**2<=1


def main():
    contract=json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {rigParts,rigTemplate,rigOrder,rigParents} from './demos/shared/sprites/character-rig.mjs';"
        "console.log(JSON.stringify({parts:rigParts,pivots:rigTemplate,order:rigOrder,parents:rigParents}));"
    ],cwd=ROOT,text=True))
    if OUT.exists():
        raise ValueError('Refusing to replace an existing layer proof; use a new versioned output directory.')
    master=Image.open(MASTER/'char_technician_v01__master__source.png').convert('RGBA')
    p=np.array(master)
    visible=p[:,:,3]>0
    arm_right=polygon([(370,298),(286,331),(240,401),(234,661),(369,661),(379,540),(376,470),(403,430),(386,376)])
    arm_left=polygon([(654,298),(738,331),(784,401),(790,661),(655,661),(645,540),(648,470),(621,430),(638,376)])
    head=polygon([(430,184),(593,184),(619,284),(589,355),(549,402),(473,402),(435,357),(410,285)])
    equipment=polygon([(445,504),(575,504),(578,565),(443,565)])
    yy,xx=np.indices((1024,1024))
    legs=polygon([(376,580),(400,590),(455,598),(512,601),(569,598),(624,590),(648,580),
                  (675,790),(670,920),(350,920),(350,790)])
    owners={part:np.zeros((1024,1024),dtype=bool) for part in contract['parts']}
    owners['head']=head & visible
    owners['equipment']=equipment & visible & ~head
    used=owners['head']|owners['equipment']
    owners['right_arm']=arm_right & visible & ~used
    owners['left_arm']=arm_left & visible & ~used & ~owners['right_arm']
    used |= owners['right_arm']|owners['left_arm']
    owners['right_leg']=legs & (xx<512) & visible & ~used
    owners['left_leg']=legs & (xx>=512) & visible & ~used
    used |= owners['right_leg']|owners['left_leg']
    owners['torso']=visible & ~used
    assert np.array_equal(sum(mask.astype(np.uint8) for mask in owners.values()),visible.astype(np.uint8))
    layers={part:np.where(mask[:,:,None],p,0).astype(np.uint8) for part,mask in owners.items()}
    overlap={}
    opaque=p[:,:,3]==255
    for part in ['right_arm','left_arm','right_leg','left_leg','head']:
        px,py=contract['pivots'][part]
        rx,ry=(90,60) if part.endswith('arm') else (42,42) if part.endswith('leg') else (34,28)
        zone=ellipse(px,py,rx,ry)
        # Backing fills the torso's socket only; it is underneath the limb.
        body_backing=zone & owners[part] & opaque
        if part=='right_arm':
            body_backing &= xx>=368
        elif part=='left_arm':
            body_backing &= xx<=656
        layers['torso'][body_backing]=p[body_backing]
        # Extend proximal part inside existing opaque torso. No extension may
        # become a new neutral silhouette pixel or cover the visible collar.
        hidden=zone & owners['torso'] & opaque
        source_yx=np.argwhere(owners[part] & (p[:,:,3]>=240) & ellipse(px,py,100,100))
        target_yx=np.argwhere(hidden)
        if len(source_yx)==0:
            raise ValueError(f'No proximal source colors for {part}')
        for start in range(0,len(target_yx),128):
            targets=target_yx[start:start+128]
            nearest=((targets[:,None,:].astype(np.int32)-source_yx[None,:,:])**2).sum(axis=2).argmin(axis=1)
            src=source_yx[nearest]
            layers[part][targets[:,0],targets[:,1]]=p[src[:,0],src[:,1]]
        overlap[part]={'hidden_pixels':int(hidden.sum()),'torso_backing_pixels':int(body_backing.sum()),
                       'proximal_zone_radii':[rx,ry],'method':'Nearest original proximal RGBA inside opaque torso; source pixels back socket.'}
    # Case does not rotate independently, but the body owns backing underneath it.
    layers['torso'][owners['equipment'] & opaque]=p[owners['equipment'] & opaque]
    composite=Image.new('RGBA',(1024,1024))
    for part in sorted(contract['parts'],key=lambda part:contract['order'][part]):
        composite.alpha_composite(Image.fromarray(layers[part]))
    difference=np.any(np.array(composite)!=p,axis=2)
    if difference.any():
        raise ValueError(f'Neutral composite differs at {int(difference.sum())} pixels')
    OUT.mkdir(parents=True)
    metadata={'version':1,'id':'technician_v01','sourceCanvas':1024,'parts':{}}
    for part in contract['parts']:
        filename=f'char_technician_v01__{part.replace("_","-")}__source.png'
        Image.fromarray(layers[part]).save(OUT/filename)
        metadata['parts'][part]={'file':filename,'pivot':contract['pivots'][part]}
    (OUT/'rig.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
    composite.save(MASTER/'neutral-source-composite.png')
    report={'neutral_differing_pixels':int(difference.sum()),'visible_pixel_partition':'exactly one original owner',
            'hidden_overlap':overlap,'acceptance':'Proof only; maximum rotation seams and walk require visual review.'}
    (MASTER/'layer-proof-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    # Source pivot/material review diagram; never part of the source pack.
    overlay=Image.new('RGBA',(1024,1024),'#e4e7ea');overlay.alpha_composite(master)
    draw=ImageDraw.Draw(overlay)
    draw.rectangle((64,64,960,960),outline='#bb2160',width=3)
    for part,(x,y) in contract['pivots'].items():
        draw.ellipse((x-10,y-10,x+10,y+10),outline='#ff0055',width=3)
        lx=x+16 if part not in ['right_arm','right_leg'] else x-170
        draw.rectangle((lx-2,y-24,lx+175,y-3),fill='white')
        draw.text((lx,y-22),f'{part} ({x},{y})',fill='#003080')
    overlay.save(MASTER/'anatomical-pivot-overlay.png')
    print(json.dumps(report,indent=2))


if __name__=='__main__':
    main()

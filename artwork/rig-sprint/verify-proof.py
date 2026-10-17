"""Read-only measured checks of the real current proof, not synthetic fixtures."""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'artwork/rig-sources/technician-v01-jointed-proof-v04'
REVIEW=ROOT/'artwork/rig-sprint/jointed-proof-v04'
data=json.loads((SOURCE/'rig.json').read_text())
master=np.array(Image.open(ROOT/'artwork/rig-sprint/preferred-master-v01/char_technician_v01__master__source.png'))
allowed={tuple(v) for v in np.unique(master[master[:,:,3]>0,:3],axis=0)}
checks={}
for key,part in data['parts'].items():
    image=Image.open(SOURCE/part['file'])
    assert image.mode=='RGBA' and image.size==(1024,1024)
    pixels=np.array(image)
    checks[key]=all(tuple(v) in allowed for v in np.unique(pixels[pixels[:,:,3]>0,:3],axis=0))
assert all(checks.values())
assert np.array_equal(np.array(Image.open(REVIEW/'neutral-source-composite.png')),master)
gif=Image.open(REVIEW/'walk-proof.gif')
duration=0
for index in range(gif.n_frames):
    gif.seek(index)
    duration+=gif.info['duration']
assert gif.n_frames==16 and duration==600
frames=json.loads((REVIEW/'frame-checks.json').read_text())['frames']
assert len(frames)==16 and all(len(frame['alpha128_component_areas'])==1 for frame in frames)
assert data['version']==2 and len(data['parts'])==11
print(json.dumps({'source_part_palette':checks,'neutral_source_differing_pixels':0,
                  'gif_frames':gif.n_frames,'gif_cycle_ms':duration,'all_frames_single_connected_silhouette':True},indent=2))

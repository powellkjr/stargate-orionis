"""Prepare the generated pair sheets; shared frame guarantees registered runtime states.

Art was generated with imagegen. This performs sheet extraction and runtime
preparation only. Never runs on downloaded originals or installed art.
"""
from pathlib import Path
from collections import deque
from PIL import Image, ImageChops
import shutil
import json

ROOT = Path(__file__).resolve().parent
GENERATED = Path(r'C:/Users/Powel/.codex/generated_images/01a10f1e-242c-73b0-a43b-288d2c19d6fa')
SHEETS = ['exec-8ec8f5a6-e74d-403c-8189-2cc5ee95479b.png',
          'exec-02a849e6-4f57-4af6-9de6-db186cf4107d.png',
          'exec-99edfe4a-5e38-4e21-867d-917314573cd4.png']

def aperture_mask(im):
    """Largest fully transparent enclosed component: the ring's opening."""
    w, h = im.size
    alpha = list(im.getchannel('A').getdata())
    seen = set()
    best = []
    for seed, a in enumerate(alpha):
        if a or seed in seen:
            continue
        queue = deque([seed]); seen.add(seed); component = []; outside = False
        while queue:
            i = queue.popleft(); component.append(i); x, y = i % w, i // w
            outside |= x == 0 or y == 0 or x == w-1 or y == h-1
            for nx, ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                j = ny*w+nx
                if 0 <= nx < w and 0 <= ny < h and not alpha[j] and j not in seen:
                    seen.add(j); queue.append(j)
        if not outside and len(component) > len(best):
            best = component
    if len(best) < 100:
        raise ValueError('No substantial enclosed Gate aperture found')
    data = bytearray(w*h)
    for i in best: data[i] = 255
    return Image.frombytes('L', (w,h), bytes(data))

report = []
for number, filename in enumerate(SHEETS, 1):
    variant = f'v{number:02}'
    raw = ROOT/'generated-sheets'/f'{variant}.png'
    raw.parent.mkdir(parents=True, exist_ok=True)
    if not raw.exists(): shutil.copy2(GENERATED/filename, raw)
    sheet = Image.open(raw).convert('RGBA'); w,h = sheet.size
    if w != 2*h: raise ValueError('Expected exactly two square cells')
    closed = sheet.crop((0,0,h,h)); active = sheet.crop((h,0,w,h))
    # Reject generated low-alpha speckle; retain opaque source artwork, then
    # Lanczos runtime preparation supplies clean antialiased edges.
    for im in [closed,active]:
        im.putalpha(im.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
    box = closed.getchannel('A').getbbox()
    if not box: raise ValueError('Empty generated Gate')
    scale = 200/max(box[2]-box[0],box[3]-box[1])
    size = (round((box[2]-box[0])*scale),round((box[3]-box[1])*scale))
    prepared = []
    for im in [closed,active]:
        out = Image.new('RGBA',(256,256))
        # The generated sheet may place cell contents at different centers.
        # Register the energy donor to the closed master before locking frame.
        donor_box = im.getchannel('A').getbbox()
        out.paste(im.crop(donor_box).resize(size,Image.Resampling.LANCZOS),((256-size[0])//2,(256-size[1])//2))
        prepared.append(out)
    closed, energy = prepared
    mask = aperture_mask(closed)
    # Locked generated closed frame. Only the enclosed transparent opening
    # receives generated energy; no newly painted stair/ring pixels survive.
    opened = closed.copy()
    opened.paste(energy,(0,0),mask)
    if opened.getchannel('A').getbbox() != closed.getchannel('A').getbbox():
        raise ValueError('Generated energy changes the outer bounds')
    frame = closed.getchannel('A').point(lambda a: 255 if a else 0)
    diff = ImageChops.difference(closed,opened)
    if any(ImageChops.multiply(diff.getchannel(c),frame).getbbox() for c in 'RGBA'):
        raise ValueError('Prepared frame pixels changed')
    # Ensure energy actually fills the opening, not a blank or backdrop image.
    occupied = sum(1 for m,a in zip(mask.getdata(),opened.getchannel('A').getdata()) if m and a >= 128)
    count = sum(1 for m in mask.getdata() if m)
    if occupied/count < 0.9: raise ValueError('Generated portal does not cover aperture')
    folder = ROOT/'validated-candidates'/variant
    folder.mkdir(parents=True,exist_ok=True)
    closed.save(folder/'gate.png'); opened.save(folder/'gate-open.png')
    mask.save(folder/'aperture-mask.png')
    report.append({'variant':variant,'runtimePixels':[256,256],'alphaBounds':closed.getchannel('A').getbbox(),
                   'framePixelsIdentical':True,'aperturePixels':count,'energyCoverage':occupied/count})
(ROOT/'preparation-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

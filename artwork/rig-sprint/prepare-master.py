"""Deterministic, source-specific preparation of the user-selected master.

Material ownership uses reviewed anatomical regions and color evidence before
shade quantization. This is not a generic character importer. Originals stay intact.
"""
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'artwork/rig-sprint/candidate-review/originals/Top-Down Tactical Agent Sprite.png'
OUT = ROOT / 'artwork/rig-sprint/preferred-master-v01'


def polygon(points):
    image = Image.new('L', (1024, 1024))
    ImageDraw.Draw(image).polygon(points, fill=255)
    return np.array(image) > 0


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert('RGBA')
    # Keep original edge alpha near the substantial subject; discard remote
    # faint specks, rather than cropping or globally erasing antialiasing.
    support = source.getchannel('A').point(lambda a: 255 if a >= 16 else 0).filter(ImageFilter.MaxFilter(9))
    pixels = np.array(source)
    remove = (np.array(support) == 0) & (pixels[:, :, 3] > 0)
    pixels[remove] = 0
    evidence = Image.fromarray(pixels).resize((1024, 1024), Image.Resampling.LANCZOS)
    evidence.save(OUT / 'normalized-shading-evidence.png')
    p = np.array(evidence)
    promoted = (p[:,:,3]>=240) & (p[:,:,3]<255)
    p[promoted,3] = 255
    rgb = p[:, :, :3].astype(np.int16)
    r, g, b = (rgb[:, :, i] for i in range(3))
    yy, xx = np.indices((1024, 1024))
    visible = p[:, :, 3] > 0
    # Region boundaries are authored for THIS inspected image only. Colors
    # distinguish tan straps, skin and ochre trim within those regions.
    head = polygon([(430,184),(593,184),(619,284),(589,355),(549,402),(473,402),(435,357),(410,285)])
    skin_arm = polygon([(258,483),(325,484),(353,521),(327,551),(255,541)]) | polygon([(669,483),(766,483),(771,541),(696,551),(672,522)])
    knee = polygon([(371,662),(469,662),(481,729),(458,780),(377,782),(357,721)]) | polygon([(555,662),(653,662),(667,721),(646,782),(566,780),(543,729)])
    shoulder_gear = polygon([(295,321),(363,293),(410,317),(405,366),(370,404),(297,439),(268,405)]) | polygon([(614,317),(661,293),(729,321),(756,405),(727,439),(654,404),(619,366)])
    gloves = ((xx < 368) | (xx > 656)) & (yy >= 523)
    boots = yy >= 776
    case = polygon([(443,501),(576,501),(579,566),(444,566)])
    trousers = polygon([(376,580),(400,590),(455,598),(512,601),(569,598),(624,590),(648,580),
                        (675,790),(670,920),(350,920),(350,790)])
    brown = (r > b+25) & (g > b+10)
    accent = (r > g+20) & (g > b+65) & ~(head | skin_arm)
    skin = (head | skin_arm) & brown
    harness = brown & ~skin & ~accent
    outline = (rgb.max(axis=2) < 40) & ((rgb.max(axis=2)-rgb.min(axis=2)) < 14)
    # Base material by physical region, then color/material overrides. Empty
    # display and hair masks are valid for this bald, unlit-display proof.
    keys = ['shirt','trousers','harness','gear','accents','display','skin','hair','outline']
    ids = np.zeros((1024,1024), dtype=np.uint8)
    ids[trousers] = keys.index('trousers')+1
    ids[visible & (ids == 0)] = 1
    ids[shoulder_gear | knee | gloves | boots | case] = keys.index('gear')+1
    ids[harness] = keys.index('harness')+1
    ids[skin] = keys.index('skin')+1
    ids[accent] = keys.index('accents')+1
    ids[outline] = keys.index('outline')+1
    ids[~visible] = 0
    palette = json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {characterMaterialPalette,materialRgbRamp} from './demos/shared/sprites/character-art-prompts.mjs';"
        "console.log(JSON.stringify(Object.fromEntries(Object.entries(characterMaterialPalette).map(([k,v])=>[k,k==='display'?[[0,217,238]]:materialRgbRamp(v)]))));"
    ], cwd=ROOT, text=True))
    palette['outline'] = [[20,22,24]]
    mask_colors = [(205,205,205),(50,115,220),(200,180,110),(80,85,95),(255,205,0),(0,220,240),(255,100,170),(150,90,40),(20,22,24)]
    preview = np.zeros_like(p)
    result = p.copy()
    # Remove isolated shading noise, without touching material ownership/alpha.
    shade_rgb = np.array(evidence.convert('RGB').filter(ImageFilter.MedianFilter(3))).astype(np.int32)
    counts = {}
    masks = OUT / 'masks'
    masks.mkdir(exist_ok=True)
    for index, key in enumerate(keys, 1):
        selected = ids == index
        counts[key] = int(selected.sum())
        mask = np.where(selected, p[:,:,3], 0).astype(np.uint8)
        Image.fromarray(mask).save(masks / f'{key}.png')
        preview[selected,:3] = mask_colors[index-1]
        preview[selected,3] = p[selected,3]
        ramp = np.array(palette[key], dtype=np.int32)
        observed = shade_rgb[selected]
        # Nearest SHADE of an already assigned material, never global palette.
        nearest = ((observed[:,None,:]-ramp[None,:,:])**2).sum(axis=2).argmin(axis=1)
        result[selected,:3] = ramp[nearest]
    result[~visible] = 0
    Image.fromarray(ids).save(masks / 'material-id.png')
    Image.fromarray(preview).save(OUT / 'material-ownership-preview.png')
    Image.fromarray(result).save(OUT / 'char_technician_v01__master__source.png')
    report = {'source':SOURCE.relative_to(ROOT).as_posix(),
        'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'transform':'Whole 1254 canvas to 1024; no crop, independent scale, translation or anatomy edit.',
        'removed_remote_faint_pixels':int(remove.sum()), 'material_pixels':counts,
        'near_opaque_pixels_promoted_to_alpha255':int(promoted.sum()),
        'mask_status':'Draft source-specific regions; visually review before acceptance.',
        'shade_filter':'3px median of shading evidence before selecting a shade within each assigned material.',
        'source_bounds':Image.fromarray(result).getchannel('A').getbbox(),
        'strict_palette_pass':all(tuple(v) in {tuple(c) for ramp in palette.values() for c in ramp}
                                  for v in np.unique(result[visible,:3],axis=0)),
        'alpha_unchanged_by_masks_and_quantization':bool(np.array_equal(p[:,:,3],result[:,:,3]))}
    (OUT / 'preparation-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2))


if __name__ == '__main__':
    main()

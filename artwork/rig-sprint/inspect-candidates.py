"""Read-only candidate inventory; copied originals and diagnostic overlays only.

Run from the repository root: python artwork/rig-sprint/inspect-candidates.py
No cleanup, palette conversion, registration correction or activation occurs.
"""
import argparse
import hashlib
import json
import subprocess
import zipfile
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artwork/rig-sprint/candidate-review'
DOWNLOADS = Path.home() / 'Downloads'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def preserve(name, data):
    path = OUT / 'originals' / name
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() != data:
        raise ValueError(f'Refusing to overwrite different original: {path}')
    if not path.exists():
        path.write_bytes(data)
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--extra', type=Path, action='append', default=[],
                        help='Also inspect a generated Stage A candidate; repeat for multiple attempts.')
    args = parser.parse_args()
    contract = json.loads(subprocess.check_output([
        'node', '--input-type=module', '-e',
        "import {rigTemplate} from './demos/shared/sprites/character-rig.mjs';"
        "import {characterMaterialPalette,materialRgbRamp} from './demos/shared/sprites/character-art-prompts.mjs';"
        "console.log(JSON.stringify({pivots:rigTemplate,ramps:Object.fromEntries(Object.entries(characterMaterialPalette).map(([k,v])=>[k,k==='display'?[[0,217,238]]:materialRgbRamp(v)]))}));"
    ], cwd=ROOT, text=True))
    palette = {tuple(rgb) for ramp in contract['ramps'].values() for rgb in ramp}
    palette.add((20, 22, 24))
    archive = DOWNLOADS / 'orionis-rig-technician-v01-master-b001.zip'
    archive_copy = preserve(archive.name, archive.read_bytes())
    with zipfile.ZipFile(archive_copy) as z:
        if z.testzip() is not None:
            raise ValueError('Candidate ZIP failed CRC')
        expected = 'orionis-rig-technician-v01-master-b001/char_technician_v01__master__source.png'
        if z.namelist() != [expected]:
            raise ValueError('Unexpected candidate ZIP contents')
        master = preserve('palette-master.png', z.read(expected))
    candidates = [('palette-master', master)]
    for key, filename in [('preferred-camera', 'Top-Down Tactical Agent Sprite.png'),
                          ('older-reference', 'Top-Down Tactical Character Sprite.png')]:
        src = DOWNLOADS / filename
        candidates.append((key, preserve(filename, src.read_bytes())))
    for index, extra in enumerate(args.extra, 1):
        candidates.append((f'stage-a-attempt-{index:02}', extra.resolve()))
    report = {'purpose': 'Diagnostic only; no master approved; source files unchanged.',
              'zip_crc': 'passed', 'palette_rule': 'Shared module ramps; display base only; outline included.',
              'pivots': contract['pivots'], 'candidates': []}
    panels = []
    for key, path in candidates:
        with Image.open(path) as source:
            source.load()
            im = source.convert('RGBA')
            alpha = im.getchannel('A')
            opaque = Counter(tuple(p[:3]) for p in im.getdata() if p[3] >= 240)
            all_visible = Counter(tuple(p[:3]) for p in im.getdata() if p[3] > 0)
            bounds = {str(level): alpha.point(lambda a: 255 if a >= level else 0).getbbox()
                      for level in [1, 16, 128, 240, 255]}
            box = bounds['1']
            report['candidates'].append({
                'id': key, 'original': path.relative_to(ROOT).as_posix(),
                'sha256': digest(path.read_bytes()), 'format': source.format,
                'mode': source.mode, 'size': im.size, 'frames': getattr(source, 'n_frames', 1),
                'alpha_bounds_by_minimum': bounds, 'alpha_extrema': alpha.getextrema(),
                'opaque_pixel_count': sum(opaque.values()), 'opaque_unique_rgb': len(opaque),
                'opaque_allowed_rgb_pixels': sum(n for rgb, n in opaque.items() if rgb in palette),
                'source_size_pass': im.size == (1024, 1024),
                'source_64px_padding_pass': im.size == (1024, 1024) and box is not None
                    and min(box[0], box[1]) >= 64 and max(box[2], box[3]) <= 960,
                'visible_pixel_count': sum(all_visible.values()),
                'visible_off_palette_pixels': sum(n for rgb, n in all_visible.items() if rgb not in palette),
                'overlay_transform': 'Whole canvas resized to 1024; no crop/translation; diagnostic only.'
            })
            im = im.resize((1024, 1024), Image.Resampling.LANCZOS)
            # Native-size companion: unchanged source pixels, template points
            # mapped proportionally from the 1024 contract for diagnostic comparison.
            native = Image.new('RGBA', source.size, '#e4e7ea')
            native.alpha_composite(source.convert('RGBA'))
            native_draw = ImageDraw.Draw(native)
            sx, sy = source.width / 1024, source.height / 1024
            native_draw.rectangle((64*sx, 64*sy, 960*sx, 960*sy), outline='#c82665', width=3)
            for part, (tx, ty) in contract['pivots'].items():
                x, y = tx*sx, ty*sy
                color = '#ff0055' if part == 'head' else '#005cff'
                native_draw.ellipse((x-8, y-8, x+8, y+8), outline=color, width=3)
                native_draw.line((x-16, y, x+16, y), fill=color, width=2)
                native_draw.line((x, y-16, x, y+16), fill=color, width=2)
                lx = x+20 if part not in ['right_arm', 'right_leg'] else x-225
                native_draw.rectangle((lx-3, y-22, lx+220, y-3), fill='white')
                native_draw.text((lx, y-20), f'{part}: native ({x:.1f},{y:.1f})', fill=color)
            native_draw.rectangle((0, 0, source.width, 30), fill='white')
            native_draw.text((12, 8), key + ' | native source size | proportionally mapped template | NOT APPROVED', fill='black')
            native.save(OUT / f'{key}--native-pivot-overlay.png')
            canvas = Image.new('RGBA', (1024, 1024), '#e4e7ea')
            draw = ImageDraw.Draw(canvas)
            for y in range(0, 1024, 32):
                for x in range(0, 1024, 32):
                    if (x // 32 + y // 32) % 2:
                        draw.rectangle((x, y, x+31, y+31), fill='#cbd1d6')
            canvas.alpha_composite(im)
            draw = ImageDraw.Draw(canvas)
            draw.rectangle((64, 64, 960, 960), outline='#c82665', width=3)
            draw.line((512, 64, 512, 960), fill='#ffffff', width=1)
            for part, (x, y) in contract['pivots'].items():
                color = '#ff0055' if part == 'head' else '#005cff'
                draw.ellipse((x-8, y-8, x+8, y+8), outline=color, width=3)
                draw.line((x-16, y, x+16, y), fill=color, width=2)
                draw.line((x, y-16, x, y+16), fill=color, width=2)
                label = f'{part} ({x},{y})'
                lx = x+20 if part not in ['right_arm', 'right_leg'] else x-190
                draw.rectangle((lx-3, y-22, lx+175, y-3), fill='white')
                draw.text((lx, y-20), label, fill=color)
            draw.rectangle((0, 0, 1024, 30), fill='white')
            draw.text((12, 8), key + ' | locked pivots | pink boundary = 64px padding | NOT APPROVED', fill='black')
            canvas.save(OUT / f'{key}--pivot-overlay.png')
            panels.append(canvas.convert('RGB').resize((512, 512), Image.Resampling.LANCZOS))
    sheet = Image.new('RGB', (512*len(panels), 512), 'white')
    for i, panel in enumerate(panels):
        sheet.paste(panel, (i*512, 0))
    sheet.save(OUT / 'candidate-pivot-comparison.png')
    (OUT / 'inspection.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    for candidate in report['candidates']:
        print(f"{candidate['id']}: {candidate['size']}; alpha bounds {candidate['alpha_bounds_by_minimum']['1']}; "
              f"allowed RGB {candidate['opaque_allowed_rgb_pixels']}/{candidate['opaque_pixel_count']} alpha>=240 pixels")
    print(f'Full measurements: {OUT / "inspection.json"}')


if __name__ == '__main__':
    main()

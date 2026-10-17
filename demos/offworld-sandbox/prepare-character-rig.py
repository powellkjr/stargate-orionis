"""Normalize a registered jointed source set together; never crop parts."""
import json, math, os, re, shutil, sys, tempfile
from pathlib import Path
from PIL import Image

def prepare(source, target, contract):
    source, target = Path(source).resolve(), Path(target).resolve()
    data = json.loads((source / 'rig.json').read_text(encoding='utf-8'))
    ident = data.get('id', '')
    if data.get('version') != 2 or data.get('sourceCanvas') != 1024 or not re.fullmatch(r'[a-z0-9_-]+', ident):
        raise ValueError('Invalid source rig header')
    if set(data.get('parts', {})) != set(contract['parts']):
        raise ValueError('All eleven jointed source parts are required')
    if target.exists():
        raise ValueError('Refusing to replace an existing rig output directory')
    output = dict(version=2, id=ident, sourceCanvas=1024, canvas=128, parts={})
    images = {}
    for part in contract['parts']:
        entry = data['parts'][part]
        filename = f'char_{ident}__{part.replace("_", "-")}__source.png'
        if entry.get('file') != filename or entry.get('pivot') != contract['pivots'][part]:
            raise ValueError(f'Wrong filename or template pivot: {part}')
        path = (source / filename).resolve()
        if path.parent != source or path.stat().st_size > 32 * 1024 * 1024:
            raise ValueError(f'Unsafe or oversized source: {part}')
        with Image.open(path) as im:
            if im.format != 'PNG' or im.mode != 'RGBA' or im.size != (1024, 1024) or getattr(im, 'n_frames', 1) != 1:
                raise ValueError(f'Expected single-frame 1024 RGBA PNG: {part}')
            alpha = im.getchannel('A')
            if alpha.getextrema()[0] != 0:
                raise ValueError(f'Missing transparency: {part}')
            bounds = alpha.getbbox()
            if bounds is None and part != 'equipment':
                raise ValueError(f'Empty body part: {part}')
            if bounds and (min(bounds[0], bounds[1]) < 64 or max(bounds[2], bounds[3]) > 960):
                raise ValueError(f'Source requires 64px outer padding: {part}')
            limit = 12 if part.endswith('arm') else 15 if part.endswith('leg') else 0
            if bounds and limit:
                px, py = entry['pivot']
                for deg in [-limit, limit]:
                    angle = math.radians(deg)
                    for x in [bounds[0], bounds[2]]:
                        for y in [bounds[1], bounds[3]]:
                            rx = px + (x-px)*math.cos(angle) - (y-py)*math.sin(angle)
                            ry = py + (x-px)*math.sin(angle) + (y-py)*math.cos(angle)
                            if not (0 <= rx <= 1024 and 0 <= ry <= 1024):
                                raise ValueError(f'Rotation may clip {part}')
            images[part] = im.resize((128, 128), Image.Resampling.LANCZOS)
        name = f'char_{ident}__{part.replace("_", "-")}.png'
        output['parts'][part] = dict(src=f'../shared/sprites/offworld/rigs/{target.name}/{name}', pivot=[v/8 for v in entry['pivot']], parent=contract['parents'][part], z=contract['order'][part])
    target.parent.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix='.rig-stage-', dir=target.parent))
    try:
        for part, im in images.items():
            im.save(stage / Path(output['parts'][part]['src']).name, format='PNG')
        (stage / 'rig.json').write_text(json.dumps(output, indent=2)+'\n', encoding='utf-8')
        os.rename(stage, target)
    finally:
        if stage.exists(): shutil.rmtree(stage)
    print(f'Normalized {len(images)} registered jointed parts: {target}. Registration/format checked; seams, RGB and animation still require visual review. Not activated.')

try:
    prepare(sys.argv[1], sys.argv[2], json.loads(sys.argv[3]))
except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)

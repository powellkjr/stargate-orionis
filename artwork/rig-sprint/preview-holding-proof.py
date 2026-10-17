"""Two-bone holding diagnostics using the existing rig and shared JS matrices.

Weapons are code-drawn registration props, not authored inventory/game assets.
Only this offline proof changes arm draw order; no runtime registry is touched.
"""
import json
import hashlib
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / 'demos/shared/sprites/offworld/rigs/technician-v01-jointed-proof-v04'
OUT = ROOT / 'artwork/rig-sprint/holding-proof-v05'
HANDS = {'left': (92, 74), 'right': (36, 74)}


def component_areas(image):
    opaque = {i for i,a in enumerate(image.getchannel('A').getdata()) if a >= 128}
    areas = []
    while opaque:
        stack, area = [opaque.pop()], 0
        while stack:
            i = stack.pop()
            area += 1
            x,y = i%128,i//128
            neighbors = ([i-1] if x else []) + ([i+1] if x<127 else [])
            neighbors += ([i-128] if y else []) + ([i+128] if y<127 else [])
            for neighbor in neighbors:
                if neighbor in opaque:
                    opaque.remove(neighbor)
                    stack.append(neighbor)
        areas.append(area)
    return sorted(areas, reverse=True)


def angle(vector):
    return math.atan2(vector[1], vector[0])


def difference(a, b):
    return (a - b + math.pi) % (2 * math.pi) - math.pi


def solve(rig, side, target):
    shoulder = rig['parts'][side + '_upper_arm']['pivot']
    elbow = rig['parts'][side + '_forearm']['pivot']
    hand = HANDS[side]
    upper = (elbow[0] - shoulder[0], elbow[1] - shoulder[1])
    lower = (hand[0] - elbow[0], hand[1] - elbow[1])
    u, v = math.hypot(*upper), math.hypot(*lower)
    delta = (target[0] - shoulder[0], target[1] - shoulder[1])
    distance = math.hypot(*delta)
    if not abs(u - v) < distance < u + v:
        raise ValueError(f'{side} grip outside unscaled two-bone reach: {target}')
    offset = math.acos((u*u + distance*distance - v*v) / (2*u*distance))
    # Keep elbows on their own outside of the body, rather than crossing arms.
    direction = angle(delta) + (-offset if side == 'left' else offset)
    bent = (shoulder[0] + u*math.cos(direction), shoulder[1] + u*math.sin(direction))
    upper_angle = difference(direction, angle(upper))
    lower_direction = angle((target[0] - bent[0], target[1] - bent[1]))
    forearm_angle = difference(lower_direction, angle(lower) + upper_angle)
    return {side + '_upper_arm': math.degrees(upper_angle),
            side + '_forearm': math.degrees(forearm_angle)}


def prop(kind):
    # Local coordinates: x across the receiver, y along the bore, grip at (0,0).
    image = Image.new('RGBA', (128, 128))
    draw = ImageDraw.Draw(image)
    if kind == 'pistol':
        origin, direction = (64, 68), (0, 1)
        shapes = [([(-2,-3),(2,-3),(2,17),(-2,17)], '#141618'),
                  ([(-1,-2),(1,-2),(1,15),(-1,15)], '#525860'),
                  ([(-1,0),(3,0),(3,4),(-1,4)], '#343840')]
        line = [(-.5,1),(-.5,14)]
    else:
        origin, direction = (68, 59), (4 / math.sqrt(137), 11 / math.sqrt(137))
        shapes = [([(-3,-11),(3,-11),(2,-3),(2,13),(1,29),(-1,29),(-2,13),(-2,-3)], '#141618'),
                  ([(-2,-10),(2,-10),(1,-3),(-1,-3)], '#343840'),
                  ([(-1.5,-2),(1.5,-2),(1.5,15),(-1.5,15)], '#525860'),
                  ([(1,1),(5,3),(4,8),(1,7)], '#343840')]
        line = [(-.5,3),(-.5,24)]
    dx, dy = direction
    def point(p):
        x, y = p
        return (origin[0] + x*dy + y*dx, origin[1] - x*dx + y*dy)
    for polygon, color in shapes:
        draw.polygon([point(p) for p in polygon], fill=color)
    draw.line([point(p) for p in line], fill='#727880', width=1)
    return image


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rig = json.loads((PACK / 'rig.json').read_text())
    layers = {part: Image.open(PACK / Path(entry['src']).name).convert('RGBA')
              for part, entry in rig['parts'].items()}
    targets = {'pistol': {'left': (66, 68), 'right': (62, 68)},
               'rifle': {'left': (72, 70), 'right': (68, 59)}}
    specs = []
    for name, grips in targets.items():
        joints = {}
        for side, target in grips.items():
            joints.update(solve(rig, side, target))
        specs.append({'name': name, 'grips': grips, 'joints': joints})
    samples = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e',
         "import {readFileSync} from 'node:fs';"
         "import {rigPose,rigPartMatrix} from './demos/shared/sprites/character-rig.mjs';"
         "const rig=JSON.parse(readFileSync(process.argv[1]));"
         "const specs=JSON.parse(readFileSync(0,'utf8'));"
         "const sample=(name,pose)=>({name,pose,matrices:Object.fromEntries(Object.keys(rig.parts).map(k=>[k,rigPartMatrix(rig,pose,k)]))});"
         "console.log(JSON.stringify(specs.map(s=>({...s,frames:Array.from({length:13},(_,i)=>sample(s.name,{...rigPose('IDLE'),...Object.fromEntries(Object.entries(s.joints).map(([k,v])=>[k,v*i/12]))}))}))));",
         str(PACK / 'rig.json')], input=json.dumps(specs), cwd=ROOT, text=True))
    base_order = sorted(layers, key=lambda p: rig['parts'][p]['z'])
    # Sleeves stay beneath torso sockets. Forearms/grips cross in front of gear.
    order = [p for p in base_order if not p.endswith('_forearm')]
    def render(sample, weapon=None, grips=None):
        output = Image.new('RGBA', (128, 128))
        for part in order + ['left_forearm', 'right_forearm']:
            a,b,c,d,e,f = sample['matrices'][part]
            det = a*d-b*c
            inverse = (d/det, -c/det, (c*f-d*e)/det, -b/det, a/det, (b*e-a*f)/det)
            output.alpha_composite(layers[part].transform((128,128), Image.Transform.AFFINE,
                                   inverse, resample=Image.Resampling.BICUBIC))
        if weapon:
            hands = output.copy()
            output.alpha_composite(prop(weapon))
            # Fingers cover the grip, but the receiver/barrel must remain visible
            # above crossing forearms. This small proof-only occlusion mask does
            # not claim the existing closed glove art is an authored gun grip.
            mask = Image.new('L', (128,128))
            draw = ImageDraw.Draw(mask)
            for x,y in grips.values():
                draw.ellipse((x-2,y-2,x+2,y+2), fill=255)
            output.paste(hands, (0,0), mask)
        return output
    comparison = Image.new('RGB', (768, 436), '#e4e7ea')
    checks = []
    for index, spec in enumerate(samples):
        final = spec['frames'][-1]
        raw = render(final, spec['name'], spec['grips'])
        raw.save(OUT / (spec['name'] + '-pose.png'))
        render(final).save(OUT / (spec['name'] + '-arms-only.png'))
        enlarged = raw.resize((384,384), Image.Resampling.NEAREST)
        comparison.paste(enlarged, (index*384,0), enlarged)
        draw = ImageDraw.Draw(comparison)
        draw.text((index*384+12,390), spec['name'].upper() + ' | same rig / two elbow joints', fill='black')
        draw.text((index*384+12,410), 'Generic registration prop | not activated', fill='black')
        tiny = raw.resize((22,22), Image.Resampling.LANCZOS)
        comparison.paste(tiny, (index*384+350,393), tiny)
        errors = {}
        for side, target in spec['grips'].items():
            a,b,c,d,e,f = final['matrices'][side + '_forearm']
            x,y = HANDS[side]
            actual = (a*x+c*y+e, b*x+d*y+f)
            error = math.dist(actual, target)
            assert error < 1e-8, (spec['name'], side, error)
            errors[side] = {'target': target, 'transformed_hand': actual, 'error_pixels': error}
        frames = []
        frame_checks = []
        sheet = Image.new('RGB', (768, 864), '#e4e7ea')
        for i, sample in enumerate(spec['frames']):
            posed = render(sample, spec['name'] if i == 12 else None, spec['grips'])
            areas = component_areas(posed)
            assert not any(area >= 3 for area in areas[1:]), (spec['name'], i, areas)
            bounds = posed.getbbox()
            assert bounds[0] > 0 and bounds[1] > 0 and bounds[2] < 128 and bounds[3] < 128
            frame_checks.append({'frame': i, 'bounds': bounds, 'alpha128_component_areas': areas})
            tile = posed.resize((192,192), Image.Resampling.NEAREST)
            x,y = (i%4)*192,(i//4)*216
            sheet.paste(tile, (x,y), tile)
            ImageDraw.Draw(sheet).text((x+5,y+195), f'{spec["name"]} bend {i}/12', fill='black')
            frame = Image.new('RGB',(384,408),'#e4e7ea')
            large = posed.resize((384,384),Image.Resampling.NEAREST)
            frame.paste(large,(0,0),large)
            ImageDraw.Draw(frame).text((10,388), spec['name'].upper() + ' | arm bend inspection', fill='black')
            frames.append(frame)
        # Reverse returns to neutral; prop appears only at the final grip pose.
        playback = frames + frames[-2:0:-1]
        playback[0].save(OUT / (spec['name'] + '-bend-proof.gif'), save_all=True,
                         append_images=playback[1:], duration=[80]*12+[900]+[80]*11, loop=0)
        sheet.save(OUT / (spec['name'] + '-all-bend-frames.png'))
        checks.append({'name': spec['name'], 'joint_angles_degrees': spec['joints'],
                       'grip_checks': errors, 'frame_checks': frame_checks, 'frames': spec['frames']})
    comparison.save(OUT / 'pistol-and-rifle-review.png')
    (OUT / 'pose-checks.json').write_text(json.dumps({
        'rig_pack': str(PACK.relative_to(ROOT)), 'draw_order': order + ['left_forearm','right_forearm','prop','grip_occlusion'],
        'hand_anchors': HANDS, 'poses': checks,
        'input_sha256': {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                         for path in sorted(PACK.iterdir()) if path.suffix in ('.json','.png')},
        'scope': 'Offline registration proof, fixed head/camera, generic code-drawn weapon props; no holding gameplay.'
    }, indent=2)+'\n', encoding='utf-8')
    print('Wrote pistol/rifle poses and bend GIFs. All four grip anchors agree with shared JS matrices.')


if __name__ == '__main__':
    main()

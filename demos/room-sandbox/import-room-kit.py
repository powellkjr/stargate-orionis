"""Copy a complete registered source kit for local preview. Never crop or recenter."""
import argparse
import json
import shutil
from pathlib import Path
from PIL import Image

PIECES = {'center': (256,256,768,768), 'corner': (0,0,256,256),
          'shared': (0,0,256,256), 'edge-normal': (256,0,768,256),
          'edge-door': (256,0,768,256), 'edge-open': (256,0,768,256)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--kit', default='material-storage')
    args = parser.parse_args()
    if not args.kit or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in args.kit):
        parser.error('kit must be a lowercase hyphenated ID')
    if args.out.exists():
        parser.error('output already exists; choose a fresh batch directory')
    files, warnings = [], []
    for variant in ('v01', 'v02', 'v03'):
        for piece, rect in PIECES.items():
            name = f'{args.kit}-{piece}__{variant}__source.png'
            path = args.source / name
            with Image.open(path) as im:
                if im.size != (1024,1024) or im.mode != 'RGBA' or im.format != 'PNG':
                    raise ValueError(f'{name}: expected 1024-square RGBA PNG')
                alpha = im.getchannel('A')
                bounds = alpha.getbbox()
                if bounds and not (bounds[0]>=rect[0] and bounds[1]>=rect[1] and bounds[2]<=rect[2] and bounds[3]<=rect[3]):
                    raise ValueError(f'{name}: visible pixels outside registered rectangle')
                if piece in ('center','edge-open') and bounds:
                    raise ValueError(f'{name}: v1 requires an empty frame')
                if piece not in ('center','edge-open') and not bounds:
                    raise ValueError(f'{name}: required architecture is empty')
                if piece == 'edge-door' and alpha.crop((384,0,640,256)).getbbox():
                    warnings.append(f'{name}: pixels intrude into clear doorway')
                if piece not in ('center','edge-open'):
                    slot = alpha.crop((rect[0],32,rect[2],72))
                    if slot.getbbox():
                        warnings.append(f'{name}: north CT channel contains opaque/partial pixels; review CT visibility')
                files.append((path,name,bounds))
    args.out.mkdir(parents=True)
    for path,name,_ in files:
        shutil.copy2(path,args.out/name)
    report = {'kitId': args.kit, 'sourceDirectory': str(args.source.resolve()),
              'frame': [1024,1024], 'files': [{'name':n,'visibleBounds':b} for _,n,b in files], 'warnings':warnings}
    (args.out/'import-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(f'Copied {len(files)} unchanged source frames to {args.out}')
    for warning in warnings:
        print('Review: '+warning)


if __name__ == '__main__':
    main()

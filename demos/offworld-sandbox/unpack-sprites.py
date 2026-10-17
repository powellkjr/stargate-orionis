"""Validate a strict three-variant source ZIP before extracting any files."""
import argparse
import io
import json
from pathlib import Path
import re
import stat
import sys
import zipfile


def main():
    from PIL import Image
    parser = argparse.ArgumentParser()
    parser.add_argument('manifest')
    parser.add_argument('zip', type=Path)
    parser.add_argument('--out', type=Path, default=Path('artwork/sprite-sources'))
    args = parser.parse_args()
    assets = json.load(sys.stdin) if args.manifest == '-' else json.loads(args.manifest)
    match = re.fullmatch(r'orionis-([a-z0-9-]+)-b([0-9]{3})\.zip', args.zip.name)
    if not match or match[1] not in assets or match[2] == '000':
        raise ValueError('ZIP must be named orionis-<existing-key>-b001.zip (positive three-digit batch).')
    group = match[1]
    if group in ['door-open', 'gate-open']:
        raise ValueError('State pairs must use the base group door or gate, containing both states.')
    keys = [group] + ([assets[group]['pair']] if assets[group]['pair'] else [])
    root = args.zip.stem
    expected = {f'{root}/{key}__v{v:02d}__source.png': key for key in keys for v in range(1, 4)}
    if not args.zip.is_file() or args.zip.stat().st_size > 134217728:
        raise ValueError('ZIP missing or larger than 128 MiB.')
    validated = {}
    with zipfile.ZipFile(args.zip) as archive:
        infos = archive.infolist()
        if len(infos) > len(expected) + 1:
            raise ValueError('Unexpected extra/duplicate ZIP entries.')
        names = [i.filename for i in infos if not i.is_dir()]
        if len(names) != len(set(names)) or set(names) != set(expected):
            raise ValueError('ZIP members must exactly match the named root and three canonical variants; extra/unsafe paths rejected.')
        if sum(i.file_size for i in infos) > 201326592:
            raise ValueError('Uncompressed ZIP exceeds 192 MiB.')
        for info in infos:
            if stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1:
                raise ValueError('Symlinks and encrypted ZIP members are unsupported.')
            if info.is_dir():
                if info.filename != root + '/':
                    raise ValueError('Nested/unsafe directories are unsupported.')
                continue
            if info.file_size > 33554432:
                raise ValueError('Source PNG exceeds 32 MiB.')
            data = archive.read(info)
            with Image.open(io.BytesIO(data)) as image:
                if image.format != 'PNG' or image.size != (1024, 1024) or getattr(image, 'n_frames', 1) != 1:
                    raise ValueError(f'{info.filename}: expected single-frame 1024x1024 PNG.')
                key = expected[info.filename]
                if image.mode not in (['RGB', 'RGBA'] if assets[key]['opaque'] else ['RGBA']):
                    raise ValueError(f'{info.filename}: RGB/RGBA floor or RGBA transparent source required.')
                image.load()
                alpha = image.convert('RGBA').getchannel('A')
                if assets[key]['opaque'] and alpha.getextrema() != (255, 255):
                    raise ValueError('Floor source must be fully opaque.')
                if not assets[key]['opaque'] and (not alpha.getbbox() or alpha.getextrema()[0] != 0):
                    raise ValueError('Transparent source must contain a visible subject and actual zero-alpha pixels.')
                validated[info.filename] = data
    destination = args.out.resolve() / root
    if destination.exists():
        raise ValueError('Batch destination already exists; choose another output directory or batch number.')
    # Every entry is validated before any filesystem mutation. Only canonical
    # basenames can be written, never paths taken directly from ZIP metadata.
    destination.mkdir(parents=True)
    for name, data in sorted(validated.items()):
        (destination / Path(name).name).write_bytes(data)
    print(f'Validated and unpacked {len(validated)} source PNGs to {destination}')
    print('Candidates only: select a variant, normalize it, validate state pairs, then explicitly update the manifest.')


if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print('Pillow required: python -m pip install Pillow==11.3.0', file=sys.stderr)
        sys.exit(1)
    except (ValueError, OSError, zipfile.BadZipFile, RuntimeError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)

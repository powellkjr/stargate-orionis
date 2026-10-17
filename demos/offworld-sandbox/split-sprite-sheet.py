"""Split three isolated sprites or (--tiles) three opaque square interior tiles."""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import shutil
import sys
import tempfile


def main():
    from PIL import Image
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('config', nargs='?', help='Optional internal JSON configuration; omit for direct Python use')
    parser.add_argument('input', type=Path)
    parser.add_argument('--asset', help='Existing isolated sprite key, e.g. console')
    parser.add_argument('--size', help='Explicit runtime WIDTHxHEIGHT for direct Python use')
    parser.add_argument('--padding', type=int, help='Explicit runtime padding for direct Python use')
    parser.add_argument('--tiles', action='store_true', help='Exact 3:1 opaque sheet: preserve full square cells without cropping or padding')
    parser.add_argument('--batch', required=True, help='New batch name, e.g. orionis-console-b002')
    parser.add_argument('--out', type=Path, default=Path('artwork'), help='Artwork root containing sprite-sources and sprite-prepared')
    parser.add_argument('--background', help='Explicit six-digit RGB backdrop color, e.g. #ffffff')
    parser.add_argument('--tolerance', type=int, default=0)
    args = parser.parse_args()
    if args.config:
        config = json.loads(args.config)
        if args.asset or args.size or args.padding is not None:
            raise ValueError('Do not combine internal configuration with direct Python asset/size/padding options.')
    else:
        if not args.asset or not re.fullmatch(r'[a-z0-9-]+', args.asset):
            raise ValueError('Direct Python use requires --asset with an existing isolated sprite key.')
        placeholders = Path(__file__).resolve().parent.parent/'shared/sprites/offworld'
        if not (placeholders/f'{args.asset}.svg').is_file() and not (args.tiles and args.asset.startswith('floor-room-')):
            raise ValueError('Unknown sprite asset; use an existing sprite key.')
        if (args.asset.startswith('floor-') and not args.tiles) or args.asset in ('door', 'door-open', 'gate', 'gate-open'):
            raise ValueError('Floors and registered pairs use dedicated workflows.')
        # Size is explicit to avoid duplicating the JS manifest as a Python catalog.
        if not args.size or args.padding is None:
            raise ValueError('Specify --size WIDTHxHEIGHT and --padding from the sprite contract.')
        if not re.fullmatch(r'[0-9]+x[0-9]+', args.size):
            raise ValueError('Size must be WIDTHxHEIGHT.')
        size = [int(value) for value in args.size.split('x')]
        if any(value < 1 or value > 4096 for value in size) or args.padding < 0 or 2*args.padding >= min(size):
            raise ValueError('Invalid dimensions or padding: leave space for the sprite.')
        config = {'key': args.asset, 'runtimeFile': f'{args.asset}.png', 'runtimePixels': size,
                  'padding': args.padding, 'opaque': args.tiles, 'pair': None}
    if args.tiles and (not config['opaque'] or config['padding'] != 0 or config['runtimePixels'][0] != config['runtimePixels'][1] or args.background):
        raise ValueError('Tile mode requires an opaque square asset, --padding 0 and no background cleanup.')
    if config['pair'] or (config['opaque'] and not args.tiles):
        raise ValueError('Only isolated sprites support sheet splitting; floors and registered pairs use dedicated workflows.')
    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}', args.batch):
        raise ValueError('Batch must contain only letters, numbers, hyphens or underscores (maximum 120 characters).')
    if not 0 <= args.tolerance <= 255 or (args.tolerance and not args.background):
        raise ValueError('Tolerance must be 0..255 and requires --background.')
    color = None
    if args.background:
        value = args.background.removeprefix('#')
        if not re.fullmatch(r'[a-fA-F0-9]{6}', value):
            raise ValueError('Background must be a six-digit RGB hex color.')
        color = tuple(int(value[i:i+2], 16) for i in (0, 2, 4))
    if not args.input.is_file() or args.input.stat().st_size > 33554432:
        raise ValueError('Use an existing PNG sheet no larger than 32 MiB.')
    spec = importlib.util.spec_from_file_location('sprite_prepare', Path(__file__).with_name('prepare-sprite.py'))
    worker = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(worker)
    with Image.open(args.input) as source:
        if source.format != 'PNG' or getattr(source, 'n_frames', 1) != 1:
            raise ValueError('Use a single-frame PNG sheet.')
        if source.width * source.height > 16777216:
            raise ValueError('Sheet exceeds 16 megapixels.')
        if source.width < 9 or source.height < 3:
            raise ValueError('Sheet is too small for three padded subjects.')
        source.load()
        image = source.convert('RGBA')
    if color is not None:
        image = worker.remove_background(image, color, args.tolerance)
    alpha = image.getchannel('A')
    w, h = image.size
    if args.tiles:
        if w != 3*h or alpha.getextrema() != (255, 255):
            raise ValueError('Tile sheet must be exactly 3:1 with three equal square cells and fully opaque pixels; no gutters or margins.')
        cuts = [h, 2*h]
        crops = [image.crop((i*h, 0, (i+1)*h, h)) for i in range(3)]
    else:
        crops, cuts = isolated_crops(image)
    publish(crops, cuts, config, args, worker, Image)


def isolated_crops(image):
    alpha = image.getchannel('A')
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError('Sheet is entirely transparent after background cleanup.')
    if alpha.getextrema()[0] != 0:
        raise ValueError('Sheet needs true transparency or an explicit solid --background color.')
    w, h = image.size
    if bounds[0] == 0 or bounds[1] == 0 or bounds[2] == w or bounds[3] == h:
        raise ValueError('Artwork touches a sheet edge; provide complete unclipped subjects with transparent margins.')
    # Projection keeps disconnected parts (e.g. tool/hand details) in their column.
    # Choose a zero-alpha cut near each third; never slice through painted pixels.
    occupied = [alpha.crop((x, 0, x+1, h)).getbbox() is not None for x in range(w)]
    cuts = []
    for numerator in (1, 2):
        center = w*numerator/3
        candidates = [x for x in range(max(1, int(center-w/6)), min(w-1, int(center+w/6)+1))
                      if not occupied[x] and not occupied[x-1]]
        if not candidates:
            raise ValueError('No transparent gutter near a column boundary; separate the three subjects clearly.')
        cuts.append(min(candidates, key=lambda x: (abs(x-center), x)))
    crops = []
    for left, right in zip([0]+cuts, cuts+[w]):
        crop = image.crop((left, 0, right, h))
        box = crop.getchannel('A').getbbox()
        if not box:
            raise ValueError('Each of the three columns must contain a subject.')
        crops.append(crop.crop(box))
    return crops, cuts


def publish(crops, cuts, config, args, worker, Image):
    root = args.out.resolve()
    source_batch = root/'sprite-sources'/args.batch
    prepared_batch = root/'sprite-prepared'/args.batch
    if source_batch.exists() or prepared_batch.exists():
        raise ValueError('Batch already exists. Choose a new --batch; existing art is never overwritten.')
    # Both outputs must stay beneath the requested artwork root, including symlinks.
    for parent in (source_batch.parent, prepared_batch.parent):
        if not parent.resolve().is_relative_to(root):
            raise ValueError('Output directory resolves outside the artwork root.')
    root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.sheet-', dir=root) as temp:
        stage = Path(temp)
        (stage/'sources').mkdir()
        (stage/'prepared').mkdir()
        for index, crop in enumerate(crops, 1):
            variant = f'v{index:02d}'
            master = worker.normalized_image(crop, {'runtimePixels': [1024, 1024], 'padding': 0 if args.tiles else 64, 'opaque': args.tiles, 'pair': None})
            # Runtime is prepared from the exact master that is saved, so it can
            # be reproduced by the existing preparation/installation workflow.
            runtime = worker.normalized_image(master, config)
            folder = stage/'prepared'/variant
            folder.mkdir()
            master_path = stage/'sources'/f"{config['key']}__{variant}__source.png"
            runtime_path = folder/config['runtimeFile']
            for output, path in ((master, master_path), (runtime, runtime_path)):
                clean = Image.frombytes('RGBA', output.size, output.tobytes())
                clean.save(path, format='PNG', compress_level=9)
            if master_path.stat().st_size > 33554432 or runtime_path.stat().st_size > 1048576:
                raise ValueError('Output exceeds existing source/runtime byte limits.')
            box = runtime.getchannel('A').getbbox()
            width, height = config['runtimePixels']
            padding = config['padding']
            if not box or box[0] < padding or box[1] < padding or box[2] > width-padding or box[3] > height-padding:
                raise ValueError('Runtime sprite fails transparent padding validation.')
        source_batch.parent.mkdir(parents=True, exist_ok=True)
        prepared_batch.parent.mkdir(parents=True, exist_ok=True)
        committed_source = False
        try:
            (stage/'sources').rename(source_batch)
            committed_source = True
            (stage/'prepared').rename(prepared_batch)
        except OSError:
            if committed_source:
                shutil.rmtree(source_batch)
            raise
    print(f'Split left-to-right v01/v02/v03 at x={cuts}; saved {source_batch} and {prepared_batch}.')
    print('Review all three: splitting does not prove camera, layout, object count, palette or style. Nothing installed.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, ImportError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)

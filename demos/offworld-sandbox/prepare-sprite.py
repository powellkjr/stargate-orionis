"""Deterministic PNG preparation. Pillow is an explicit optional offline dependency."""
import argparse
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

def remove_background(im, color, tolerance):
    """Remove only border-connected pixels matching an explicitly chosen color."""
    from PIL import Image, ImageChops, ImageDraw, ImageOps
    reference = Image.new('RGB', im.size, color)
    difference = ImageChops.difference(im.convert('RGB'), reference)
    channels = difference.split()
    distance = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
    # Existing transparent pixels also connect surrounding backdrop regions.
    mask = distance.point(lambda v: 0 if v <= tolerance else 255)
    mask = ImageChops.multiply(mask, im.getchannel('A').point(lambda v: 255 if v else 0))
    expanded = ImageOps.expand(mask, border=1, fill=0)
    ImageDraw.floodfill(expanded, (0, 0), 128)
    keep = expanded.crop((1, 1, im.width+1, im.height+1)).point(lambda v: 0 if v == 128 else 255)
    result = im.copy()
    result.putalpha(ImageChops.multiply(im.getchannel('A'), keep))
    return result


def normalized_image(im, c):
    from PIL import Image
    size, padding = tuple(c['runtimePixels']), c['padding']
    if c['opaque'] or c['pair'] or c.get('preserveFrame'):
        return im.resize(size, Image.Resampling.LANCZOS)
    box = im.getchannel('A').getbbox()
    if not box: raise ValueError('Source is entirely transparent.')
    cropped = im.crop(box)
    available = (size[0]-2*padding, size[1]-2*padding)
    ratio = min(available[0]/cropped.width, available[1]/cropped.height)
    target = (max(1, int(cropped.width*ratio)), max(1, int(cropped.height*ratio)))
    scaled = cropped.resize(target, Image.Resampling.LANCZOS)
    # Faint edge alpha may round to zero during downscaling. Center the actual
    # resulting silhouette, not the now-inaccurate source bounding rectangle.
    scaled_box = scaled.getchannel('A').getbbox()
    if not scaled_box:
        raise ValueError('Artwork becomes entirely transparent at the requested size.')
    scaled = scaled.crop(scaled_box)
    output = Image.new('RGBA', size)
    output.alpha_composite(scaled, ((size[0]-scaled.width)//2, (size[1]-scaled.height)//2))
    return output


def main():
    try:
        from PIL import Image
    except ImportError:
        raise ValueError('Pillow is required: python -m pip install Pillow==11.3.0 (offline art tool only).')
    standalone = len(sys.argv) > 1 and sys.argv[1] == 'center'
    parser = argparse.ArgumentParser(description='Center isolated PNG artwork on a transparent canvas. Registered pairs and rig parts must use their dedicated workflows.')
    parser.add_argument('mode', choices=['center'] if standalone else ['prepare', 'validate', 'manifest', 'pair-source'])
    if not standalone:
        parser.add_argument('config')
    parser.add_argument('input', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--pair', type=Path)
    parser.add_argument('--overwrite', action='store_true')
    parser.add_argument('--background', help='Explicit solid backdrop color to remove, e.g. #ffffff; only border-connected pixels.')
    parser.add_argument('--tolerance', type=int, default=0, help='Background RGB per-channel tolerance, 0..255 (default: exact match).')
    if standalone:
        parser.add_argument('--size', default='128x128', help='Output WIDTHxHEIGHT (default: 128x128).')
        parser.add_argument('--padding', type=int, default=8, help='Minimum transparent border in output pixels (default: 8).')
    args = parser.parse_args()
    if standalone:
        try:
            dimensions = [int(value) for value in args.size.lower().split('x')]
        except ValueError:
            raise ValueError('Size must be WIDTHxHEIGHT, e.g. 128x128.')
        if len(dimensions) != 2 or any(value < 1 or value > 4096 for value in dimensions):
            raise ValueError('Size must contain two dimensions between 1 and 4096.')
        if args.padding < 0 or 2*args.padding >= min(dimensions):
            raise ValueError('Padding must be nonnegative and leave space for artwork.')
        if not args.out:
            raise ValueError('Specify --out with a separate output PNG path.')
        if args.out.suffix.lower() != '.png':
            raise ValueError('Output must use the .png extension.')
        if args.pair:
            raise ValueError('Use the registered pair workflow, not center, for state pairs.')
        c = {'runtimePixels': dimensions, 'padding': args.padding, 'opaque': False,
             'pair': None, 'runtimeFile': args.out.name, 'out': str(args.out)}
        args.mode = 'prepare'
    else:
        c = json.loads(args.config)
    if not 0 <= args.tolerance <= 255:
        raise ValueError('Tolerance must be between 0 and 255.')
    background = None
    if args.background:
        if args.mode != 'prepare' or c['opaque'] or c['pair']:
            raise ValueError('Background removal is only supported when preparing isolated transparent sprites.')
        value = args.background.lstrip('#')
        if len(value) != 6 or any(ch not in '0123456789abcdefABCDEF' for ch in value):
            raise ValueError('Background must be a six-digit RGB hex color, e.g. #ffffff.')
        background = tuple(int(value[index:index+2], 16) for index in (0, 2, 4))
    elif args.tolerance:
        raise ValueError('--tolerance requires --background.')
    size, padding = tuple(c['runtimePixels']), c['padding']

    def read_png(path, limit, remove=False):
        if not path.is_file():
            raise ValueError(f'Missing source/asset: {path}')
        if path.stat().st_size > limit:
            raise ValueError(f'Oversized PNG: {path} (limit {limit} bytes)')
        with Image.open(path) as im:
            if im.format != 'PNG' or getattr(im, 'n_frames', 1) != 1:
                raise ValueError('Use a single-frame PNG; animated images are unsupported.')
            if im.width * im.height > 16777216:
                raise ValueError('Image exceeds 16 megapixels.')
            if not c['opaque'] and im.mode != 'RGBA' and not (remove and background is not None):
                raise ValueError('Transparent assets require an explicit RGBA PNG, not RGB/palette.')
            im.load()
            if not c['opaque'] and not (remove and background is not None) and im.getchannel('A').getextrema()[0] != 0:
                raise ValueError('Transparent assets must contain actual zero-alpha pixels, not an opaque backdrop.')
            result = im.convert('RGBA')
            return remove_background(result, background, args.tolerance) if remove and background is not None else result

    def validate(path):
        im = read_png(path, 1048576)
        if im.size != size:
            raise ValueError(f'{path}: expected {size}, found {im.size}')
        alpha = im.getchannel('A')
        if c['opaque']:
            if alpha.getextrema() != (255, 255):
                raise ValueError('Floor tiles must be fully opaque.')
        else:
            box = alpha.getbbox()
            if not box:
                raise ValueError('Sprite is entirely transparent.')
            w, h = size
            if box[0] < padding or box[1] < padding or box[2] > w-padding or box[3] > h-padding:
                raise ValueError(f'Nonzero alpha enters the required {padding}px transparent border.')
        return im

    if args.mode == 'pair-source':
        from PIL import ImageChops, ImageDraw
        if not c['pair'] or not args.pair:
            raise ValueError('Matching source state required.')
        a, b = read_png(args.input, 33554432), read_png(args.pair, 33554432)
        if c['key'].endswith('-open'):
            a, b = b, a
        if a.size != b.size or a.width != a.height:
            raise ValueError('State sources must share the same square canvas.')
        if a.getchannel('A').getbbox() != b.getchannel('A').getbbox():
            raise ValueError('State source outer bounds differ.')
        mask = ImageChops.lighter(a.getchannel('A'), b.getchannel('A')).point(lambda v: 255 if v else 0)
        if c['key'].startswith('door'):
            aperture = tuple(round(v*a.width/1024) for v in (256, 352, 768, 672))
            if b.getchannel('A').crop(aperture).getbbox():
                raise ValueError('Open door aperture must be transparent.')
            ImageDraw.Draw(mask).rectangle((aperture[0], aperture[1], aperture[2]-1, aperture[3]-1), fill=0)
        else:
            mask = a.getchannel('A').point(lambda v: 255 if v else 0)
        diff = ImageChops.difference(a, b)
        if any(ImageChops.multiply(diff.getchannel(channel), mask).getbbox() for channel in 'RGBA'):
            raise ValueError('Matching state frame pixels differ; use a registered pair.')
        print('Matching source frames verified.')
        return
    if args.mode == 'manifest':
        if args.input.suffix.lower() == '.svg':
            if not args.input.is_file() or args.input.stat().st_size > 1048576:
                raise ValueError(f'Missing/oversized manifest SVG: {args.input}')
            if ET.parse(args.input).getroot().tag != '{http://www.w3.org/2000/svg}svg':
                raise ValueError('Invalid SVG root.')
        else:
            validate(args.input)
            if c['pair']:
                # Production state pairs live together with canonical filenames.
                a, b = validate(args.input), validate(args.input.with_name(c['pair'] + '.png'))
                if a.getchannel('A').getbbox() != b.getchannel('A').getbbox():
                    raise ValueError('State-pair alpha bounds differ.')
        print(f"Manifest path OK: {c['key']}")
        return
    if args.mode == 'prepare':
        im = read_png(args.input, 33554432, remove=True)
        if c.get('preserveFrame') and im.width != im.height:
            raise ValueError('Room overlay source must retain its full square frame; split sheets before installation.')
        if c['opaque']:
            if im.width != im.height or im.getchannel('A').getextrema() != (255, 255):
                raise ValueError('Floor source must be square and fully opaque; no automatic cropping/stretching.')
        else:
            if c['pair']:
                if im.width != im.height:
                    raise ValueError('Door/Gate pair source must use the shared square canvas.')
                # Never independently trim or rescale a state-pair silhouette.
            else:
                if not im.getchannel('A').getbbox(): raise ValueError('Source is entirely transparent.')
        output = normalized_image(im, c)
        path = args.out or Path(c['out'])
        if path.resolve() == args.input.resolve():
            raise ValueError('Output must differ from source.')
        if path.name != c['runtimeFile']:
            raise ValueError(f"Output must be named {c['runtimeFile']}")
        if path.exists() and not args.overwrite:
            raise ValueError('Output exists; use --overwrite explicitly.')
        path.parent.mkdir(parents=True, exist_ok=True)
        # Rebuild pixel data to strip source text/EXIF/ICC metadata.
        clean = Image.frombytes('RGBA', output.size, output.tobytes())
        # Validate bytes before replacing an existing output.
        import io
        data = io.BytesIO()
        clean.save(data, format='PNG', compress_level=9, optimize=False)
        alpha = clean.getchannel('A')
        box = alpha.getbbox()
        if not c['opaque'] and (not box or box[0] < padding or box[1] < padding or box[2] > size[0]-padding or box[3] > size[1]-padding):
            raise ValueError('Pair source has insufficient transparent padding; provide a matching padded source canvas.')
        if len(data.getvalue()) > 1048576:
            raise ValueError('Runtime output exceeds 1 MiB.')
        path.write_bytes(data.getvalue())
        validate(path)
        print(f'Prepared {path} ({size[0]}x{size[1]})')
    else:
        path = args.input
        validate(path)
        print(f'Validated {path}')
    if c['pair']:
        partner = args.pair or path.with_name(c['pair'] + '.png')
        if not partner.is_file():
            if args.mode == 'prepare':
                print(f'PAIR PENDING: prepare {partner.name}, then validate the pair before ingestion.')
                return
            raise ValueError(f'Pair incomplete: provide {partner}; prepared file may exist but is not ready to ingest.')
        a, b = validate(path), validate(partner)
        # Dimensions/alpha bounds are objective checks; painted frame alignment
        # still needs visual review (equal bounds alone cannot prove it).
        if a.getchannel('A').getbbox() != b.getchannel('A').getbbox():
            raise ValueError('State-pair alpha bounds differ; outer frame/silhouette must align.')
        print('Pair dimensions, padding and alpha bounds match; visually verify frame pixels.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, ET.ParseError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)

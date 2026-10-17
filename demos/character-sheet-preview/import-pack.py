"""Build local-only preview data from purchased Spriter SCML and PNG files."""
import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET


def attributes(node):
    result = {}
    for key, value in node.attrib.items():
        try:
            result[key] = float(value) if '.' in value else int(value)
        except ValueError:
            result[key] = value
    return result


def import_character(source, pack):
    root = ET.parse(source).getroot()
    files = {}
    for folder in root.findall('folder'):
        for node in folder.findall('file'):
            data = attributes(node)
            path = (source.parent / node.get('name')).resolve()
            if not path.is_relative_to(pack) or not path.is_file():
                raise ValueError(f'Missing or unsafe part: {node.get("name")}')
            data['src'] = path.relative_to(pack).as_posix()
            files[f'{folder.get("id")}:{node.get("id")}'] = data
    entity = root.find('entity')
    animations = []
    for node in entity.findall('animation'):
        animation = attributes(node)
        animation['looping'] = node.get('looping', 'true') != 'false'
        animation['mainline'] = []
        for key in node.findall('mainline/key'):
            animation['mainline'].append({**attributes(key), 'bones': [attributes(r) for r in key.findall('bone_ref')],
                                         'objects': [attributes(r) for r in key.findall('object_ref')]})
        animation['timelines'] = {}
        for timeline in node.findall('timeline'):
            keys = []
            for key in timeline.findall('key'):
                if key.get('curve_type', 'linear') not in ('linear', 'instant'):
                    raise ValueError('Unsupported curve; preserve authored data rather than approximate it.')
                transform = key.find('bone') if timeline.get('object_type') == 'bone' else key.find('object')
                if transform is None:
                    raise ValueError('Unsupported timeline type')
                data = attributes(transform)
                if 'file' in data and f'{data.get("folder", 0)}:{data["file"]}' not in files:
                    raise ValueError('Timeline references unknown file')
                keys.append({**attributes(key), 'transform': data})
            animation['timelines'][timeline.get('id')] = {**attributes(timeline), 'keys': keys}
        # Original PNG animation exports are separate comparison assets.
        export_dir = source.parent.parent / 'PNG Animations' / source.stem.split('_')[0] / node.get('name')
        # The purchased Girl export folder has this literal spelling mismatch.
        if not export_dir.exists() and node.get('name') == 'Walk_firethrower':
            alternate = export_dir.with_name('Walk_FireThrhrower')
            if alternate.is_dir():
                export_dir = alternate
        animation['frames'] = [p.relative_to(pack).as_posix() for p in sorted(export_dir.glob('*.png'))]
        animations.append(animation)
    return {'name': source.stem.split('_')[0], 'files': files, 'animations': animations,
            'source': source.relative_to(pack).as_posix()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pack', type=Path, default=Path('artwork/zombie-tds-main-characters'))
    args = parser.parse_args()
    pack = args.pack.resolve()
    sources = sorted(pack.rglob('*.scml'))
    if not sources:
        raise ValueError('No SCML files found in purchased pack.')
    data = {'format': 'local-spriter-preview-v1', 'characters': [import_character(p, pack) for p in sources]}
    path = pack/'preview-data.json'
    temp = path.with_suffix('.json.tmp')
    temp.write_text(json.dumps(data, separators=(',', ':'))+'\n', encoding='utf8')
    temp.replace(path)
    print(f'Imported {len(sources)} characters; {sum(len(c["animations"]) for c in data["characters"])} authored animations. Local data: {path}')


if __name__ == '__main__':
    main()

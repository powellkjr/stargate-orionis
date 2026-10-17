"""Read-only pixel matching of legacy installations to canonical saved sources."""
import hashlib, importlib.util, json, sys
from pathlib import Path
from PIL import Image
spec=importlib.util.spec_from_file_location('prep',Path(__file__).parent.parent/'offworld-sandbox/prepare-sprite.py')
prep=importlib.util.module_from_spec(spec);spec.loader.exec_module(prep)
job=json.loads(sys.stdin.read());found={}
def fingerprint(im): return hashlib.sha256(im.tobytes()).hexdigest()
for entry in job['sources']:
    try:
        path=Path(entry['path'])
        if path.stat().st_size>33554432: continue
        with Image.open(path) as im:
            if im.format!='PNG' or im.width*im.height>16000000: continue
            im=im.convert('RGBA');out=prep.normalized_image(im,job['assets'][entry['key']])
            found.setdefault((entry['key'],fingerprint(out)),[]).append(entry['id'])
    except (ValueError,OSError): pass
matches=[]
for entry in job['installed']:
    try:
        path=Path(entry['path'])
        if path.stat().st_size>1048576: continue
        with Image.open(path) as im:
            if im.format!='PNG' or im.mode!='RGBA' or list(im.size)!=job['assets'][entry['key']]['runtimePixels']: continue
            ids=found.get((entry['key'],fingerprint(im)),[])
            if ids: matches.append(dict(entry,sourceId=ids[0]))
    except (ValueError,OSError): pass
print(json.dumps(matches))

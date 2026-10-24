import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {roomKitGeometry,roomKitRegistrationGuide} from '../shared/sprites/room-kit-prompts.mjs';
import {layerPieces,layerFamilies,layerName,furnitureRects,roomLayerPrompt} from '../shared/sprites/room-layer-contract.mjs';
const [flag,out,...rest]=process.argv.slice(2);
if(flag!=='--out'||!out||rest.length)throw Error('Usage: node demos/room-sandbox/export-room-layers.mjs --out <fresh-directory>');
const root=resolve(out);
if(existsSync(root))throw Error('Choose a fresh output directory');
mkdirSync(root,{recursive:true});
const write=(name,text)=>writeFileSync(resolve(root,name),text,{encoding:'utf8',flag:'wx'});
for(const layer of ['structure','furniture'])for(const family of Object.keys(layerFamilies))for(const piece of layerPieces){
 write(`${layerName(layer,piece,family).replace('__source.png','')}-prompt.txt`,roomLayerPrompt(layer,piece,family));
}
write('registration-guide.svg',roomKitRegistrationGuide);
write('layer-registration-guide.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><rect width="1024" height="1024" fill="#eef2f4"/><path d="M0 48H384M640 48H1024M48 0V1024" fill="none" stroke="#7a8b98" stroke-width="96"/><g fill="#71bd8c" fill-opacity=".65">${[...furnitureRects.corner,...furnitureRects['edge-normal'],...furnitureRects['edge-door']].map(([x,y,w,h])=>`<rect x="${x*8}" y="${y*8}" width="${w*8}" height="${h*8}"/>`).join('')}</g><rect x="384" y="0" width="256" height="256" fill="none" stroke="#b74c4c" stroke-width="3"/><circle cx="512" cy="512" r="8" fill="#b74c4c"/><g font-family="sans-serif" font-size="22" fill="#15212a"><text x="180" y="430">GRAY: reusable structure only (channel omitted in diagram)</text><text x="180" y="480">GREEN: furniture masks; role-specific alternatives overlap</text><text x="180" y="560">RED: clear door passage / full-cell pivot</text><text x="180" y="620">Full 1024-square source. Source units = logical units x8.</text><text x="180" y="700">Structure and furniture are SEPARATE transparent files.</text><text x="180" y="760">No floor, background, labels or guide colors in either layer.</text></g></svg>\n`);
write('layers.json',JSON.stringify({version:'room-layers-study-v1',geometry:roomKitGeometry,furnitureRects,layers:Object.fromEntries(['structure','furniture'].map(layer=>[layer,Object.fromEntries(Object.keys(layerFamilies).map(f=>[f,Object.fromEntries(layerPieces.map(p=>[p,layerName(layer,p,f)]))]))]))},null,2)+'\n');
write('README.md',`# Shared walls + Infirmary furniture trial

Three reusable architectural families: v01 angular, v02 rounded, v03 utilitarian.
There are 12 shared-wall prompts (four pieces per family), followed by 12 separate
Infirmary furniture prompts. Generate one image per prompt. No empty CENTER or
EDGE_OPEN files are required for this trial: the renderer draws no layer there.

Every prompt starts AND ends with a mandatory clickable-download instruction
and the exact PNG filename. Require an actual attached PNG/download link from
the image generator, not just an inline preview or a filename written as text.

## Generate in this order

1. Start with shared-wall-corner__v01-prompt.txt. Attach both SVG guides and the
   architectural reference illustration. Approve its exact NW L and seam exits.
2. Generate that family's EDGE_NORMAL, SHARED and EDGE_DOOR with the approved
   corner attached. No room furnishings belong in ANY shared-wall image.
3. Repeat for v02/v03. These are architecture families, independent of room type
   and CT. Keep identical masks, channels and opening in all three.
4. Then generate the four infirmary-furniture prompts for one matching family.
   Attach its approved walls for scale/material reference, but generate furniture
   ONLY. Empty medical beds/cots and closed supply cases are the current subject.
5. Repeat furniture for the remaining families to compare their finishes.

The existing Material Storage leaf images can be used as an explicitly labeled
shared-door comparison in this preview; they are not evidence of a matching new
architectural finish. New door styles may need their own leaf art later.

## Preview and import

Open /demos/room-sandbox/room-kit.html and select **Shared walls + Infirmary**.
Use **Load shared walls** and **Load Infirmary furniture** independently. Each
import needs all four named pieces for at least one complete family. Pickers
validate architecture/furniture masks, not just overall alpha bounds. Family
selectors are independent so you can compare reuse; no per-piece mixing occurs.
Use the furniture visibility checkbox for wall-only review. Missing layers use
clearly labeled schematic placeholders, never generated/approved artwork.

All sources are full 1024-square RGBA, with pivot (512,512). Structure occupies
only the 12-unit wall bands, excluding the 5-unit channel and doorway. Furniture
uses the exact rectangles in layers.json; it cannot cover wall bands, seams or
door openings. See the guides; their colors/labels are not output artwork.

Layer order: floor → channel backing → shared structure → furniture → door
leaves / CT lights → guides and interaction controls. One cell remains one
physical child; no gameplay rooms, Services, capacity or save data changes.

This is a new presentation trial alongside the existing combined-room preview.
No existing downloaded originals, historical prompts or production art are replaced.
Clinical reach, circulation and furniture dimensions are illustrative; no medical
capability or canonical equipment is implied by the art.
`);
console.log(`Exported 24 layer prompts, two guides and registration metadata: ${root}`);

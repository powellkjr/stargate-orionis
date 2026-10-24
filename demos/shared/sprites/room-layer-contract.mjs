// Optional art study. These are presentation masks, not gameplay dimensions.
import {roomKitVariants,downloadDelivery} from './room-kit-prompts.mjs';
export const layerPieces=['corner','shared','edge-normal','edge-door'];
export const layerFamilies=roomKitVariants;
export const layerName=(layer,piece,family)=>`${layer==='structure'?'shared-wall':'infirmary-furniture'}-${piece}__${family}__source.png`;
export const furnitureRects={
 corner:[[14,14,16,16]],shared:[[14,14,16,16]],
 'edge-normal':[[34,14,60,16]],'edge-door':[[34,14,12,16],[82,14,12,16]]
};
const inside=(x,y,[a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h;
export function layerPixelAllowed(layer,piece,x,y){
 if(layer==='furniture')return (furnitureRects[piece]??[]).some(r=>inside(x,y,r));
 if(layer!=='structure'||!layerPieces.includes(piece))return false;
 const north=piece==='corner'||piece==='shared'?[0,0,32,12]:[32,0,64,12];
 const wall=inside(x,y,north)||(piece==='corner'&&inside(x,y,[0,0,12,32]));
 const channel=(inside(x,y,north)&&y>=4&&y<9)||(piece==='corner'&&x>=4&&x<9&&y<32);
 const doorway=piece==='edge-door'&&x>=48&&x<80;
 return wall&&!channel&&!doorway;
}

const wallRoles={
 corner:'Exactly one NW L-turn: north arm x=0..32,y=0..12 and west arm x=0..12,y=0..32. Source arms x=0..256,y=0..96 and x=0..96,y=0..256. NW vertex at (0,0); open interior points southeast. Exactly TWO arms, no third/fourth wall or isolated post. North exits flush at x=32; west exits flush at y=32. Both seam sockets retain the full 12-unit wall cross-section except the specified alpha channel. No end caps, taper or rounded cuts at these exits. This corner occupies at most the TOP-LEFT 256-square region, ONE SIXTEENTH of the full canvas; never center, enlarge, mirror or crop it.',
 shared:'Only a north wall x=0..32,y=0..12. West is an open internal join: no west wall or end post. Same cross-section as the ordinary wall at both ends. It must tolerate diagonal reflection (x,y)->(y,x), then full-cell cardinal rotation.',
 'edge-normal':'One north wall x=32..96,y=0..12. Straight identical seam sockets at x=32 and x=96. No furniture, room interior or extra walls.',
 'edge-door':'North wall in x=32..48 and x=80..96,y=0..12. These are the fixed frame sides. Entire passage x=48..80,y=0..32 stays alpha 0. No leaf, bridge, header, threshold or shadow across it. Moving leaves are a separate layer.'
};
const furnitureRoles={
 corner:'One compact closed medical supply case in x=14..30,y=14..30. No bed forced into this small slot.',
 shared:'One compact closed medical supply case in x=14..30,y=14..30; keep open joins clear and make it diagonal-reflection-safe.',
 'edge-normal':'A recognizable empty medical cot/bed and a separate compact closed medical supply case, arranged side-by-side along the perimeter inside x=34..94,y=14..30. Put the bed length along the wall, not across the room. No patient, loose tools or wall-mounted device.',
 'edge-door':'Compact closed medical supply cases confined to the two side areas x=34..46,y=14..30 and x=82..94,y=14..30. Entire doorway x=48..80,y=0..32 remains clear; no bed across the passage.'
};
export function roomLayerPrompt(layer,piece,family){
 if(!['structure','furniture'].includes(layer)||!layerPieces.includes(piece)||!Object.hasOwn(layerFamilies,family))throw Error('Unknown layer, piece or family');
 const structure=layer==='structure';
 return `${downloadDelivery(layerName(layer,piece,family))}

Generate ONE registered ${structure?'SHARED ARCHITECTURE ONLY':'INFIRMARY FURNITURE ONLY'} overlay, ${piece}, ${family} (${layerFamilies[family]}).

DELIVERY: 1024 x 1024 true RGBA PNG, full-cell registration, 8 source pixels per logical unit. Coordinates below are logical units; multiply ALL coordinates by 8 for source pixels. Origin NW, x east, y south. Full cell 128-square; rotation pivot (64,64), source (512,512). No crop, recenter, enlargement, padding, sheet, background, checkerboard, floor, labels or UI. Empty pixels are alpha 0.

LAYER OWNERSHIP: ${structure?'This architecture is reusable by EVERY room type. Generate ONLY wall material inside the wall masks, never a room-specific furnishing, bed, conveyor, rack, inspection station or floor. Corner interior x>=12 AND y>=12 is transparent.':'Generate ONLY the empty medical cot and/or CLOSED medical supply cases specified for this role. No wall, corner armor, door frame, leaf, lights, floor or architectural trim. All wall bands and channels stay transparent. These are decorative silhouettes, not personnel, configured Services, clinical findings or new game rules.'}

ROLE / EXACT MASK: ${structure?wallRoles[piece]:furnitureRoles[piece]}

${structure?'WALL CONTRACT: 12 units deep, with alpha-0 north channel y=4..9 and (CORNER only) west channel x=4..9. Source depth 96 px; source channel 32..72 px. At a corner subtract the UNION of both channel strips, including their intersection. Never bake light colors or CT identifiers; viewer supplies channel backing and lights. Style differences affect neutral materials and restrained bevels only, never mask, seam, thickness or door clearance. Pale neutral outer armor and graphite panels, matching the reference.':'FURNITURE CONTRACT: allowed rectangles are '+JSON.stringify(furnitureRects[piece])+' in [x,y,width,height] format. Every pixel outside those rectangles is alpha 0, including all cast shadows. Minimum 2-unit clearance from wall-depth boundary and adjacent module seams is already included in these masks. Do not extend a bed across a module boundary. No furniture in CENTER or EDGE_OPEN; those are omitted layers, not new assets.'}

CAMERA: strict 90-degree orthographic overhead. Tops only, no perspective, vertical front faces, isometric turns or directional cast shadows. Restrained shading, readable at 128-pixel full-cell scale. ${family==='v01'?'Precise angular forms and straight panel seams.':family==='v02'?'Soft local bevels and rounded details; preserve every exact structural mask and seam.':'Chunky utilitarian panels; preserve every exact structural mask and seam.'}

REFERENCE ATTACHMENTS: registration-guide.svg and layer-registration-guide.svg are diagrams ONLY. Never paint their background, colors, grid or labels. ${structure?'Generate and approve shared-wall-corner__'+family+'__source.png FIRST, then attach it for every other architecture piece in this family. Do not copy furniture from an old combined room tile.':'Attach approved shared-wall-corner__'+family+'__source.png and shared-wall-edge-normal__'+family+'__source.png to match scale/materials, but DO NOT redraw any wall pixels. Generate this furniture as a separately composited transparent overlay.'} Match the SAME family throughout; never mix v01/v02/v03 within one layer.

FINAL ACCEPTANCE: full 1024-square RGBA; canonical orientation; exact masks only; all other pixels alpha 0; no unwanted layer content. ${piece==='corner'&&structure?'One NW L, two wall arms, two intact seam exits. No miniature room, U-shaped enclosure, freestanding post or centered corner. ':''}Correct any failed condition before delivering.

Save as ${layerName(layer,piece,family)}.

${downloadDelivery(layerName(layer,piece,family))}
`;
}

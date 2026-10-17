// Presentation art registration only; not gameplay room definitions or active assets.
import {roomSprites} from './room-sprite-requirements.mjs';

export const roomKitPieces=Object.freeze(['center','corner','shared','edge-normal','edge-door','edge-open']);
export const roomKitVariants=Object.freeze({v01:'clean angular',v02:'soft rounded',v03:'chunky utilitarian'});
export const roomKitGeometry=Object.freeze({
 version:'room-kit-v1',sourceSize:[1024,1024],runtimeSize:[128,128],cellUnits:128,
 bands:[32,64,32],pivot:[64,64],sourcePixelsPerUnit:8,
 // Rectangles are [x,y,width,height], in cell units. All masters retain the full cell.
 rectangles:{center:[32,32,64,64],corner:[0,0,32,32],shared:[0,0,32,32],
  'edge-normal':[32,0,64,32],'edge-door':[32,0,64,32],'edge-open':[32,0,64,32]},
 orientations:{center:'north up',corner:'northwest; north and west perimeter',
  shared:'northwest; north perimeter, west open',
  'edge-normal':'north edge','edge-door':'north edge','edge-open':'north edge'},
 wallDepth:12,slotInset:4,slotThickness:5,slotPeriod:24,
 doorOpening:[48,0,32,32],seamSockets:{north:[0,12],west:[12,0]},
 ctPatterns:{CT1:{color:'amber',runs:[8,8,8]},CT2:{color:'blue',runs:[4,6,4,6,4]},CT3:{color:'purple',runs:[4,16,4]}}
});

const roles={
 center:'Keep the center entirely transparent and free of furnishings in v1. The continuous base floor and separate central props are rendered underneath/above this module. Do not invent machinery, walls or a doorway.',
 corner:'Two neutral perimeter wall runs meet at the northwest corner. North wall occupies y=0..12 and west wall x=0..12, within this corner rectangle. Their transparent running channels meet as an L: y=4..9 across x=0..32, plus x=4..9 across y=0..32. Sparse fixed corner furnishings may occupy the remaining inset area, fully contained. No extension into either neighboring EDGE slot.',
 shared:'Only the north perimeter wall remains, y=0..12 across x=0..32, with transparent channel y=4..9. The west side is an internal open join: no west wall, corner post or blocking equipment. North perimeter continues flush across the west cell boundary. Restrained furnishings terminate inside the module; leave the open-side approach clear. Design must tolerate diagonal reflection (x,y) -> (y,x) to serve west-perimeter/north-open handedness, then cardinal rotation; no extra paired SHARED source.',
 'edge-normal':'North perimeter wall occupies y=0..12 across x=32..96, with transparent running channel y=4..9. Sparse public fixed perimeter furnishings stay in y=12..32, x=32..96. At x=32 and x=96 the wall cross-section is identical. Furniture never crosses the module seam.',
 'edge-door':'North perimeter has a centered clear 32-unit access opening at x=48..80 through y=0..32 (source pixels x=384..640, y=0..256). Keep this entire opening alpha 0: no door leaf, overhead bridge, threshold, furniture or shadow. Identical opening width across v01/v02/v03. Wall/frame sides stay within x=32..48 and x=80..96, wall y=0..12 with channel y=4..9 on surviving wall runs. This module owns static frame sides; any future runtime closed/open leaf is separate and must not add a second frame. Same slot footprint as EDGE_NORMAL and EDGE_OPEN.',
 'edge-open':'A joined-room boundary, not a doorway. Keep the entire module transparent and unobstructed in v1: no wall, doorway, frame, post, threshold, furniture or floor. The base floor continues beneath it. Its footprint still matches EDGE_NORMAL and EDGE_DOOR.'
};

export const roomKitCatalog=Object.freeze(Object.fromEntries(Object.entries(roomSprites).map(([id,room])=>{
 const kitId=id.replaceAll('_','-');
 // Preserve the Cultural Platform's authored exclusions without its legacy overlay layout instruction.
 const subject=id==='cultural_platform'
  ? 'Neutral fixed seating and table forms confined to exterior perimeter modules. No central table, chairs or planters; no cultural symbols, artifacts, exhibits or readable text. One continuous open center across the 2×2 footprint; no cultural bonuses or new Core capabilities.'
  : room.subject??`Sparse decorative built-in furnishings appropriate to ${id.replaceAll('_',' ')}${room.props.filter(p=>!['gate','gate-open','crate','medical','security'].includes(p)).length?`: ${room.props.filter(p=>!['gate','gate-open','crate','medical','security'].includes(p)).join(', ')}`:''}. These categories are public decorative art, not configured capabilities.`;
 return [kitId,{kitId,subject}];
})));

export function roomKitPrompt(kitId,piece,variant){
 const kit=roomKitCatalog[kitId];
 if(!kit||!roomKitPieces.includes(piece)||!Object.hasOwn(roomKitVariants,variant))throw Error('Unknown room kit, semantic piece or variant');
 const rect=roomKitGeometry.rectangles[piece],sourceRect=rect.map(n=>n*8);
 return `Generate ONE registered semantic module for Stargate Orionis room visual kit "${kitId}", coordinated family ${variant} (${roomKitVariants[variant]}), semantic role ${piece.toUpperCase().replaceAll('-','_')}.

SUBJECT: ${kit.subject} Apply subject furnishings only where the semantic role permits them; CENTER and EDGE_OPEN are intentionally empty registration assets, to be created deterministically rather than sent for image generation.

DELIVERY: one single-frame 1024 x 1024 true RGBA lossless PNG, ordinary sRGB. No sheet, labels, UI, text, watermark, painted checkerboard or solid backdrop. All pixels outside this module's registered rectangle and all empty ground are alpha 0. No floor: a continuous separate base floor fills every cell, including open corner conditions. Preserve this entire source frame: no crop, recenter, stretch or added padding. Planned runtime frame is 128 x 128, uniform scale 1/8; runtime adoption is pending.

REGISTRATION ${roomKitGeometry.version}: full cell coordinates x=0..128, y=0..128, origin at northwest, x east, y south. Source scale exactly 8 pixels per unit. Grid bands are 32 / 64 / 32 on both axes. This piece's allowed rectangle [x,y,width,height] is [${rect.join(',')}], source pixels [${sourceRect.join(',')}]; right/bottom limits are exclusive. Canonical orientation: ${roomKitGeometry.orientations[piece]}. Rotate the full frame around cell pivot (64,64), source pivot (512,512), never around visible alpha bounds. Cardinal rotations only; SHARED additionally permits the documented diagonal reflection. Every variant preserves identical geometry, socket positions, opening and pivot.

ROLE: ${roles[piece]}

WALL/CT CONTRACT: neutral light-gray matte wall body, 12 units deep (96 source pixels). Surviving perimeter wall has a true alpha-0 channel 5 units thick, inset 4 units: canonical north channel y=4..9 (source y=32..72); west channel x=4..9. The 5 x 24 running-slot treatment means a 24-unit repeating underlay pattern clipped through this continuous 5-unit channel, not a new colored wall sprite. CT1: 8 wall-color / 8 amber / 8 wall-color. CT2: 4 wall-color / 6 blue / 4 wall-color / 6 blue / 4 wall-color. CT3: 4 wall-color / 16 purple / 4 wall-color. Every run totals 24. Do NOT bake any tier colors into the PNG. Underlay phase continues along the room perimeter across module seams; a door interrupts visible wall/channel, but phase resumes on its other side. No underlay across an open join or clear access opening. No separate CT wall models, broad recolor mask or door-top/door-bottom light variants.

SEAMS: shared architecture socket at north-edge seams is the identical y=0..12 neutral wall cross-section with y=4..9 transparent channel; west seams use its transpose. Keep furniture inset at least 2 units from module seams. No rack, conveyor, pipe, machine or cast shadow crosses this module rectangle. Fixed furnishing forms may differ by family but never require a neighbor to finish a functional object. Corner turns are self-contained; door furnishings stop before the opening; open/shared joins remain clear. Use rotation-tolerant local shading, no directional cast shadows, baked neon glow or bright edge highlights.

CAMERA: strict orthographic direct overhead at 90 degrees, north up. Tops only, no vertical front faces, isometric view, perspective or diorama.

VISUAL REFERENCE: the user's CT1/CT2/CT3 room-and-tiles illustration shows the desired modular architectural language: pale neutral corner armor, dark graphite inset wall panels, restrained bevels and readable chunky seams. Use that material/form relationship with restrained overhead shading. Its one short amber opening, two blue openings and one long purple opening guide the future underlay only; source channels remain transparent, with no colored lights or glow baked into them. The illustrated OPEN wall-end treatment corresponds to SHARED, not the fully clear EDGE_OPEN cell join. Its room sizes are illustrative, not tied to construction tier. Do not copy its headings, floor grates, perspective, baked shadows or different tier geometry into these modules.

COORDINATION: attach the approved same-kit ${variant} module sources and registration-guide.svg when generating subsequent pieces. Match neutral materials, wall cross-section and scale to that family. The three complete families are ${Object.entries(roomKitVariants).map(([id,style])=>`${id} ${style}`).join('; ')}. Six pieces x three families = 18 source assets. Never independently randomize pieces or mix families inside a Stage. Do not change camera, dimensions, doors, seams, slot registration or clearance between families. Public fixed details only: no people, movable crates, loose tools, Gate/portal, readable screens, hidden contents, scientific findings or separate mission instances. No new gameplay equipment or rules for variety.

Save as ${kitId}-${piece}__${variant}__source.png. Three-variant packaging: after all six pieces in all three families have been reviewed, package exactly 18 source PNGs under orionis-room-kit-${kitId}-b001/ in orionis-room-kit-${kitId}-b001.zip (increment bNNN for later batches). No preview, guide, metadata or prompt inside the ZIP. Current viewer/ordinary ZIP installation does not yet support complete kits; do not install these as unrelated sprites.
`;
}

export function roomKitMetadata(kitIds){
 return {geometry:roomKitGeometry,kits:kitIds.map(kitId=>{
  if(!roomKitCatalog[kitId])throw Error(`Unknown room kit: ${kitId}`);
  return {kitId,subject:roomKitCatalog[kitId].subject,variants:Object.fromEntries(Object.keys(roomKitVariants).map(variant=>[variant,
   Object.fromEntries(roomKitPieces.map(piece=>[piece,`${kitId}-${piece}__${variant}__source.png`]))]))};
 })};
}

export function roomKitPromptEntries(kitIds){
 return kitIds.flatMap(kitId=>Object.keys(roomKitVariants).flatMap(variant=>roomKitPieces.map(piece=>({
  file:`${kitId}-${piece}-${variant}-prompt.txt`,text:roomKitPrompt(kitId,piece,variant)
 }))));
}

// A measured source-frame diagram, not generated or installable game art.
export const roomKitRegistrationGuide=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<rect width="1024" height="1024" fill="#f0f0f0"/>
<path d="M256 0V1024M768 0V1024M0 256H1024M0 768H1024" fill="none" stroke="#555" stroke-width="3"/>
<path d="M0 48H384M640 48H1024M48 0V1024" stroke="#8f8f8f" stroke-width="96" fill="none"/>
<path d="M0 52H384M640 52H1024M52 0V1024" stroke="#cf65c5" stroke-width="40" fill="none"/>
<rect x="384" y="0" width="256" height="256" fill="#9de0c1" fill-opacity=".65"/>
<circle cx="512" cy="512" r="8" fill="#c33"/>
<g font-family="sans-serif" font-size="22" fill="#222"><text x="110" y="210">CORNER / SHARED</text><text x="395" y="225">NORTH EDGE</text><text x="430" y="500">CENTER</text><text x="350" y="560">pivot 512,512</text><text x="320" y="930">Guide only; never bake into source art</text></g>
</svg>\n`;

export function roomKitChecklist(kitIds){
 return `# Registered modular room-kit prompts — provisional v1

Catalog selection, not an outstanding-art or installation checklist. ${kitIds.length} existing base-room kits; 18 requests/assets per kit. Use these prompts for new modular room art. Legacy room-tile-prompts and outstanding-prompts still target installed full-room overlay keys; do not substitute modules into those keys. Offworld archetype kit mappings are a later step, especially outdoor Gate areas, whose no-wall presentation needs a separate decision.

Geometry is in room-kits.json; registration-guide.svg is a measured guide only. Each PNG has a full 1024-square cell frame, 128-square planned runtime frame, 32/64/32 grid and pivot (512,512). All modules are transparent overlays above a separate base floor. CT2 is 4/6/4/6/4; CT3 is 4/16/4; all tiers repeat every 24 units through a 5-unit channel.

Attach the user's CT tier illustration as a material/form reference: pale corner armor and dark inset wall panels; one short amber, two blue, one long purple opening. Keep lighting restrained, source slots transparent and topology/geometry identical across CT. Illustrated OPEN ends map to SHARED, not EDGE_OPEN. Room size remains independent of CT.

For each family generate CORNER first, review its wall/channel registration, then attach that source and guide for SHARED and EDGE pieces. CENTER and EDGE_OPEN are deliberately fully transparent in v1: create their empty 1024-square RGBA sources deterministically with Pillow, not image generation. All 18 named source files, including these empty members, belong in each kit ZIP. Metadata describes expected source paths, not generated files. Review seams/alpha and assemble sample 1×1, 1×2 and 2×2 layouts before accepting a family.

No final art was generated or installed. Registered kit resizing, complete-family ZIP ingestion, Stage-wide deterministic selection, exact Transition edge binding and renderer composition are still pending. Ordinary crop/recenter, sheet split and independent per-key installation are unsuitable. SHARED permits diagonal reflection plus rotation to cover both handed arrangements. EDGE_DOOR owns static frame sides; runtime leaf art will be separate.

${roomKitPromptEntries(kitIds).map(entry=>`- [ ] ${entry.file}`).join('\n')}

Export another selection to a fresh folder (repeat --kit as needed):

\`\`\`bash
node demos/offworld-sandbox/prepare-sprite.mjs room-kit-prompts --kit receiving --kit material-storage --out artwork/room-kit-prompts-next
\`\`\`

Omit --kit to export all ${Object.keys(roomKitCatalog).length} supported base-room catalog kits. Existing prompt files cannot be overwritten.
`;
}

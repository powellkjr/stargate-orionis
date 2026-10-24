// Presentation art registration only; not gameplay room definitions or active assets.
import {roomSprites} from './room-sprite-requirements.mjs';

export const roomKitPieces=Object.freeze(['center','corner','shared','edge-normal','edge-door','edge-open']);
export const roomKitVariants=Object.freeze({v01:'clean angular',v02:'soft rounded',v03:'chunky utilitarian'});
export const downloadDelivery=(filename)=>`MANDATORY DELIVERY: Provide a CLICKABLE DOWNLOAD LINK to the actual PNG file named EXACTLY ${filename}. The download link and exact filename are REQUIRED. An inline image, preview, code block, written filename or statement that the file was saved is NOT sufficient. Attach/export the PNG and include its real clickable download link; do not invent a link or claim delivery without an attached file.`;
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
 corner:'Exactly TWO perpendicular exterior wall runs meet at the NORTHWEST outer corner, opening toward the SOUTHEAST interior. North wall is x=0..32, y=0..12 (source x=0..256, y=0..96); west wall is x=0..12, y=0..32 (source x=0..96, y=0..256). Their union is one connected 90-degree L-shaped architectural turn BEFORE subtracting the required transparent channels. Channels are y=4..9 across x=0..32 and x=4..9 across y=0..32 (source y=32..72 and x=32..72 respectively); keep that entire L-shaped channel alpha 0. At the EAST seam x=32/source x=256, only the north wall cross-section continues; at the SOUTH seam y=32/source y=256, only the west wall cross-section continues. Both exits must meet the same-family EDGE_NORMAL cross-section without taper, end cap, gap or offset. Do not add a south wall, east wall, diagonal wall, rounded cutaway that removes a seam socket, isolated pillar, closed square enclosure or extra corner. Sparse fixed furnishings may occupy the inner area x=12..32, y=12..32 only, respecting the 2-unit furniture setback from seams. Furniture cannot replace either wall leg, obstruct either channel or extend into neighboring EDGE slots.',
 shared:'Only the north perimeter wall remains, y=0..12 across x=0..32, with transparent channel y=4..9. The west side is an internal open join: no west wall, corner post or blocking equipment. North perimeter continues flush across the west cell boundary. Restrained furnishings terminate inside the module; leave the open-side approach clear. Design must tolerate diagonal reflection (x,y) -> (y,x) to serve west-perimeter/north-open handedness, then cardinal rotation; no extra paired SHARED source.',
 'edge-normal':'North perimeter wall occupies y=0..12 across x=32..96, with transparent running channel y=4..9. Sparse public fixed perimeter furnishings stay in y=12..32, x=32..96. At x=32 and x=96 the wall cross-section is identical. Furniture never crosses the module seam.',
 'edge-door':'North perimeter has a centered clear 32-unit access opening at x=48..80 through y=0..32 (source pixels x=384..640, y=0..256). Keep this entire opening alpha 0: no door leaf, overhead bridge, threshold, furniture or shadow. Identical opening width across v01/v02/v03. Wall/frame sides stay within x=32..48 and x=80..96, wall y=0..12 with channel y=4..9 on surviving wall runs. This module owns static frame sides; any future runtime closed/open leaf is separate and must not add a second frame. Same slot footprint as EDGE_NORMAL and EDGE_OPEN.',
 'edge-open':'A joined-room boundary, not a doorway. Keep the entire module transparent and unobstructed in v1: no wall, doorway, frame, post, threshold, furniture or floor. The base floor continues beneath it. Its footprint still matches EDGE_NORMAL and EDGE_DOOR.'
};

export const roomKitCatalog=Object.freeze(Object.fromEntries(Object.entries(roomSprites).map(([id,room])=>{
 const kitId=id.replaceAll('_','-');
 // Preserve the Cultural Platform's authored exclusions without its legacy overlay layout instruction.
 const subject=id==='receiving'
  ? 'Receiving perimeter furnishings: short self-contained CONVEYORS / roller-belt intake sections and compact INSPECTION STATIONS / inspection workbenches along the inside of exterior walls. These are required recognizable visual subjects, not generic storage racks. Arrange conveyor sections and inspection stations around the room PERIMETER only; leave the center, internal joins and door passage clear. No loose cargo or movable crates. Decorative presentation only: no new configured Services, equipment instances or deep Analysis capability is granted.'
  : id==='cultural_platform'
  ? 'Neutral fixed seating and table forms confined to exterior perimeter modules. No central table, chairs or planters; no cultural symbols, artifacts, exhibits or readable text. One continuous open center across the 2×2 footprint; no cultural bonuses or new Core capabilities.'
  : room.subject??`Sparse decorative built-in furnishings appropriate to ${id.replaceAll('_',' ')}${room.props.filter(p=>!['gate','gate-open','crate','medical','security'].includes(p)).length?`: ${room.props.filter(p=>!['gate','gate-open','crate','medical','security'].includes(p)).join(', ')}`:''}. These categories are public decorative art, not configured capabilities.`;
 return [kitId,{kitId,subject}];
})));

export function roomKitPrompt(kitId,piece,variant){
 const kit=roomKitCatalog[kitId];
 if(!kit||!roomKitPieces.includes(piece)||!Object.hasOwn(roomKitVariants,variant))throw Error('Unknown room kit, semantic piece or variant');
 const rect=roomKitGeometry.rectangles[piece],sourceRect=rect.map(n=>n*8);
 const cornerLock=piece==='corner'?`
CORNER GEOMETRY — HARD ACCEPTANCE GATES, BEFORE DECORATION:
1. Deliver a FULL 1024 x 1024 RGBA canvas. Artwork belongs ONLY in the TOP-LEFT 256 x 256 source-pixel rectangle: x=0..255, y=0..255. That is one SIXTEENTH of the canvas, NOT a 512-square quadrant. The other 15/16 MUST be alpha 0. Do not enlarge the corner to fill the canvas, put it in the center, crop to 256 x 256, or deliver a whole room.
2. The outer corner vertex is at source (0,0), NOT at the cell-center pivot (512,512). The north arm runs RIGHT along the top edge; the west arm runs DOWN along the left edge. The room interior is to the LOWER RIGHT. Do not mirror, rotate or relocate this canonical NW source. Rotation happens later around the FULL-CELL pivot.
3. Draw the TWO wall arms specified in ROLE, with identical 96-source-pixel depth and the exact alpha-0 channel. Preserve their east/south continuation sockets. No door, no third/fourth wall, no freestanding corner post, no miniature room, no U-shaped frame, no diagonal/isometric corner or raised front faces. A rounded style may soften local bevels ONLY; it cannot change these coordinates or remove wall material at the seam exits.
4. Geometry and registration outrank subject furniture. Build the correct L first, then put restrained furnishings in its permitted inner area. Never replace the wall turn with a conveyor turn or inspection machine. Furnishings must remain self-contained, with no cut-off conveyor or dangling equipment crossing a source boundary.
5. FINAL CHECK BEFORE DELIVERY: exactly one NW L-turn; both wall legs reach their own seam; channel is transparent; outside x=0..256,y=0..256 is transparent; no floor/background; canvas remains 1024-square. Reject and correct any failed condition before delivering.
`:'';
 const receivingPlacement=kitId==='receiving'?`
RECEIVING PERIMETER PLACEMENT: ${piece==='edge-normal'
  ? 'Include BOTH a short recognizable roller/belt conveyor section AND a compact inspection station/workbench along the INSIDE of the north wall, in x=32..96, y=12..32. Keep them as separate self-contained top-down units with finished ends; respect 2-unit furniture seam setbacks. Do not substitute rows of generic cabinets or storage crates. No conveyor or station may cross either side seam, cover the wall/channel, or enter CENTER.'
  : piece==='corner'
   ? 'Use the remaining inner corner area for a compact perimeter inspection pad/workstation detail, with a short conveyor/roller detail only if it fits without crowding. The full kit must visibly read as perimeter conveyors plus inspection stations; both do not have to be forced into this small corner. The TWO wall arms and empty light channels remain mandatory and take priority. Do not create a conveyor elbow spanning into adjoining modules.'
   : piece==='shared'
    ? 'Terminate a compact perimeter conveyor OR inspection-station detail behind the surviving north wall, inside this module, with a finished end. Keep the west open join and its approach unobstructed. No conveyor links across the module boundary.'
    : piece==='edge-door'
     ? 'Perimeter conveyor/inspection details may fit ONLY on the left/right frame-side inset areas, with finished ends and furniture seam setbacks. Leave x=48..80,y=0..32 completely alpha 0. If the side areas are too small, omit furnishings here; never squeeze equipment into the passage.'
     : 'The perimeter conveyors and inspection stations belong to CORNER/SHARED/EDGE_NORMAL/EDGE_DOOR where permitted. This CENTER or EDGE_OPEN source remains ENTIRELY TRANSPARENT: no equipment, walls or floor.'}
`:'';
 return `${downloadDelivery(`${kitId}-${piece}__${variant}__source.png`)}

Generate ONE registered semantic module for Stargate Orionis room visual kit "${kitId}", coordinated family ${variant} (${roomKitVariants[variant]}), semantic role ${piece.toUpperCase().replaceAll('-','_')}.
${cornerLock}

SUBJECT: ${kit.subject} Apply subject furnishings only where the semantic role permits them; CENTER and EDGE_OPEN are intentionally empty registration assets, to be created deterministically rather than sent for image generation.

DELIVERY: one single-frame 1024 x 1024 true RGBA lossless PNG, ordinary sRGB. No sheet, labels, UI, text, watermark, painted checkerboard or solid backdrop. All pixels outside this module's registered rectangle and all empty ground are alpha 0. No floor: a continuous separate base floor fills every cell, including open corner conditions. Preserve this entire source frame: no crop, recenter, stretch or added padding. Planned runtime frame is 128 x 128, uniform scale 1/8; runtime adoption is pending.

REGISTRATION ${roomKitGeometry.version}: full cell coordinates x=0..128, y=0..128, origin at northwest, x east, y south. Source scale exactly 8 pixels per unit. Grid bands are 32 / 64 / 32 on both axes. This piece's allowed rectangle [x,y,width,height] is [${rect.join(',')}], source pixels [${sourceRect.join(',')}]; right/bottom limits are exclusive. Canonical orientation: ${roomKitGeometry.orientations[piece]}. Rotate the full frame around cell pivot (64,64), source pivot (512,512), never around visible alpha bounds. Cardinal rotations only; SHARED additionally permits the documented diagonal reflection. Every variant preserves identical geometry, socket positions, opening and pivot.

ROLE: ${roles[piece]}
${receivingPlacement}

WALL/CT CONTRACT: neutral light-gray matte wall body, 12 units deep (96 source pixels). Surviving perimeter wall has a true alpha-0 channel 5 units thick, inset 4 units: canonical north channel y=4..9 (source y=32..72); west channel x=4..9. The 5 x 24 running-slot treatment means a 24-unit repeating underlay pattern clipped through this continuous 5-unit channel, not a new colored wall sprite. CT1: 8 wall-color / 8 amber / 8 wall-color. CT2: 4 wall-color / 6 blue / 4 wall-color / 6 blue / 4 wall-color. CT3: 4 wall-color / 16 purple / 4 wall-color. Every run totals 24. Do NOT bake any tier colors into the PNG. Underlay phase continues along the room perimeter across module seams; a door interrupts visible wall/channel, but phase resumes on its other side. No underlay across an open join or clear access opening. No separate CT wall models, broad recolor mask or door-top/door-bottom light variants.

SEAMS: shared architecture socket at north-edge seams is the identical y=0..12 neutral wall cross-section with y=4..9 transparent channel; west seams use its transpose. Keep furniture inset at least 2 units from module seams. No rack, conveyor, pipe, machine or cast shadow crosses this module rectangle. Fixed furnishing forms may differ by family but never require a neighbor to finish a functional object. Corner turns are self-contained; door furnishings stop before the opening; open/shared joins remain clear. Use rotation-tolerant local shading, no directional cast shadows, baked neon glow or bright edge highlights.

CAMERA: strict orthographic direct overhead at 90 degrees, north up. Tops only, no vertical front faces, isometric view, perspective or diorama.

VISUAL REFERENCE: the user's CT1/CT2/CT3 room-and-tiles illustration shows the desired modular architectural language: pale neutral corner armor, dark graphite inset wall panels, restrained bevels and readable chunky seams. Use that material/form relationship with restrained overhead shading. Its one short amber opening, two blue openings and one long purple opening guide the future underlay only; source channels remain transparent, with no colored lights or glow baked into them. The illustrated OPEN wall-end treatment corresponds to SHARED, not the fully clear EDGE_OPEN cell join. Its room sizes are illustrative, not tied to construction tier. Do not copy its headings, floor grates, perspective, baked shadows or different tier geometry into these modules.

COORDINATION: attach the approved same-kit ${variant} module sources and registration-guide.svg when generating subsequent pieces. Match neutral materials, wall cross-section and scale to that family. The three complete families are ${Object.entries(roomKitVariants).map(([id,style])=>`${id} ${style}`).join('; ')}. Six pieces x three families = 18 source assets. Never independently randomize pieces or mix families inside a Stage. Do not change camera, dimensions, doors, seams, slot registration or clearance between families. Public fixed details only: no people, movable crates, loose tools, Gate/portal, readable screens, hidden contents, scientific findings or separate mission instances. No new gameplay equipment or rules for variety.

Save as ${kitId}-${piece}__${variant}__source.png. Three-variant packaging: after all six pieces in all three families have been reviewed, package exactly 18 source PNGs under orionis-room-kit-${kitId}-b001/ in orionis-room-kit-${kitId}-b001.zip (increment bNNN for later batches). No preview, guide, metadata or prompt inside the ZIP. Current viewer/ordinary ZIP installation does not yet support complete kits; do not install these as unrelated sprites.

${downloadDelivery(`${kitId}-${piece}__${variant}__source.png`)}
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
<title>Full-cell registration and separate open/closed door leaves</title>
<desc>1024-square source frame. Green is the clear door passage, orange is the separate closed-leaf layer. Guide colors, labels and background must never appear in generated assets.</desc>
<rect width="1024" height="1024" fill="#f0f0f0"/>
<path d="M0 48H384M640 48H1024M48 0V1024" stroke="#8f8f8f" stroke-width="96" fill="none"/>
<path d="M0 52H384M640 52H1024M52 0V1024" stroke="#cf65c5" stroke-width="40" fill="none"/>
<rect id="door-clearance" x="384" y="0" width="256" height="256" fill="#9de0c1" fill-opacity=".65" stroke="#25734f" stroke-width="2"/>
<g id="closed-leaf-overlay" fill="#e9ab58" stroke="#805120" stroke-width="2"><rect x="384" y="0" width="128" height="96"/><rect x="512" y="0" width="128" height="96"/></g>
<path d="M512 0V96" stroke="#40270e" stroke-width="4"/>
<path d="M256 0V1024M768 0V1024M0 256H1024M0 768H1024" fill="none" stroke="#555" stroke-width="2" stroke-dasharray="8 5"/>
<circle cx="512" cy="512" r="8" fill="#c33"/>
<g font-family="sans-serif" font-size="20" fill="#222">
<text x="18" y="160">CORNER / SHARED</text><text x="410" y="156">CLEAR PASSAGE</text><text x="405" y="192">x384..640 y0..256</text>
<text x="800" y="160">NORTH EDGE</text><text x="430" y="475">CENTER</text><text x="357" y="550">full-cell pivot (512,512)</text>
<text x="280" y="610">1024 x 1024 RGBA; 8 px / logical unit</text><text x="300" y="648">Bands: 256 / 512 / 256 source pixels</text>
</g>
<rect x="24" y="790" width="976" height="210" rx="8" fill="#fff" stroke="#aaa"/>
<g font-family="sans-serif" font-size="19" fill="#222">
<text x="42" y="820">GREEN: opening in fixed EDGE_DOOR; keep all of it transparent.</text>
<text x="42" y="852">ORANGE: CLOSED leaves ONLY, x384..640 y0..96; center seam x512.</text>
<text x="42" y="884">OPEN leaf layer: entirely transparent; halves retract behind fixed jambs.</text>
<text x="42" y="916">Frame + leaf are separate files. Leaf outside orange rectangle: alpha 0.</text>
<text x="42" y="948">Rotate around (512,512). No new frame, floor, header, lights or shadows.</text>
<text x="42" y="980" font-weight="bold">GUIDE ONLY: never copy these colors, lines, labels or background.</text>
</g>
</svg>\n`;

export function roomKitChecklist(kitIds){
 return `# Registered modular room-kit prompts — provisional v1

Catalog selection, not an outstanding-art or installation checklist. ${kitIds.length} existing base-room kits; 18 requests/assets per kit. Use these prompts for new modular room art. Legacy room-tile-prompts and outstanding-prompts still target installed full-room overlay keys; do not substitute modules into those keys. Offworld archetype kit mappings are a later step, especially outdoor Gate areas, whose no-wall presentation needs a separate decision.

Geometry is in room-kits.json; registration-guide.svg is a measured guide only. Each PNG has a full 1024-square cell frame, 128-square planned runtime frame, 32/64/32 grid and pivot (512,512). All modules are transparent overlays above a separate base floor. CT2 is 4/6/4/6/4; CT3 is 4/16/4; all tiers repeat every 24 units through a 5-unit channel.

Attach the user's CT tier illustration as a material/form reference: pale corner armor and dark inset wall panels; one short amber, two blue, one long purple opening. Keep lighting restrained, source slots transparent and topology/geometry identical across CT. Illustrated OPEN ends map to SHARED, not EDGE_OPEN. Room size remains independent of CT.

For each family generate CORNER first, review its wall/channel registration, then attach that source and guide for SHARED and EDGE pieces. CENTER and EDGE_OPEN are deliberately fully transparent in v1: create their empty 1024-square RGBA sources deterministically with Pillow, not image generation. All 18 named source files, including these empty members, belong in each kit ZIP. Metadata describes expected source paths, not generated files. Review seams/alpha and assemble sample 1×1, 1×2 and 2×2 layouts before accepting a family.

## Corner acceptance before generating the rest

The strengthened CORNER prompts begin with hard geometry gates. A canonical NW corner occupies ONLY source x=0..256,y=0..256 (exclusive endpoints), one sixteenth of a full 1024-square RGBA canvas. Its outer vertex is (0,0); (512,512) is the later rotation pivot, not the artwork position. Require exactly two perpendicular 96-source-pixel-deep wall arms, an alpha-0 L-channel, east/south continuation sockets and a southeast-facing interior. Reject centered/enlarged/cropped corners, whole rooms, extra wall legs, diagonal/isometric turns, freestanding posts, capped seam exits or furniture replacing the wall turn. Geometry takes priority over decorative subject matter. Attach registration-guide.svg as a measurement reference, never as painted content.
${kitIds.includes('receiving')?`
## Receiving subject and generation order

Receiving must visibly include CONVEYORS and INSPECTION STATIONS around the inside of the exterior PERIMETER. EDGE_NORMAL explicitly requests both a short finished roller/belt section and a compact inspection workbench. CORNER can carry a compact inspection detail after its L-shaped wall is correct; do not force both furnishings into that small slot. SHARED ends furnishings before the open join. EDGE_DOOR keeps its entire passage clear and omits furniture that cannot fit the side areas. No central machinery, loose cargo or equipment crossing seams; CENTER/EDGE_OPEN remain empty. These furnishings are decorative, not configured Services or deep Analysis capabilities.

Generate and approve receiving-corner-v01-prompt.txt first, then the v01 SHARED/EDGE pieces using that approved corner as a reference. Repeat for v02/v03; keep each family together. The rounded and utilitarian styles must preserve the exact same registration and seam geometry.
`:''}

Registered kit resizing, complete-family ZIP ingestion, Stage-wide deterministic selection and Offworld renderer adoption are still pending. The Room Sandbox modular test now previews Material Storage sources, CT treatments and open/closed leaves without installing active art. Ordinary crop/recenter, sheet split and independent per-key installation are unsuitable. SHARED permits diagonal reflection plus rotation to cover both handed arrangements.

## Door frames and moving leaves

Attach registration-guide.svg plus the approved same-family EDGE_DOOR and CORNER sources when generating leaves. The guide is a measurement reference: its colors, grid, labels and background must never be painted into an asset.

- Fixed EDGE_DOOR frame: preserve the full clear north passage x=48..80, y=0..32 (source x=384..640, y=0..256), alpha 0 throughout. Do not bake moving leaves into this module.
- Separate CLOSED leaf overlay: full 1024-square RGBA frame; visible pixels only in x=48..80, y=0..12 (source x=384..640, y=0..96). Two sliding halves meet at x=64 (source x=512). The guide's orange rectangle marks this separate layer; it does not authorize filling the opening in EDGE_DOOR.
- OPEN leaf overlay: entirely transparent. Leaves retract behind the existing frame and are not drawn. No image generation is needed for an empty open asset.
- Use the same cell pivot (512,512) and matching family for frame and leaf. Do not add a second frame, overhead bridge, floor, CT lights or shadows outside the closed-leaf rectangle. The 12-unit depth is a provisional visual fit to the existing wall.

Leaf names: <kit-id>-door-leaf-closed__vNN__source.png; optional empty open file <kit-id>-door-leaf-open__vNN__source.png. Leaf files are additional overlays, not members of the original six-piece/18-file kit ZIP. Keep them separate until production packaging is defined.

Material Storage's three closed-leaf generation prompts and attachment instructions are in artwork/room-kit-door-prompts-v1/material-storage/. To review, open /demos/room-sandbox/room-kit.html, choose Load door leaf artwork, then toggle Doors: open / closed. Unprovided closed art uses a labeled schematic placeholder. File selections last for the page session; no door gameplay is implied.

${roomKitPromptEntries(kitIds).map(entry=>`- [ ] ${entry.file}`).join('\n')}

Export another selection to a fresh folder (repeat --kit as needed):

\`\`\`bash
node demos/offworld-sandbox/prepare-sprite.mjs room-kit-prompts --kit receiving --kit material-storage --out artwork/room-kit-prompts-next
\`\`\`

Omit --kit to export all ${Object.keys(roomKitCatalog).length} supported base-room catalog kits. Existing prompt files cannot be overwritten.
`;
}

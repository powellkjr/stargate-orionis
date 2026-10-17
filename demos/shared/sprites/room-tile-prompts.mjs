import {roomSprites} from './room-sprite-requirements.mjs';

// Legacy full-room overlay requests used by existing manifest/install workflows.
// New modular kit authoring: room-kit-prompts.mjs / prepare-sprite.mjs room-kit-prompts.

// Acquisition status only: extracted studies are not approved or installed art.
export const settledRoomTileIds=Object.freeze(['analysis','containment','data_storage','equipment_storage','gate_room','infirmary','living_quarters','maintenance','material_storage','ration_storage','receiving','response_room','supply_storage','tech_platform','workshop']);
// Presentation-only additions; do not register new gameplay Rooms or Services.
export const offworldRoomTileSubjects=Object.freeze({
 offworld_gate_area:'Open-air Gate arrival area with sparse neutral perimeter fixtures only. Do not draw the Gate, portal, terrain or outdoor ground.',
 offworld_room_basic:'Generic neutral interior with minimal perimeter furnishings. No visible secret compartments, loot or evidence.',
 offworld_hallway_basic:'Sparse corridor fixtures along the sides. Keep an uninterrupted north-south route and clear side-center connection areas; do not bake in corridor walls.',
 offworld_processing_room:'Industrial processing-room shell furnishings only. Omit mining machinery, generators, components, radiation effects and supply caches; these are separate instances.',
 offworld_security_room:'Security office perimeter furnishings only. Omit security terminals, archives, guards, safes, alarms and readable displays; these are separate instances.',
 offworld_medical_holding:'Medical holding-area perimeter furnishings only: sparse neutral fixed cabinets along the edges. Do not draw beds, examination couches, stretchers, patients, samples, medical equipment or restraints; these are separate instances. Keep the center empty.'
});
const pendingRooms=Object.entries(roomSprites);
pendingRooms.push(...Object.entries(offworldRoomTileSubjects).map(([id,subject])=>[id,{props:[],subject}]));
export const roomTilePrompts=pendingRooms.map(([id,room],index)=>{
 const key=`floor-room-${id.replaceAll('_','-')}`;
 const props=room.props.filter(prop=>!['gate','gate-open','crate','medical','security'].includes(prop));
 return {file:`${String(index+1).padStart(2,'0')}-${key}-prompt.txt`,key,text:`Generate one room-interior tile sheet for ${id.replaceAll('_',' ')}.
${room.subject?`\nSUBJECT: ${room.subject}\n`:''}

DELIVERY: ONE RGBA PNG image containing exactly THREE square room-interior tiles side by side in one horizontal row, left-to-right v01, v02, v03. Target canvas 3072 x 1024 pixels; each cell 1024 x 1024. If that size is unavailable, use another exact 3:1 canvas with three equal square cells. No separate images, ZIP, contact-sheet border, gutter, margin, labels or captions. All ground and empty space must be fully transparent (alpha 0); only the fixed furnishings are visible. Do not paint a floor, solid backdrop or checkerboard transparency pattern. The simulator will add the floor separately with its tile system. Each square retains its full room coordinate frame; boundaries are exactly one-third and two-thirds of the image width. Do not let any furnishing cross a cell boundary.

CAMERA: strict orthographic plan view, camera directly overhead looking vertically down at 90 degrees, north up. Show horizontal tops of furniture only. No isometric, oblique, front or three-quarter view; no visible vertical front faces or room perspective. This is a flat map tile, not a room illustration or diorama.

CONTENT: a few neutral muted sci-fi fixed built-in furnishings appropriate to this existing room type${props.length?`: ${props.join(', ')}`:''}, isolated together on transparent ground. Treat these as decorative visual categories only. Keep the central walking area open and uncluttered, with furnishings primarily toward the perimeter. Reserve a clear bottom-center space in EVERY square for a separately placed door: leave the bottom-center doorway area and its approach to the central walking area fully transparent and unobstructed by furniture, equipment or shadows. Do not draw the door or its frame. Maintain the same entrance position and usable clearance across all three variants. Do not draw walls, doors, doorways, people, movable crates, loose tools, active Gate portals, text, UI, scientific findings, readable screens or hidden contents. Those can be placed separately by the simulator. No cast shadows outside furniture footprints. Use chunky readable forms and restrained local shading; avoid tiny busy details.

VARIANTS: v01 clean angular design; v02 softer rounded design; v03 chunky utilitarian design. Maintain identical camera, furnishing palette, approximate scale, bottom-center door clearance and usable open space. Vary fixed furnishing shapes and arrangement; do not merely recolor the same tile. Each square is a complete alternative furnishing overlay, not a fragment of one larger room. Do not add gameplay equipment or rules to force variety.

Output only the single sheet PNG. Suggested filename: ${key}__sheet.png. It will be split locally into three variants; preserve the full square coordinate frames and existing transparent ground. Do not crop, recenter furnishings or add extra sprite padding.
`};
});

export const roomTileChecklist=`# Room interior tile prompt queue

Full catalog queue, not a live pending list. For missing artwork and confirmed regeneration requests only, use prepare-sprite.mjs outstanding-prompts --out <fresh-directory>. Upload each numbered prompt separately. Each requests ONE transparent RGBA 3:1 image with three equal square furnishing overlays side by side, without gutters or labels. Ground and empty space have alpha 0; the tile system supplies the floor separately. Every variant reserves an unobstructed bottom-center doorway area and approach. Existing furniture/geology prompts remain separate.

## Complete overlay catalog
${roomTilePrompts.map(prompt=>`- [ ] ${prompt.key} — ${prompt.file}`).join('\n')}

## Settled acquisition — removed from active prompt list
${settledRoomTileIds.map(id=>`- [x] ${id.replaceAll('_',' ')} — historically extracted; consult live registry and visual review.`).join('\n')}

The acquisition filenames and provenance remain in artwork/room-tile-prompts-v2/README.md and the source batches. Arena Control Rings is excluded by user instruction. Lab Room Frame Collection and Command Bay Tile Variants remain unassigned; neither satisfies a pending request until identified. Historical opaque candidates are not transparent-overlay replacements.

Cultural Platform is a registered continuous 2×2 room: render one complete overlay across its footprint, not four miniature rooms. Offworld requests cover the six authored stage archetypes, not new SGC gameplay rooms. Do not bake hidden mission facts or separately rendered instance objects into overlays.

Keep the full square coordinate frames when splitting; do not crop or recenter furnishings. The current Python splitter's \`--tiles\` mode requires opaque images and rejects these transparent overlays. Its ordinary sprite mode also crops/recenters, so neither mode is suitable for this revised queue without a dedicated frame-preserving transparent workflow.

The floor-room keys are registered transparent furnishing overlays, not opaque floor content. Room Sandbox layers them over separate floors and suppresses corresponding fallback furniture. Review camera, alpha, subject fidelity and doorway clearance manually; installation alone is not visual approval. Historical queues remain unchanged.

Regenerate text into a fresh folder:

\`\`\`bash
node demos/offworld-sandbox/prepare-sprite.mjs room-tile-prompts --out artwork/room-tile-prompts-v3
\`\`\`
`;

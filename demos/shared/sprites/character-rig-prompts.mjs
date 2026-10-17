import {characterPaletteInstructions} from './character-art-prompts.mjs';
import {rigParts,rigTemplate,rigParents,rigOrder} from './character-rig.mjs';
const common=`TECHNICIAN RIG PROOF: character id technician_v01. One approved master, one north-facing rig. Not three candidates or walking frames. Presentation only: no new tactical facing, collision, equipment capability or hidden identity.
Full-canvas registration: each file is single-frame 1024x1024 true RGBA PNG, origin at top-left, x right, y down. Keep the same exact character, camera, scale, position, lighting, clothing and proportions. No tight crops, independent recentering or stretching. All neutral layers reconstruct the approved master at the same canvas origin.
Camera: preserve the approved preferred master's crown-dominant oblique overhead view, north-facing proof. The user accepted this camera on October 9, 2026; do not redraw it to force a direct-overhead view. Front-facing matching portraits remain a separate art workflow, never mixed into rig parts.
Pose: planted feet, legs mostly vertical, relaxed arms slightly separated, no stride, aiming or running. Bright clean chunky mature stylized painted sci-fi, low noise, soft low-contrast upper-left lighting tolerant of small limb rotations. No backdrop, ground/contact shadow, text, labels, UI or watermark.
All visible and hidden pixels must fit within [64,64,960,960], allowing at least 64 source pixels transparent outer margin (8 runtime pixels). No cast shadow duplicated on body parts.
${characterPaletteInstructions()}
LOCKED PIVOTS: ${rigParts.map(p=>`${p}=${JSON.stringify(rigTemplate[p])}`).join('; ')} in source pixels. Anatomical left/right refer to the character, not the screen: north-facing anatomical left is screen-right. Head attaches at neck; arms at shoulders; legs at hips; equipment at its torso mount. These replace the arbitrary earlier template and fit the preferred master's illustrated anatomy after whole-canvas 1254-to-1024 normalization. Hidden joint centers are art estimates requiring rotation/seam review. Preserve the approved master; never silently move a part or change the pivots.
Normalization: preserve FULL 1024 canvas and downsample every layer identically to 128x128, scale 1/8. No per-part alpha-bounds crop. Pivot coordinates also divide by 8. Display full rig at 22x22 world units, center/root [512,512] source -> [64,64] runtime.
`; 
const details={
 torso:'Chest, abdomen, main vest/jacket and pelvis/hips connection. Cover proximal arm/leg overlap. Remove head, arms, legs and independently swappable large equipment. Small permanent clothing details stay here.',
 head:'Head and exposed neck overlap. For head-kit compatibility, deliver bald/beardless/no eyewear; reusable hair/beard/eyewear are separate future overlays. Torso owns the visible collar; head owns hidden neck overlap. This rig convention supersedes the older head-kit body-owned-neck split; do not mix their unconverted templates.',
 left_upper_arm:'Anatomical left shoulder cap, sleeve and upper arm ending at elbow. No torso shirt scraps, harness, forearm or hand. Include clean hidden shoulder attachment.',
 right_upper_arm:'Anatomical right shoulder cap, sleeve and upper arm ending at elbow. No torso shirt scraps, harness, forearm or hand. Include clean hidden shoulder attachment.',
 left_forearm:'Anatomical left forearm, wrist, glove and hand; hidden proximal elbow overlap beneath upper arm. No upper arm, sleeve or torso.',
 right_forearm:'Anatomical right forearm, wrist, glove and hand; hidden proximal elbow overlap beneath upper arm. No upper arm, sleeve or torso.',
 left_upper_leg:'Anatomical left upper thigh ending at knee, with generous hidden hip overlap under continuous torso-owned pelvis. No torso shirt or lower leg.',
 right_upper_leg:'Anatomical right upper thigh ending at knee, with generous hidden hip overlap under continuous torso-owned pelvis. No torso shirt or lower leg.',
 left_lower_leg:'Anatomical left lower leg, protective pad and boot; hidden proximal knee overlap beneath upper thigh. No pelvis or upper thigh.',
 right_lower_leg:'Anatomical right lower leg, protective pad and boot; hidden proximal knee overlap beneath upper thigh. No pelvis or upper thigh.',
 equipment:`One compact front torso-mounted technician tool case, visual accessory only, matching the approved master at pivot ${JSON.stringify(rigTemplate.equipment)}. No hands, limbs or clothing backing. No scientific mechanism or game Service claim. This jointed rig supports one front equipment layer; front/back equipment splitting and hand mounts are later extensions. If approved master has no large independent equipment, deliver an entirely transparent equipment PNG, not an invented item.`
};
export const characterRigPrompts=[{file:'00-technician-master-prompt.txt',text:`${common}
STAGE A: The preferred master is selected. Use artwork/rig-sprint/preferred-master-v01/char_technician_v01__master__source.png as the registered reference; preserve its neutral silhouette, camera and outfit. Practical field outfit with prescribed source palette, no insignia. For this proof use bald/beardless head and no eyewear so head accessories can be added later without stale hair underneath. Preserve the compact centered front tool case. Do not redesign an approved master after parts begin.
FILENAME: char_technician_v01__master__source.png.
Deliver one PNG; if packaging, ZIP orionis-rig-technician-v01-master-b001.zip with exactly one same-named root containing that PNG. If file export is unavailable, say so. Approve master before Stage B.
`},...rigParts.map((part,i)=>({file:`${String(i+1).padStart(2,'0')}-${part.replaceAll('_','-')}-prompt.txt`,text:`${common}
STAGE B: Attach the exact approved char_technician_v01__master__source.png. Request it if missing. Remove every other body component while preserving only ${part} at its original registered location. This is decomposition of the approved character, not a redesign or a new pose.
COMPONENT: ${details[part]}
HIDDEN OVERLAP: upper arms extend under torso at shoulders; forearms overlap beneath upper arms at elbows; upper thighs extend generously under the continuous torso-owned pelvis; lower legs overlap beneath upper thighs at knees; head overlaps under collar. Use 10-15% proximal segment overlap where possible. Reconstruct hidden attachment surfaces, never crop flush at a visible seam. Preserve the approved visible silhouette elsewhere. Equipment matches its torso mount. Review shoulders +/-12 degrees and hips/knees/elbows +/-15 degrees for gaps and clipping; head and torso do not rotate initially. WALK uses small joint-anchored vertical foreshortening; do not bake sideways walking poses into the source.
PIVOT: ${part} ${JSON.stringify(rigTemplate[part])} source pixels -> ${JSON.stringify(rigTemplate[part].map(v=>v/8))} runtime pixels. Parent ${rigParents[part]}; neutral draw-order z=${rigOrder[part]}. Z-order is metadata, never baked body backing.
EXACT OUTPUT: one PNG char_technician_v01__${part.replaceAll('_','-')}__source.png, no other part visible, full registered canvas. If packaging, use orionis-rig-technician-v01-${part.replaceAll('_','-')}-b001.zip and one matching root containing only that PNG. Verify real export; do not claim a ZIP exists if unavailable.
`}))];
export const rigSourceMetadata={version:2,id:'technician_v01',sourceCanvas:1024,parts:Object.fromEntries(rigParts.map(part=>[part,{file:`char_technician_v01__${part.replaceAll('_','-')}__source.png`,pivot:rigTemplate[part]}]))};
export const characterRigChecklist=`# Technician rig proof

The master is selected. Use the SAME approved master with each request 01-11.
This produces eleven separate registered layers with elbows and knees. Keep original
downloads and older head-kit templates; they require conversion to this rig's
head-owned neck overlap before reuse. Portraits are not animation rig layers.

${characterRigPrompts.map(p=>`- [ ] ${p.file}`).join('\n')}

Collect the eleven PNGs plus the provided version-2 rig.json into one source folder, then:

\`node demos/offworld-sandbox/prepare-sprite.mjs rig-prepare artwork/rig-sources/technician-v01 --out demos/shared/sprites/offworld/rigs/technician-v01\`

The tool validates formats/registration and normalizes all parts together. It
does not activate the rig or certify visual seams/RGB. Review neutral pose,
arms +/-12 degrees, legs +/-15 degrees, equipment alignment and readability at
22 world units before registering the output rig in active-character-rigs.mjs.
No current viewer ZIP installer understands rig parts yet.
`;

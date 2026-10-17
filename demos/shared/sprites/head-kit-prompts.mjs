import {characterPaletteInstructions} from './character-art-prompts.mjs';
const common=`REGISTERED HEAD KIT — source art only, no gameplay meaning.
Reference identity: use one approved overhead character and its matching front-facing head-and-shoulders portrait. Start with technician v01 for this proof set. If either reference is missing, request it before generating. Do not independently invent the portrait identity.
Each output is a separate 1024x1024 true RGBA transparent PNG on the FULL reference canvas. Overhead remains directly overhead, north up; portrait remains eye-level and front-facing. Preserve each view's original scale, framing, head position, lighting and neck attachment. Never independently crop, recenter, resize or stretch a layer. Do not put both views or multiple variations in a delivered PNG.
Use the existing source art style: bright clean chunky mature stylized painted sci-fi, restrained dark outlines, low texture noise and soft low-contrast upper-left light. No labels, UI, insignia, backgrounds or cast shadows.
${characterPaletteInstructions()}
MASK CHANNELS: exposed head/ears use skin; hair and facial hair use hair; eyewear frames/straps use gear. Lens material is separate from gear and uses the explicit RGB/alpha lens values above; no opaque display-colored lens fill. Skin, hair and beards use their strict source ramps. Normalize new matched layers to the source palette without changing the approved registration; preserve reference files unchanged.
No artificial segmentation colors in finished layers, and no independently guessed mask images. The exact-pixel masks will be authored/verified after delivery.
PACKAGING: use b001 for the first approved kit, increment for a new kit. Archive root exactly equals ZIP filename without .zip. Include only the listed files inside that root, no nested folders or previews. Intermediate contact sheets and composited checks stay outside the archive. Verify files/ZIP and provide a clickable download link. If file export is unavailable, say so without claiming a ZIP exists.
These head-kit ZIPs use a separate future layer-import contract. Do not put them into an ordinary sprite/profile ZIP; the current viewer/installer does not ingest these layer names.
`;
const registration=`REGISTRATION: attach the approved kit's registration.json plus its two body and two bald-head layers. Use the recorded overhead and portrait head anchors/neck joins exactly. If these are unavailable, stop and request them. All overlays are already positioned on their respective full canvases. Composite-check each overlay against its reference head/body before delivery; avoid seams, gaps, double hair, floating frames and clipping.`;
export const headKitPrompts=Object.freeze([
 {file:'00-body-and-head-templates-prompt.txt',text:`${common}
FOUNDATION STEP: attach the approved technician v01 overhead PNG and the matching portrait PNG. Produce a reusable head-free body for each view plus a bald, beardless head without eyewear for each view.
Body layers retain clothing, equipment, arms and the exposed neck. Remove the entire original head/hair/eyewear silhouette, including bun, ponytail and loose strands. Reconstruct only the neck/clothing previously covered by that silhouette; preserve all other body geometry and shading placement while normalizing its pixels to the mandatory RGB palette. Reconstructed hidden areas are provisional visual art for review. No dark hole or remnant of the old head.
Head layers contain only the matching bald head, ears and facial features. Body owns the neck; define the neck join and which layer covers its edge. No shoulders, clothing, hair, facial hair or eyewear in head layers. Match the reference identity using the strict skin RGB ramp. Do not move the face to improve composition.
Write registration.json with version:1, kitId:"orionis-head-kit-b001", reference filenames, canvas:[1024,1024], and an overhead/portrait record each containing headAnchor:[x,y], neckJoin:[x,y], headSlotBounds:[left,top,right,bottom], and filenames for that view's body/head. Coordinates are measured integer pixels on the delivered canvas, not guessed defaults. Record layer order body -> head -> facial hair -> hair -> eyewear frames -> lenses. These coordinates will be reviewed, not automatically trusted.
ZIP: orionis-head-kit-b001.zip
EXACT FILES: body__overhead-source.png, body__portrait-source.png, head-base__overhead-source.png, head-base__portrait-source.png, registration.json.
Verify the body+head composite matches the supplied character positioning and leaves no old hair behind. Deliver this foundation first; do not generate variants until it is approved.
`},
 {file:'01-head-shapes-prompt.txt',text:`${common}\n${registration}
Produce three bald, beardless head-shape alternatives: v01 soft/rounded, v02 square, v03 narrower/angular. This is presentation variation only; retain mature age range, strict skin RGB ramp, camera and compatible neck joins. No hair or eyewear. Both views of each variant depict the same person/head shape. Keep each silhouette within the approved available space; never resize the canvas or body.
ZIP: orionis-head-shapes-b001.zip
EXACT FILES: head-shape__v01__overhead-source.png, head-shape__v01__portrait-source.png, head-shape__v02__overhead-source.png, head-shape__v02__portrait-source.png, head-shape__v03__overhead-source.png, head-shape__v03__portrait-source.png.
This batch is optional for the first proof; the hair/beard/eyewear prompts initially fit head-base only. Do not claim an overlay fits all three shapes without checking and adjusting it for each shape.
`},
 {file:'02-hair-variants-prompt.txt',text:`${common}\n${registration}
Fit head-base only. Produce two hair-only styles: v01 short cropped hair, v02 short swept hair. Both views of each style must match hairstyle, hairline and hair color. Hair owns its own outline/edge shading; no skin/scalp pixels, face, beard, neck, clothing or accessories baked in. Bald means omitting the hair layer, not a black fill. Avoid long rear hair in this proof set; a later rear-hair layer will need its own compositing order.
ZIP: orionis-head-hair-b001.zip
EXACT FILES: hair__v01__overhead-source.png, hair__v01__portrait-source.png, hair__v02__overhead-source.png, hair__v02__portrait-source.png.
`},
 {file:'03-beard-variant-prompt.txt',text:`${common}\n${registration}
Fit head-base only. Produce one short, neat full beard with matching moustache, v01. Hair channel/color matches the approved hair; preserve natural shading. Overlay contains facial hair only, no opaque skin backing or replacement mouth/nose. Match beard shape in both views and respect actual overhead visibility. If the beard is fully occluded overhead, its overhead layer may be entirely transparent; do not draw it through the top of the head. Beard-free means omitting this layer.
ZIP: orionis-head-beard-b001.zip
EXACT FILES: beard__v01__overhead-source.png, beard__v01__portrait-source.png.
`},
 {file:'04-goggles-variant-prompt.txt',text:`${common}\n${registration}
Fit head-base and both approved hair styles. Produce one compact pair of practical goggles, v01, matching in overhead and portrait. Frame/strap layer contains gear-colored frame/strap only; lens layer contains lens pixels only, keeping the character underneath visible. Respect camera occlusion; never paint front-facing eyes onto an overhead head. Do not bake skin, hair, beard or clothing into either layer. Goggles-free means omitting both layers. Check frame placement against both hairstyles; if a shared fit fails, report the conflict instead of shifting the head or hair.
ZIP: orionis-head-goggles-b001.zip
EXACT FILES: goggles-frame__v01__overhead-source.png, goggles-frame__v01__portrait-source.png, goggles-lens__v01__overhead-source.png, goggles-lens__v01__portrait-source.png.
`},
 {file:'05-glasses-variant-prompt.txt',text:`${common}\n${registration}
Fit head-base and both approved hair styles. Produce one simple pair of thin practical glasses, v01. Preserve the same frame design in both views, respecting overhead occlusion. Gear-colored frames and neutral translucent lenses are separate overlays, with no skin/hair backing. Do not add visible overhead facial detail that the camera cannot see. Glasses and goggles are alternatives: never combine them. Check both hairstyle fits, reporting conflicts rather than moving the registered parts.
ZIP: orionis-head-glasses-b001.zip
EXACT FILES: glasses-frame__v01__overhead-source.png, glasses-frame__v01__portrait-source.png, glasses-lens__v01__overhead-source.png, glasses-lens__v01__portrait-source.png.
`}
]);
export const headKitChecklist=`# Registered head-kit prompt checklist

Start with one approved overhead character (technician v01) and its matching
front-facing portrait. Upload both with 00. Approve the head-free body/bald-head
templates before continuing. For later prompts attach registration.json and the
four approved template PNGs, plus the approved hair layers when testing eyewear.

The smallest proof is 00 -> 02 -> 03 -> 04. Optional 01 adds head shapes and 05
adds glasses. Hair/beard/eyewear initially fit head-base; additional head shapes
need separately reviewed fitting. Every part includes matching overhead and
portrait views on full 1024 canvases. None/bald/clean-shaven means no overlay.

These are source-art requests, not installable current sprites. Save the ZIPs
for a later layer importer and compositor; do not mix them with overhead batches.
The palette describes painted material regions; it does not supply pixel masks.
No existing downloaded art or runtime selection is changed by these prompts.

${headKitPrompts.map(p=>`- [ ] ${p.file}`).join('\n')}
`;

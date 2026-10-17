# Registered jointed character rig — proof contract

## Current contract: version 2, eleven layers

The user authorized repair of the rejected v03 proof and requested separate
elbows and knees. This section supersedes the historical version-1 specification
below. Preserve the selected master, camera, palette and fitted shoulder/hip
locations. Current sources: `artwork/rig-sources/technician-v01-jointed-proof-v04/`;
review: `artwork/rig-sprint/jointed-proof-v04/`. Old packs are retained and never
silently converted or activated. Version-1 metadata fails current validation.

Every layer uses the same 1024 RGBA source canvas and at least 64px outer padding;
runtime canvases are 128px and pivots scale by 1/8. Preparation remains atomic, refuses
existing output directories and does not activate art. Metadata version2 has
exactly these eleven parts:

| Part | Source pivot | Parent | z |
| --- | --- | --- | --- |
| torso | 512,512 | root | 30 |
| head | 512,400 | torso | 25 |
| left_upper_arm | 672,384 | torso | 22 |
| right_upper_arm | 352,384 | torso | 23 |
| left_forearm | 716,512 | left_upper_arm | 20 |
| right_forearm | 308,512 | right_upper_arm | 21 |
| left_upper_leg | 560,584 | root | 12 |
| right_upper_leg | 464,584 | root | 13 |
| left_lower_leg | 600,712 | left_upper_leg | 10 |
| right_lower_leg | 424,712 | right_upper_leg | 11 |
| equipment | 512,536 | torso | 60 |

Anatomical left is screen-right. Elbow and knee centers are new illustrated
attachment estimates, requiring pose review, not measurements of a skeleton.
Upper arms own shoulder caps and sleeves, forearms own wrists/gloves/hands.
The torso owns continuous pelvis/waist coverage and torso-side shirt material.
Moving thighs extend behind that pelvis. Lower legs own the knee/lower-leg/boot
region and overlap beneath upper thighs. Head retains neck overlap below collar.
Visible pixels partition the same master exactly; hidden backing preserves
source material RGB and is occluded in neutral pose. An exact neutral match
does not establish animated seam acceptance.

`rigPartMatrix` composes each part's joint transform through every ancestor,
so forearms follow upper arms and lower legs follow upper thighs. Joint rotation
and vertical scale are centered on each attachment. `rigImage` accepts optional
finite `jointAngles` for presentation previews; these do not equip Tools, attach
physical objects or add a holding gameplay state. Draw order remains flattened
independently of the transform hierarchy. No hierarchy changes to gameplay.

WALK uses four linearly interpolated 150ms phases `[1,0,-1,0]`, 600ms total.
Upper arms alternate vertical scale 1+/-0.075; upper thighs alternate 1+/-0.08,
with opposite arm/leg phase. Forearms and lower legs inherit these transforms.
Their projected hands/feet move forward/backward without lateral splaying.
Torso bob remains 2 source pixels; IDLE/STATIONED remain neutral, DOWN rotates
the root 90 degrees. This is subtle 2D foreshortening, not a 3D gait or generated
frame animation. No live movement interpolation or animation loop is introduced.

Acceptance includes every sampled WALK frame, shoulder/hip closeups, elbow/knee
bend diagnostics, neutral reconstruction, palette, padding, runtime readability
and explicit user review before activation. Current bend diagnostics use +/-15
degrees; full holding poses and greater bends need their own art/pose review.
The alpha 128 connected-component check detects detached fragments but cannot
certify anatomy, shading or all seam quality. Offline previews consume the same
JS matrices as SVG; Pillow interpolation remains an approximation of browser SVG.

Current prompt queue: `artwork/sprite-prompts-v4/rig-proof-jointed/` (12 requests
plus README and version-2 source rig.json). Archived seven-part queue is historical.
The shared worker gets pivots, parents and order from current JS exports.
The empty active registry remains the activation boundary.

## Historical version-1 contract — superseded

The October 9 character-rig handoff is design input for this presentation
experiment. The existing mission runtime remains authoritative. Technician v01
is the first proof because the existing mask study uses that Profession.
Codex may generate and prepare art under the subsequent sprint handoff. No full
Profession library is requested. The October 9 user follow-up accepts the
preferred master's silhouette/camera and authorizes fitting pivots to its anatomy.

## Source and preparation

Use the selected, prepared 1024x1024 RGBA overhead master, then decompose it into torso,
head, left_arm, right_arm, left_leg, right_leg and equipment. Use the eight
ready requests in `artwork/sprite-prompts-v4/rig-proof/`. Anatomical left is
screen-right for this north-facing master. Separate limbs are never mirrored.
Strict RGB source ramps remain in effect; final appearance recoloring is separate.

Every source layer retains the full master canvas and registration. Transparent
outer padding is at least 64 source pixels. Arms/legs include 10–15% hidden
proximal overlap, head includes neck overlap under the torso's collar.
This changes the older head-kit's body-owned-neck convention: those templates
must be converted, not silently mixed. The first master is bald/beardless with
no eyewear; additional head/hair/accessory overlays remain separate future work.
An empty equipment layer is permitted when the approved master has none.

`prepare-sprite.mjs rig-prepare` loads all seven parts and supplied source
rig.json before writing. It requires PNG/RGBA/1024 canvases, template pivots,
safe source paths, outer padding and space for conservative rotation bounds.
It downsamples EVERY full canvas to 128x128, never crops independently, divides
pivots by eight and writes seven PNGs plus runtime rig.json to a new directory
under `demos/shared/sprites/offworld/rigs/`. Outputs commit together; existing
directories are refused. Preparation does not activate art, verify RGB or prove
joint seams. It resamples source RGB tones, so strict palette inspection applies
to source masters, not interpolated edge pixels in normalized PNGs.

## Coordinates, hierarchy and draw order

The initial template was provisional and did not fit the selected master.
The October 9 user direction supersedes it: fit pivots to the preferred
`Top-Down Tactical Agent Sprite.png` rather than redraw usable art to arbitrary
points. Its whole 1254 canvas scales to 1024 without cropping/recentering;
the prepared master lives in `artwork/rig-sprint/preferred-master-v01/`.
Preserve its crown-dominant **oblique overhead** camera. Direct-overhead prose
in earlier prompt snapshots is historical, not the approved camera for this rig.
These source attachment centers are estimates from the illustrated anatomy,
not measured skeletal joints. Maximum-angle seam review remains mandatory.

| Part | Source pivot | Runtime pivot | Parent | z |
|---|---|---|---|---|
| torso | 512,512 | 64,64 | root | 30 |
| head | 512,400 | 64,50 | torso | 25 |
| left_arm | 672,384 | 84,48 | torso | 20 |
| right_arm | 352,384 | 44,48 | torso | 21 |
| left_leg | 560,584 | 70,73 | root | 10 |
| right_leg | 464,584 | 58,73 | root | 11 |
| equipment | 512,536 | 64,67 | torso | 60 |

Shoulders sit under the shoulder caps where each upper arm meets the torso;
the neck attaches beneath the chin/collar, hips beneath the lower shirt/pelvis,
and equipment at the centered front case. Torso remains a presentation anchor.
The Python worker receives these exact coordinates from the shared JS template;
it has no independent hard-coded pivot table. Source rig.json and generated
prompts must match that template. Earlier templates/prompts remain archived
under `artwork/rig-sprint/template-v00/` for provenance.

Canvas origin is top-left, x right/y down. Root [64,64] is placed at the existing
map point and the full canvas displays at 22 world units. Neutral draw order is
legs, arms, head, torso, front equipment. Head z=25 corrects the earlier
head-above-torso order: its hidden neck must be occluded by the torso collar.
Putting proximal joints below torso
covers overlaps. This first schema supports one front equipment layer; far/near
order changes, rear equipment, hand attachments and directional rigs are later
extensions. Parts retain distinct parent metadata; the renderer flattens draw
order and applies torso translation to its children. Initial torso/head rotation
is zero, so a general skeletal transformation engine is unnecessary.

## Presentation poses and activation

`character-rig.mjs` supplies pure IDLE/WALK/DOWN/STATIONED pose sampling.
WALK has four phases [+1,0,-1,0], linearly interpolated, 150ms each (600ms cycle).
Arms swing opposite legs at 10 degrees; legs swing at 12 degrees; torso bob is
two source pixels (0.25 runtime pixel). Maximum art acceptance ranges are arms
±12 and legs ±15. Head and torso do not rotate. DOWN rotates the root 90 degrees;
STATIONED remains neutral and existing UI supplies its ring. Reduced-motion
callers should sample IDLE. No extra art for hostile/talking/captured overlays.

`rigImage` renders SVG layers at caller-provided presentation time. Optional
`spriteImage` state/timeMs arguments expose the same sampler. Offworld currently
moves instantly between rooms, so it does not invent a gameplay WALK state or
start an animation loop. A future visual interpolation caller can use this API.
Normal existing maps stay deterministic at their default IDLE pose.

To activate REVIEWED art, add its validated runtime rig object under the matching
public asset key (e.g. technician) in `active-character-rigs.mjs`. This registry
is initially empty. Invalid metadata falls back to existing single-sprite art;
a failed part load replaces the whole rig with that fallback. Unknown identity
and fog still select only their existing public generic resources.

Before activation, review the neutral composite, attachment seams at maximum
rotations, four-phase walk, equipment alignment, scale/readability and matching
portrait identity. Automated preparation checks do not replace this visual gate.
No ZIP rig installer or runtime masks are implemented in this wave.

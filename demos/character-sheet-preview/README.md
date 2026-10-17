# Purchased character rig preview

Run the existing demo server, then open `/demos/character-sheet-preview/`.
No new server endpoint or restart is required.

The **Head** dropdown loads registered PNG variants from the ignored local
`artwork/zombie-tds-main-characters/head-variants/` library. `Man/` and `Girl/`
hold prepared heads; `index.json` records their character and explicit original
part-to-PNG replacements. See that folder's README for registration. Original is
selected on load/character change; seven profession-derived heads per character
are registered locally (short hair, brown bun, blond goggles, tousled hair, spiky
hair, close crop, swept fringe). Skull-based scaling excludes hair extensions;
registered transparent padding preserves the original pivot frame while allowing
buns/ponytails to extend. Per-head skin/hair/accessory masks support Color selected
head using the bottom skin/hair controls and a separate head accessories control,
with Show material masks for review. Manual skull
landmarks and mask edges remain provisional. Selection affects playback
and workbench, with unregistered views retaining their original head. Death poses
are excluded. New PNGs and registry entries become available after browser refresh.

The **Appearance** selector loads the complete local technician recolor from
`artwork/zombie-tds-main-characters/technician-reskin-v01/skin.json`, when available,
and defaults to Technician. Original remains selectable. The same appearance
applies to animation playback and the parts workbench. All recolored parts retain
their source dimensions and alpha; pivots, timing and geometry stay unchanged.
The local pack covers every referenced image for both characters. Original baked
PNG frame comparison is available only under Original. Missing/incomplete skin
packs fall back to Original so other checkouts can still use their purchased pack.

When the local `material-masks-v01/masks.json` is present, Technician uses original
parts plus exclusive material IDs instead of fixed recolored PNGs. Shirt, gear,
harness, accents, skin, hair and trousers have independent color controls; Show
material masks exposes the boundaries for review. This is a first mask pass using
source-specific color gates, not a claim of perfect semantic segmentation. Death
poses are excluded and retain original art. Colors are tab-local and reset on
reload; no source file, pivot or live simulator is changed.

Choose Man or Girl, then one of 11 authored actions per character. Playback uses
Spriter SCML key times, parent relationships, image pivots, z-order, angle spin,
linear/instant interpolation, scale and alpha. One-shot endings are preserved;
Repeat for review is an explicit preview override. Pause, 50ms step, time scrub,
speed, magnification and bone overlay are available. Camera bounds stay stable
within an action. Original PNG exports are available for comparison, using evenly
spaced frame indices because their files contain no per-frame timing metadata.

The default **Normal walk · unarmed** derives from the authored `Walk_bat`.
It preserves that walk's complete upper-body bone hierarchy, image selection,
local transforms, pivots, handedness, native scales and interpolation. The bat
is embedded in a hand image: only that image is replaced with an empty fist,
registered to its authored wrist. The other empty hand stays unchanged.
Legs reuse the authored `Walk_riffle` hierarchy and alternate leg-image switches.
Original source files and animations remain unchanged. No synthetic IK bones,
55px forearm fitting or estimated upper-arm attachment points remain.
This is an unarmed adaptation of the bat walk, retaining its asymmetric arm
pose; a separately authored neutral arm swing is still future visual tuning.
The replacement fist's wrist registration is provisional. Death stays untouched.
There are 12 actions per character; live simulator integration remains separate.
Older local normal-walk GIFs predate this correction and are historical captures.

The optional **Normal walk limbs** selector defaults to **Plain · separate
left/right** when `plain-limbs-v01/index.json` is available. Switch to Authored
parts for comparison. This changes only normal-walk images; bone transforms,
scales and image pivots remain authored. Original weapon actions stay unchanged.
The workbench also lists each limb as an independent part. Click the thumbnail
**Limb options** tiles to the right of the playback canvas to swap each upper arm,
lower arm and leg independently on each side. Upper arms offer Authored, Plain,
Short sleeve and Long sleeve; lower arms offer Authored, Plain, Bare and Sleeved;
legs offer Authored, Plain and Compact (both stride frames switch together). Compact
uses 40% image size anchored at the top center inside the same PNG frame to
reduce rear foot exposure without enlarging the shirt back. This optional visual
fit is provisional; the bone transforms and source pivots remain unchanged. Mixed choices
show Custom in the preset selector. Tiles move below the canvas on narrow screens
and are disabled for authored weapon actions.

The **Torso** tiles offer **Authored** and **No backpack** for Man and Girl.
The Plain preset uses No backpack. These local torso copies remove the pack and
straps, joining the retained native garment shapes into a smooth shirt surface.
They retain the original PNG frame and pivots and use shirt material ID1 for
recoloring. The misplaced added neck patch has been removed; no skin is painted
onto these torso variants. Chest detail faces forward along
the head rather than rotating 45 degrees across the body. The shirt silhouette
itself is rotated 45 degrees counterclockwise within the unchanged source frame and
shifted slightly right to register under the head; no back extension is added.
The silhouette and shading are provisional clothing bases;
collars, seams and profession-specific equipment can be added later. Torso swaps
leave arm, leg and head selections alone and apply only to normal walk.

Six provisional **Torso** clothing studies are available for both characters:
Technician utility shirt, Scientist lab jacket, Medic field tunic, Scout field
jacket, Soldier protective vest, and Diplomat tailored jacket. They add vector
collars, seams, pockets, panels and accent details to the backpack-free base;
they are visual studies rather than profession equipment definitions. Combine
them with independent Bare/Sleeved forearms and Short/Long upper arms. Existing
shirt, gear, harness and accent controls recolor their separate mask channels.
Heads may obscure small chest details at the authored top-down angle.
The Time slider and frame status sit directly below the playback canvas in its
own column, even when the clothing sidebar is taller than the viewer.
Backpack-free torso choices also fit the shoulder roots to the shirt sides and
rotate upper arms to mirrored 15-degree angles from vertical, with forearms
angled five degrees inward for matching elbow bends. Upper-arm pieces retain
their original sides, and each segment type fits to its own paired average:
the longer upper arm shrinks while its shorter forearm grows, with the inverse
correction on the other side. Image offsets and joint spans scale with each
piece to preserve shoulder/elbow registration. Forearms use the pair's average
native length, with uniform image and attachment-offset scaling that preserves
aspect ratio and image pivots.
Body bob, head motion and leg timing continue. Arm image registration stays
constant relative to each joint, removing independent sleeve drift. Both fists
use consistent cuff pivots at their wrists and keep their original image sizes.
Shoulder keys include the elbow's key times so their angles stay matched
throughout the loop rather than retaining the asymmetric bat-arm pose.
Choosing Authored torso restores the original arm placement. This fitting is
limited to normal walk; original weapon animations remain unchanged.
The right upper-arm image is reflected across its own shoulder-to-elbow axis
to correct sleeve handedness in the fitted pose. This reflects only that image,
keeping the joints, forearm and hand chain in place; image source and scale
magnitude remain unchanged.
Upper-arm tile thumbnails and sleeve replacements retain their original side
mapping. Authored torso comparison retains original scales.
The fitted square-shoulder walk uses separate vertical leg lanes with opposing
forward/back strides with the authored raised-knee and extended-leg image timing.
The lower leg reappears as the knee extends, without inheriting the rifle walk's
center crossing. Both image sizes attach at the same top-center hip anchor. Compact and Plain still
choose the leg image size. The reflected right sleeve interpolates its angle
between keys, preventing the former jump at 594 ms. Authored torso comparison
retains the older rifle-leg adaptation; original purchased walks are unchanged.
The fitted head is centered on the shirt at rest, with its small authored sway
and vertical bob preserved. The playback camera centers the rest-frame head at
canvas coordinate 240,240 with one fixed scale and offset for the loop. It does
not chase the moving head or resize the body as the character bobs. Each leg has named hip, knee and ankle bones on its own lane;
top-center PNG attachment pivots keep thighs above boots, with original source orientation.
Knee and ankle markers always extend forward/down from the hip instead of
reversing direction when the stride crosses zero. The hips and pelvis sit farther back at the shirt midpoint. The pelvis control is rebased
within the body with compensating child offsets, preserving the rendered pose.
Shoulder roots stay level and symmetric around the shirt center throughout the
cycle; corrected upper-arm sizes and matched forearm lengths remain fixed through the loop. Authored torso
comparison retains the original lengths and scales.
Shoulder roots sit near the outer shirt edges at .08/.96 of the source frame,
at .48 height. Sprite scales stay unchanged; the arm chains translate outward
with their pivots. Stride phases
match the authored image-extension timing: screen
left advances and extends at 198 ms, screen right at 594 ms. Image sources remain
on their original sides; the corrected motion phase keeps the visible foot on
the advancing leg.
Unused old bat/rifle leg bones are removed from this derived overlay. Hip
positions and stride amplitude remain provisional visual fitting.
`clothing_surfaces.py` defines the editable vector overlays; the exporter saves
PNG/mask entries and overlay SVGs in the ignored local pack.

Man and Girl each have separate left/right short- and long-sleeve upper arms and
forearms. Short sleeves expose the distal upper arm and forearm; long sleeves
cover both with shirt material ID1. Exposed skin uses ID5. Derived forearms omit
wrist wraps, cuff accessories and pouch details. Color controls update both the
selected parts and tile thumbnails.
Sleeve hem placement is a provisional halfway-upper-arm mask boundary, preserving
the source silhouette and pivots rather than claiming final garment artwork.

Generate the local set from the purchased native Illustrator source:

```bash
python demos/character-sheet-preview/prepare-plain-limbs.py
```

The exporter creates 54 independently editable PNGs and masks under
`artwork/zombie-tds-main-characters/plain-limbs-v01/`: left/right upper arms,
forearms and long/short leg frames for Man and Girl, plus eight sleeve parts per
character (two styles × two sides × upper arm/forearm), plus two backpack-free
torsos with editable SVG surfaces, twelve profession tops and eight compact leg
images (both stride frames on each side). Left/right labels refer to
the preview's image sides. Reviewed native vector pouch paths and the Girl's
upper-arm tattoo paths are excluded. Plain upper arms use shirt material ID1;
existing bottom color controls recolor them. Upper-arm bands are treated as cloth
shading. Clean forearms use editable SVG surfaces based on smoothed source alpha
outlines, with skin or shirt masks and no accessory channels. Their surface
shading and silhouette smoothing are provisional. Source dimensions
and pivots are retained; vector crop registration and appearance need visual
approval. `before-after.png` compares every original and derived part.
The exporter checks the Illustrator source hash before using reviewed path
indices. All derived artwork stays in the ignored local purchased pack.
Generation requires PyMuPDF, Pillow, NumPy and OpenCV. Forearm PNG alpha is
rasterized from a solid SVG silhouette because the local PDF converter does not
preserve SVG clip paths; shading is then sampled inside that silhouette.

The workbench lists all 196 imported SCML parts, including both characters'
bat parts and entries unused by the selected animation. Add, drag, rotate, scale, edit pivots, select layers, bring forward,
remove and clear. Initial standalone pivots come from SCML file metadata; animated
keys may override them. Workbench edits are static pose studies and do not modify
the source skeleton. Download pose study saves transforms/local references only;
reload clears tab state. No live profession, simulator or rig registry changes.

Place your purchased pack under `artwork/zombie-tds-main-characters/`, then:

```bash
python demos/character-sheet-preview/import-pack.py
```

The importer reads SCML with Python's standard library and writes local
`preview-data.json` within the pack. Original files are untouched. It rejects
missing/unsafe image references and unsupported timeline curves. The pack's Girl
`Walk_FireThrhrower` folder is explicitly matched to SCML `Walk_firethrower`.
All 22 authored sequences and 158 exported frames are present.

The purchased folder, its generated JSON and older derived preview-sheet study
are excluded from Git. See the supplied License.txt / CraftPix terms. The `.ai`
vector sources remain available locally for later appearance/mask work; this
plain limb exporter uses reviewed native vector paths for local variants. The local technician PNG recolor and
its report remain excluded with the purchased pack. Preview code can be committed separately
without distributing purchased assets; other checkouts need their own pack.

Checks:

```bash
node --test demos/character-sheet-preview/*.test.mjs
node demos/character-sheet-preview/browser-smoke.mjs
```

Purchased-data and historical extraction tests skip when their local assets are
absent; mathematical rig tests run without them. Browser smoke requires the local
pack and blocks all writes except test telemetry. Set `CHARACTER_REVIEW=1` in Git
Bash to capture temporary rig/PNG comparison images for visual review.

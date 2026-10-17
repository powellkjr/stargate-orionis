# Offworld production-art ingestion contract

Authoritative for polished assets on `offworld-2d-sprite-renderer`. This supersedes
provisional final-art sizing/workflow advice in [SPRITE_ASSETS.md](SPRITE_ASSETS.md),
which remains the renderer overview. Verified against the manifest, renderer,
map/layout and 31 current SVG placeholders at pushed commit `8af9dec`.
The registry now also includes 19 room-simulator placeholders, for 50 shared
assets. [Room sprite requirements](../room-sandbox/SPRITE_REQUIREMENTS.md) list
coverage for all 17 room types and 13 geology states. The same contract applies;
this asset-list extension does not yet switch the room renderer to sprites.

## Modular room-kit art contract — October 13, 2026

The [provisional modular art contract](../../docs/offworld-modular-room-visual-kit-contract.md)
supersedes fixed-door whole-room overlay authoring for new modular kits and the
CT arithmetic in the [preserved v2 handoff](../../docs/offworld-modular-room-visual-kit-handoff-v2.md).
The dedicated `room-kit-prompts` exporter now generates six semantic templates,
three coordinated families, source metadata and a measured guide for base rooms.
Initial Receiving/Material Storage queue: `artwork/room-kit-prompts-v1/`.

Each piece retains a registered 1024-square true-RGBA source and planned 128-square
runtime frame; 128-unit cells use 32/64/32 bands and cell-center rotation.
Retain lossless PNG, source provenance and deterministic normalization. Never
crop/recenter these registered pieces. CT1 = 8/8/8 amber, CT2 = 4/6/4/6/4 blue,
CT3 = 4/16/4 purple: every period is 24 units, exposed through the same continuous
5-unit transparent channel in neutral wall art. No tier colors are baked in.

Complete-kit delivery is 18 source PNGs under a matching
`orionis-room-kit-<kit-id>-bNNN` ZIP/root, as specified in the art contract.
Preparation, complete-family ingestion and renderer adoption remain pending;
ordinary ZIP installation cannot accept these as a family. Existing whole-room
overlays remain legacy working assets. No final art is generated or installed.
See the [plan](../../docs/offworld-modular-room-visual-kit-plan.md) for remaining
Transition binding, family selection and composition work.

## What to deliver

### Whole-sprite design variants (v5 prompt queue)

Use `artwork/sprite-prompts-v5/` for new whole-sprite batches. Each prompt now
assigns three shape/design styles: clean angular, soft rounded, and chunky
layered/utilitarian, with natural/floor-specific equivalents. Keep the palette
fixed; change major contours, panel/seam organization and garment/component
shapes, not just colors. Review differences at runtime size and in grayscale.
Rendering style, camera, scale, footprint envelope, public subject and equipment
inventory stay consistent. Matching portraits reproduce their own overhead
variant's design. Door/Gate frame pixels match within each state pair, while
designs may differ between variants. Floors retain authored state and seamless
coverage; featureless subjects must not gain invented details merely for variety.

Older prompt queues and all downloaded art are preserved. This queue is for
whole sprites, not independent registered rig/head-kit layers; those workflows
remain separate and unchanged. Prompt wording is not proof of generated-art
compliance; review actual images before installing them.

Installed art now forms per-key variant pools. Offworld selects by public asset
key and persistent presentation identity when the map loads/deploys/resets;
redraw/movement preserves the choice. Door/Gate states share one matching variant.
Rejected installed sources are disabled for future map loads without deleting
their PNGs. Existing older installations can be recovered through `variants-refresh`
using pixel matching to saved sources. Downloaded previews alone are not eligible.

### Standalone centering and transparent-background cleanup

The existing Pillow worker can normalize an isolated PNG without Node or a JSON
configuration. From the repository root (Pillow is already the optional art-tool
dependency):

```sh
python demos/offworld-sandbox/prepare-sprite.py center input.png --out centered.png
python demos/offworld-sandbox/prepare-sprite.py center input.png --out centered.png --size 1024x1024 --padding 64
python demos/offworld-sandbox/prepare-sprite.py center input.png --out centered.png --background '#ffffff' --tolerance 5
```

Default output is 128x128 RGBA with an 8px transparent border. The tool crops
nonzero-alpha bounds, preserves proportions, fits within the padded canvas and
centers those bounds (within one pixel for odd dimensions). Existing translucent
pixels/shadows remain part of the bounds. Originals cannot be overwritten;
replacing a separate output requires `--overwrite`. No art is installed/activated.

Opaque sources require an explicit `--background` RGB hex color. Only matching
border-connected pixels are removed; enclosed same-color details are preserved.
Tolerance is the maximum difference in each RGB channel, 0..255, default 0.
This is solid-color cleanup, not AI segmentation: checkerboards, textured
backdrops, enclosed backdrop holes and baked edge-color halos need manual review.
Use a distinct backdrop color; matching subject pixels touching it may be removed.

Use the manifest-backed `prepare-sprite.mjs prepare <key> ...` workflow for
runtime-specific dimensions (including 128x12 walls and 256x256 Gates). It also
accepts `--background`/`--tolerance` for isolated sprites. Floors remain opaque;
Door/Gate pairs retain shared canvases; head-kit/rig parts must never be centered
independently. Use their dedicated registered workflows instead.

The optional seven-part animation rig has a separate
[Character rig contract](CHARACTER_RIG_CONTRACT.md). Start its one-technician
proof with `artwork/sprite-prompts-v4/rig-proof/`; use `rig-prepare`, not ordinary
per-sprite normalization. All layers share a full-canvas resize and fixed pivots.
This rig has head-owned neck overlap, superseding the older head-kit split for
rig assets. Its registry is empty until reviewed art is explicitly selected.

### Registered head-kit source requests

`artwork/sprite-prompts-v4/head-kit/README.md` lists six ordered prompts.
First attach one approved character overhead PNG and its matching portrait;
approve full-canvas head-free body and bald-head templates plus measured
registration.json. Then generate registered hair, beard and eyewear layers.
Head-shape alternatives and glasses are optional. Skin uses the skin channel,
hair/beard the hair channel and eyewear frames the gear channel. Lenses remain
separate translucent overlays. None/bald/clean-shaven means omitting a layer.

All views retain their reference's 1024 canvas and attachment positions. Never
normalize/crop head parts independently. Hair and eyewear initially fit the
approved base head; extra head shapes require reviewed fitting. Reconstructed
neck/clothing pixels under the removed head are provisional visual art, not
new game data. Kit ZIPs have their own explicit filenames and are not accepted
by current sprite/profile ingestion. Generated palette colors are material
regions; matching pixel masks still require authoring and validation.

Regenerate to a new folder with
`node demos/offworld-sandbox/prepare-sprite.mjs head-prompts --out artwork/head-kit-next`.
Existing prompt files are preserved by refusing overwrite.

### Character material colors and matching profile pictures

Character source prompts now use a consistent material palette across all nine
people keys: shirt RGB(146,147,148), trousers RGB(82,111,137), harness
RGB(186,169,141), gear/gloves/boots/pads RGB(52,58,64), accents RGB(227,165,46),
display-only RGB(0,217,238), skin RGB(213,155,112), hair/beards RGB(112,67,34).
Each matte material uses five exact tones formed by adding -32, -16, 0, +16,
+32 to each base channel, clamped to 0..255. The prompts list every triplet.
Outlines use RGB(20,22,24); separate lenses use RGB(200,210,220), alpha 0..80,
and sparse RGB(240,244,248) highlights, alpha at most 128. Use simplified shading,
not continuous gradients or colored bounce light. These are recolorable source
material colors, not canonical Profession colors or final appearance choices.
RGB compliance requires pixel inspection and, where necessary, region-aware
quantization; a generation prompt alone does not establish compliance.

The refreshed complete queue is `artwork/sprite-prompts-v4/`. Existing v3
character prompts were updated too; their non-character prompts are preserved.
Both queues include `profiles/<character-key>-profile-prompt.txt`. Generate the
overhead batch first, then attach its three final PNGs with the matching profile
prompt. Profiles are eye-level front-facing head-and-shoulders portraits, not
side views. Variant IDs, hair/skin/clothing/accessories and colors must match.
For existing downloads, retain identity/geometry but normalize BOTH new matched
views to the strict source ramps. Preserve the original files. Skin/hair colors
in these source masters are consistent material channels for later recoloring.

Portrait delivery is a separate `orionis-<key>-bNNN-profiles.zip`, with the same
named root and exactly three `<key>__vNN__profile-source.png` files. Each is a
1024x1024 true-RGBA source master. Use the overhead batch number; do not add
portraits to its ZIP. Profile keys are not registered runtime assets: viewer,
installer and strict overhead unpacking do not ingest these portraits yet.
Matching portrait masks/integration remain a later wave. Do not ask image
generation to invent a separately aligned segmentation mask.

Choose **B: high-resolution source art, then deterministic normalization**.
Request **1024×1024 single-frame PNG** for every source, including walls. Retain
`<key>__vNN__source.png` outside the runtime asset directory (NN=01,02,03). For the simulator supply
`demos/shared/sprites/offworld/production/<key>.png`, normalized with the tool
below. No sprite sheet, animation frames, alternate directions or sidecar JSON
is required. Keep source masters for reprocessing; they are not runtime assets.

Transparent sources must be true **RGBA** PNGs with actual transparent pixels,
not checkerboards, white backdrops or palette PNGs. The tool cannot remove a
painted background. Floor sources may be RGB or RGBA but must be fully opaque.
Use ordinary sRGB art; the tool does not color-manage an arbitrary embedded ICC
profile. It strips source metadata from output. Output is always single-frame
RGBA PNG, including opaque floors. Use lossless PNG, never JPEG renamed to PNG.

1024 is a recommended generation/master size, not a hard ingestion limit.
Larger PNGs are accepted up to 16 megapixels and 32 MiB. Runtime assets are capped
at 1 MiB each. Byte reproducibility is guaranteed for the same input/settings and
Python/Pillow/zlib environment; archive the sources and pin Pillow 11.3.0 when
reproducing across machines. Library/compressor upgrades may change PNG bytes.

## Variant batches and strict ZIP delivery

### Image generation and packaging workflow

For ordinary transparent assets, generate one intermediate reference sheet with
exactly three variations arranged horizontally in clearly separated columns.
Each column contains one complete unclipped subject on a transparent background,
following the locked Stargate Orionis art direction. Preserve the same overhead
camera, lighting direction, scale and footprint; vary only secondary details,
restrained accents or permitted public appearance.

Extract each variation, remove surrounding background while preserving true RGBA
transparency, and center it on its own 1024×1024 transparent canvas without
stretching. Validate transparency, padding, dimensions and complete silhouettes.
Save the three named source PNGs below, package them under the matching ZIP root,
verify the ZIP and provide a clickable download link. The intermediate sheet,
previews and all additional files must stay out of the archive.

**Exceptions:** Seamless floors use three separate opaque full-canvas sources and
the edge/repeat checks, not transparent sheet extraction. Registered Door/Gate
state pairs use six source PNGs with shared canvases and identical frame pixels;
never independently crop or recenter their states.

Request **three candidates**, `v01`, `v02`, `v03`, each time. Variation can change
surface details, restrained accents or public character appearance. Preserve
camera, lighting, scale, footprint, role palette and hidden-identity boundaries.
A variant is an art candidate, not a new item/role or gameplay state. The current
renderer still selects one resource per key; runtime random variation is not added.

Archive name: `orionis-<group>-b001.zip`. Increment the positive three-digit batch
number (`b002`, `b003`) for later attempts; never silently overwrite a batch.
Use exact lowercase spelling and hyphens from existing manifest keys. ZIP root
folder has exactly the archive stem. PNG filenames use double underscores:
`<key>__v01__source.png`, `...v02...`, `...v03...`.

Ordinary example:

```text
orionis-crate-b001.zip
  orionis-crate-b001/
    crate__v01__source.png
    crate__v02__source.png
    crate__v03__source.png
```

State-pair groups are **door** and **gate**, never door-open/gate-open. Each ZIP
contains six files, with matching state files for every variant:

```text
orionis-door-b001.zip
  orionis-door-b001/
    door__v01__source.png
    door-open__v01__source.png
    door__v02__source.png
    door-open__v02__source.png
    door__v03__source.png
    door-open__v03__source.png
```

Gate batches use the identical structure with `gate` / `gate-open`. Lock each
variant's frame and registration across its states; select both from the same
variant number. Ask for an actual downloadable ZIP containing separate source
PNG files, not a contact sheet or an image of file names. Do not include previews,
metadata files, nested subfolders or other assets. If the chat cannot create
ZIPs, it must say so and supply separately named PNGs; ZIP export is a capability
requirement, not something image generation alone guarantees.

Unpack deterministically from the repository root:

```powershell
node demos/offworld-sandbox/prepare-sprite.mjs unpack C:/art/orionis-crate-b001.zip --out artwork/sprite-sources
node demos/offworld-sandbox/prepare-sprite.mjs prepare crate artwork/sprite-sources/orionis-crate-b001/crate__v02__source.png
```

Unpacking validates the complete batch before writing files: strict ZIP/member
names, exactly three candidates (six paired), 1024-square single-frame PNGs,
opaque floors or actual RGBA transparency, complete companions and size limits.
Unsafe paths, symlinks, encrypted members, duplicate entries, additional files,
oversized files and existing destinations fail. ZIP limit is128 MiB, total
uncompressed limit192 MiB and per-source limit32 MiB. It does not trust archive
paths for extraction. Pair pixel/alpha registration still requires normalization
and the existing pair validator; presence of both sources alone cannot prove it.

After choosing a variant, normalize to the **same canonical runtime filename**
as before. For a pair, prepare both selected vNN sources, then validate the pair.
The tool never picks a variant or switches the manifest automatically. Keep all
candidates/master ZIPs outside the runtime sprite directory.

## Verified renderer values and exact runtime files

One logical cell is **100 SVG world units**. The normalized pivot is **[0.5,0.5]**.
All ordinary production canvases are **128×128 pixels**, Gate canvases are
**256×256**, and walls are **128×12**. Corners actually render at **8×8 world
units** (the provisional manifest said 10; the Stage renderer explicitly used 8).
The Gate SVG placeholders had a 128-square viewBox; 256 is the production PNG
requirement, not an existing placeholder dimension. Camera zoom scales images;
source pixels never become gameplay geometry. No atlas support is required.

Every table row is a required exact filename when replacing that manifest key.
Existing placeholders remain in use until a PNG passes validation and `src` is
explicitly switched. The tool does not auto-install or edit the manifest.

| Family / manifest key | Runtime filename | Runtime pixels | Display world units | Alpha / border | State partner |
| --- | --- | --- | --- | --- | --- |
| floor / `floor-indoor` | `floor-indoor.png` | 128×128 | 100×100 | Opaque; no padding | None |
| floor / `floor-lab` | `floor-lab.png` | 128×128 | 100×100 | Opaque; no padding | None |
| floor / `floor-outdoor` | `floor-outdoor.png` | 128×128 | 100×100 | Opaque; no padding | None |
| floor / `floor-fog` | `floor-fog.png` | 128×128 | 100×100 | Opaque; no padding | None |
| wall / `wall` | `wall.png` | 128×12 | 100×10 | RGBA; 0px transparent minimum | None |
| corner / `corner` | `corner.png` | 128×128 | 8×8 | RGBA; 8px transparent minimum | None |
| door / `door` | `door.png` | 128×128 | 32×32 | RGBA; 8px transparent minimum | door-open |
| door / `door-open` | `door-open.png` | 128×128 | 32×32 | RGBA; 8px transparent minimum | door |
| fallback / `unknown` | `unknown.png` | 128×128 | 24×24 | RGBA; 8px transparent minimum | None |
| character / `civilian` | `civilian.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `worker` | `worker.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `guard` | `guard.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `soldier` | `soldier.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `scout` | `scout.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `technician` | `technician.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `scientist` | `scientist.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `medic` | `medic.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| character / `diplomat` | `diplomat.png` | 128×128 | 22×22 | RGBA; 8px transparent minimum | None |
| Gate / `gate` | `gate.png` | 256×256 | 56×56 | RGBA; 16px transparent minimum | gate-open |
| Gate / `gate-open` | `gate-open.png` | 256×256 | 56×56 | RGBA; 16px transparent minimum | gate |
| medium technical prop / `console` | `console.png` | 128×128 | 26×26 | RGBA; 8px transparent minimum | None |
| large machine / `generator` | `generator.png` | 128×128 | 30×30 | RGBA; 8px transparent minimum | None |
| large machine / `test-rig` | `test-rig.png` | 128×128 | 30×30 | RGBA; 8px transparent minimum | None |
| small prop / `crate` | `crate.png` | 128×128 | 24×24 | RGBA; 8px transparent minimum | None |
| medium technical prop / `bed` | `bed.png` | 128×128 | 26×26 | RGBA; 8px transparent minimum | None |
| small prop / `terminal` | `terminal.png` | 128×128 | 24×24 | RGBA; 8px transparent minimum | None |
| small prop / `evidence` | `evidence.png` | 128×128 | 24×24 | RGBA; 8px transparent minimum | None |
| medium technical prop / `medical` | `medical.png` | 128×128 | 26×26 | RGBA; 8px transparent minimum | None |
| small prop / `security` | `security.png` | 128×128 | 24×24 | RGBA; 8px transparent minimum | None |
| small prop / `rock` | `rock.png` | 128×128 | 18×18 | RGBA; 8px transparent minimum | None |
| small prop / `vegetation` | `vegetation.png` | 128×128 | 18×18 | RGBA; 8px transparent minimum | None |

Room additions: all 13 `floor-base-*` keys listed in the linked room requirements
use 128×128 runtime / 100×100 world / opaque / zero padding. `containment-cabinet`,
`storage-rack`, `research-desk` and `workbench` use 128×128 / 30×30 world / RGBA /
8px padding. `bunk` and `holding-bench` use 128×128 / 26×26 world / RGBA / 8px padding.
All are centered, direct overhead, without separate directional or state variants.

All nonfloor assets use a transparent canvas. Even a wall that fills its strip
must be RGBA; its border requirement is zero so adjacent strips can meet cleanly.
The entire isolated subject, antialiasing and contact shadow must fit inside the
safe area. Ordinary safe rectangle is [8,8,120,120) in runtime pixels; Gate is
[16,16,240,240). Alpha outside the safe rectangle must be exactly zero. Empty
transparent sprites fail validation. There is no required numeric opaque-area
percentage: tall/narrow shapes retain their aspect ratio rather than stretching.

## Per-family composition, orientation, padding and shadows

- **Floors:** north up, full opaque canvas, no border or shadow. Seamlessly match
  opposite edges. Paint only the floor/ground material: no furniture, characters,
  doors, perspective, room-specific truth or UI. `floor-fog` must stay neutral and
  cannot identify hidden rooms. No rotation or directional variants needed.
  Use uniform diffuse illumination across the entire tile, with no bright corner,
  dark edge, vignette or broad directional gradient. Inspect a 3×3 repeat for
  pattern, color and brightness continuity. Square dimensions do not prove tiling.
  Indoor flooring uses light neutral cool-gray matte panels, sparse thin seams
  and barely visible surface variation. Avoid frames, vents, light strips,
  emissives, bolts, large cracks and heavy grunge; the floor should remain quiet
  beneath characters and props.
- **Wall:** horizontal long axis on the source square; request an isolated strip
  with visible alpha bounds approximately 960×90 source pixels (128:12 ratio).
  The tool crops alpha bounds and fits 128×12 without stretching. Avoid raised
  front faces: paint the wall top, subtle bevel, no tall vertical facade. Its
  source endcaps must tile when repeated; rounded/end-shadow gaps require manual
  art correction, which normalization cannot infer. Zero runtime border.
- **Corner:** square top-down junction centered in its 128-square canvas. An 8px
  transparent runtime border is required. Prefer symmetric corner-post art
  because the renderer currently does not rotate individual corners. No N/E/S/W
  variants; no shadow extending into neighboring rooms.
- **Closed/open doors:** square source canvas, horizontal threshold/frame across
  left–right. Paint directly overhead, not a standing front-facing door. Use the
  registered pair geometry below; no independent trimming. 8px runtime border.
- **Characters:** one neutral north-facing overhead image for each of the nine
  existing role keys. No portraits, weapon aiming poses, new faction insignia or
  animation library. 8px border, including a tight centered contact shadow.
  The neutral civilian also supplies the unknown-person fallback; never portray
  the undercover operative's hidden identity in this art.
- **Small props / fallback / optional outdoor resources:** one isolated north-up
  subject, transparent background, preserve aspect ratio, 8px runtime border.
  Props show public appearance only. `unknown` is a neutral readable unknown
  object rather than a recognizable hidden weapon or named person.
- **Medium technical props:** same isolated 128-square rules, shown at 26 world
  units. Consoles must show their top/control surface directly from above: no
  front display panel presented to the camera, large side face or isometric tilt.
- **Large machines:** same 128-square source/output rules, 30 world units; use a
  chunky overhead silhouette and restrained cyan/amber emissive areas. Physical
  item Reality/Theory cannot determine visual identity. No directional variants.
- **Gate / Gate open:** north up on the same 1024-square master canvas, 256-square
  runtime, 16px runtime border. An overhead ring is the approved current view;
  do not introduce a standing/isometric Gate without a separate visual review.
  Include the cyan energy surface in `gate-open.png`. No separate effects layer
  or Gate animation required. No rotation/directional variants.

Global art direction: bright clean chunky stylized 2D sci-fi; mature proportions,
simplified painted materials, low visual noise, direct overhead rather than
isometric, controlled cyan and amber accents. Use soft upper-left lighting on
fixed props; floors instead use uniform diffuse lighting. Shadows must be tight, centered and translucent; never bake a long
upper-left-to-lower-right ground shadow or opaque background into an asset.

## Pair registration: doors and Gate

Both images in each pair MUST share canvas size, center pivot, orientation,
outer alpha bounds, frame footprint, scale and identical outer-frame pixels.
Only the door leaf/opening or Gate energy interior changes. Keep the outer frame
as a locked layer when generating/editing the companion; independent text-to-image
outputs rarely register exactly and may require deterministic art-editor alignment.
The tool does not semantically reconstruct frames or remove doors.

**Door master:** 1024×1024. Outer frame bounding rectangle is
[x=112,y=320,right=912,bottom=704), centered at (512,512), width 800 and height 384.
The opening is [256,352,768,672). At 128-square runtime the geometric frame maps
to [14,40,114,88), opening [32,44,96,84). Use solid outer edges and identical
antialiasing for both states; preserve at least 96 source pixels of transparent
border to accommodate resampling. Do not bake a floor into the open aperture.

**Gate master:** 1024×1024. Ring outer bounding rectangle is
[112,112,912,912), centered (512,512). Runtime geometric outer bounds are
[28,28,228,228) on the 256-square canvas. Keep the same ring/body/support pixels
in both states. Open energy stays inside the ring and cannot enlarge the outer
alpha bounds. Leave at least 96 source pixels of transparent border; geometric
registration may acquire identical antialias fringes after downsampling.

Validation checks identical alpha bounds as well as dimensions and padding.
It cannot prove painted frame pixels align or lighting/camera quality; inspect
an overlay/blink comparison at 1:1 and at runtime scale before installation.

## Rotation and minimum character contract

Retain programmatic rotation for **walls and doors (0/90 degrees)** and
**down/dead characters (90 degrees)**. Existing code can also rotate a down/dead
instance; no new art behavior is introduced. For these assets use subtle,
rotation-tolerant bevel highlights and a centered contact shadow, so rotating
upper-left painted highlights produces only a small accepted lighting difference.
Strong directional painted shadows would be unacceptable under this contract.
Do not request N/E/S/W variants for the first benchmark. Fixed floors, corners,
props and Gate do not need variants or animation frames.

One character per role is sufficient. Stationed, hostile, surrendered/captured,
dialogue attention, suspicion and confrontation remain existing renderer/UI
rings, dots and bars. Down/dead remains a rotated static image; this prototype
accepts that modest pose/lighting compromise without adding animation requirements.

## Deterministic preparation, validation and installation

The optional offline command uses Node plus **Python 3 and Pillow 11.3.0**.
Pillow is already available in this development environment. No Node package or
heavy image stack was added. If needed on another machine, explicitly install
`python -m pip install Pillow==11.3.0`; `SPRITE_PYTHON` can select that interpreter.
The browser/demo itself does not depend on Python/Pillow. Node built-ins alone
cannot decode/resample arbitrary PNGs with the required alpha handling reasonably.

From the repository root:

```powershell
node demos/offworld-sandbox/prepare-sprite.mjs prompt console
node demos/offworld-sandbox/prepare-sprite.mjs prepare console C:/art/console-source.png
node demos/offworld-sandbox/prepare-sprite.mjs validate console demos/shared/sprites/offworld/production/console.png
```

Default output is `demos/shared/sprites/offworld/production/<key>.png`. Override
with `--out <directory>/<key>.png`; canonical filename is enforced on preparation.
Existing output requires explicit `--overwrite`; the original source cannot be
replaced. The command performs no generative processing, semantic cropping,
background removal, perspective correction, color relighting or image upscaling
by an AI. Preparation may mathematically upscale small source art; prefer 1024
masters to avoid that quality loss.

- Isolated sprites: crop exact nonzero-alpha bounds, retain aspect ratio, Lanczos
  fit into safe rectangle, center on a transparent output canvas. Include contact
  shadow in those bounds. Asymmetric art will be centered by alpha bounds, not a
  semantic body anchor; reposition in the source editor if that is undesirable.
- Floors: resize the whole square opaque source, no trimming/stretching.
- Wall: crop isolated strip alpha, fit 128×12; no invented edge extension.
- Door/Gate: resize the WHOLE shared square canvas, no independent alpha cropping.
  This is essential for alignment. A source with insufficient padding fails.

Prepare both state sources into the same output directory:

```powershell
node demos/offworld-sandbox/prepare-sprite.mjs prepare door C:/art/door-source.png
node demos/offworld-sandbox/prepare-sprite.mjs prepare door-open C:/art/door-open-source.png
node demos/offworld-sandbox/prepare-sprite.mjs validate door demos/shared/sprites/offworld/production/door.png
```

The first preparation can report PAIR PENDING; this is not permission to install
half a pair. `validate` requires its canonical companion. `--pair <partner.png>`
may locate a companion elsewhere for validation, but install both in production.
The same commands apply to `gate` and `gate-open`.

After successful per-asset/pair validation, explicitly change only that manifest
entry's `src` to `../shared/sprites/offworld/production/<key>.png`. Switch both
pair entries together. Keep runtimePixels, displaySize, size and pivot unchanged.
Then run:

```powershell
node demos/offworld-sandbox/prepare-sprite.mjs validate-manifest
node --test demos/offworld-sandbox/*.test.mjs
node demos/offworld-sandbox/browser-smoke.mjs
```

Manifest validation checks that every current path exists, file type, runtime
PNG dimensions, required RGBA mode, opaque floors, alpha border, nonempty sprite,
1 MiB limit, and canonical PNG companion registration. Existing SVG placeholders
are checked for existence/size/XML; they are intentionally not production PNGs.
Do not point a manifest entry at a high-resolution master. Floor seamlessness,
frame correspondence, public visual identity and camera/lighting require visual QA.
No runtime/gameplay file or authored mission data changes are needed.

## First production batch — 12 existing keys, in order

All source requests are **1024×1024 PNG**. Deliver the exact filenames below in
`demos/shared/sprites/offworld/production/`. Follow horizontal strip/pair geometry
above rather than asking the generator to output 128px natively.

| Order | Key / exact target filename | Runtime pixels | World size | Background | Orientation | Partner |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `floor-indoor` / `floor-indoor.png` | 128×128 | 100×100 | Opaque | North up overhead | None |
| 2 | `floor-outdoor` / `floor-outdoor.png` | 128×128 | 100×100 | Opaque | North up overhead | None |
| 3 | `wall` / `wall.png` | 128×12 | 100×10 | RGBA transparent | Horizontal base | None |
| 4 | `corner` / `corner.png` | 128×128 | 8×8 | RGBA transparent | North up overhead | None |
| 5 | `door` / `door.png` | 128×128 | 32×32 | RGBA transparent | Horizontal base | door-open |
| 6 | `door-open` / `door-open.png` | 128×128 | 32×32 | RGBA transparent | Horizontal base | door |
| 7 | `gate` / `gate.png` | 256×256 | 56×56 | RGBA transparent | North up overhead | gate-open |
| 8 | `gate-open` / `gate-open.png` | 256×256 | 56×56 | RGBA transparent | North up overhead | gate |
| 9 | `console` / `console.png` | 128×128 | 26×26 | RGBA transparent | North up overhead | None |
| 10 | `generator` / `generator.png` | 128×128 | 30×30 | RGBA transparent | North up overhead | None |
| 11 | `worker` / `worker.png` | 128×128 | 22×22 | RGBA transparent | North up overhead | None |
| 12 | `guard` / `guard.png` | 128×128 | 22×22 | RGBA transparent | North up overhead | None |

This prioritizes facility/yard coverage and architectural coherence, Gate arrival,
technical props and the worker/guard populations already present in the benchmark.
Next batch: `floor-lab`, `crate`, remaining props and six party roles. No new mission
content is proposed. No unresolved question prevents generating under this contract.

## Exact external handoff template

Use the [Sprite Viewer](../sprite-viewer/README.md) to compare the active art and
candidate batches. Its **Load ZIP files** control opens archives directly for
review, without strict batch naming/count/dimension requirements. PNG members
still need recognized asset filenames. With the local demo server, **Save ZIP
contents to sprite-sources** saves recognized PNGs on disk and reloads them later.
Uncheck it for browser-session preview only. Saving sources does not install assets
or replace preparation/validation. Static hosting cannot save repository files.
Use the viewer's **Reject variant** button to exclude an unsuitable candidate.
Local reviews persist in `artwork/sprite-sources/sprite-review.json`; `prepare`
refuses a rejected saved source until it is restored. Approved source selection
still requires preparation, validation and an explicit active-manifest update.
The viewer's **Install variant** button performs those steps through the local
server. It installs only saved, unrejected sources; door/Gate partners come from
the same batch and variant. Registered source frames and runtime PNGs are checked
before one atomic activation-registry update. Runtime outputs live in versioned
`production/installed-*` folders, selected by `shared/sprites/active-sprites.mjs`.
Failed validation preserves the existing active art. Refresh the simulator after
installation. This is technical validation; the selected art still needs visual
review for camera, style and floor tiling.

Generate the complete upload queue with
`node demos/offworld-sandbox/prepare-sprite.mjs prompts`.
It writes 48 numbered prompt files and a checklist in `artwork/sprite-prompts/`,
covering all 50 manifest assets. The already-generated refreshed queue is in
`artwork/sprite-prompts-v2/`; the original 29-file folder is preserved. Door and Gate requests each include both matching
states; upload their one combined request rather than separate state prompts.
All prompts include provisional public appearance descriptions, not hidden item
Reality. Upload one numbered text file at a time. Use `--out <directory>` for a
different folder; batch generation refuses to replace existing prompt files.

Run `node demos/offworld-sandbox/prepare-sprite.mjs prompt <existing-key>` to emit
the prompt to the terminal. To save directly without Git Bash redirection, use
`node demos/offworld-sandbox/prepare-sprite.mjs prompt floor-indoor --out floor-indoor-prompt.txt`.
This writes UTF-8 text and replaces any existing file at the specified path. Run
the command without `--out` to emit
the filled template automatically from the verified manifest. Every asset has
an explicit public subject description; opaque floors also have a tiling check.
Below is the emitted `console` request;
for paired assets the command substitutes their exact registration geometry.

```text
BATCH PACKAGING: Produce exactly three visual variants v01, v02, v03.
ZIP FILENAME: orionis-console-b001.zip (increment b002, b003 for later batches)
ZIP ROOT FOLDER: orionis-console-b001/
SOURCE FILENAMES: console__v01__source.png, console__v02__source.png, console__v03__source.png
VARIATION: Change surface details, restrained color accents or public appearance; preserve camera, silhouette scale, pivot, lighting and footprint. State pairs must match within each variant. No gameplay/identity changes.
ARCHIVE CONTENTS: PNG source files only inside the named root; no previews, contact sheets, nested folders or extra files. Attach an actual ZIP, not an image of filenames.
If ZIP/file export is unavailable, say so and deliver separate PNG files with these exact names; do not claim an archive exists.

ASSET ID: console
OUTPUT FILENAME: console__vNN__source.png (NN=01,02,03)
SOURCE ART SIZE: 1024x1024 PNG, single frame
RUNTIME FILENAME: console.png
RUNTIME SIZE: 128x128 pixels; 26x26 SVG world units
BACKGROUND: True RGBA transparency; no baked backdrop
CAMERA: Direct overhead, north up; no isometric or front-facing surfaces
ORIENTATION: North-facing neutral overhead
VISIBLE FOOTPRINT: One isolated subject, preserve aspect ratio; tool centers its alpha bounds
PIVOT: [0.5, 0.5], canvas center
PADDING: 8px minimum transparent runtime border; normalizer supplies border for isolated sprites
SHADOW: Tight centered translucent contact shadow; no directional cast shadow or backdrop
LIGHTING: Soft upper-left, low contrast; walls/doors/characters must tolerate 90-degree rotation
ROTATION POLICY: No directional variants; fixed orientation
MATCHING ASSET: None
ART DIRECTION: Bright clean chunky mature stylized 2D sci-fi, simplified painted materials, low noise, controlled cyan/amber emissives
SPECIAL REQUIREMENTS: No UI, labels, scripts or hidden technology/identity cues
SUBJECT DETAILS: One compact sci-fi control console showing its top control surface from directly above, with a few restrained cyan/amber indicators; no readable text.
```

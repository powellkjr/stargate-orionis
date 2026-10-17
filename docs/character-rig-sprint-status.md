# Character rig sprint status

Updated October 9, 2026. Branch: `offworld-2d-sprite-renderer`.

## Current checkpoint

**Pistol/rifle poses complete for review: holding v05.** Requested by the user
after the jointed repair. [Side-by-side review](../artwork/rig-sprint/holding-proof-v05/pistol-and-rifle-review.png)
and [pose notes/GIFs](../artwork/rig-sprint/holding-proof-v05/README.md).
Both use the unchanged v04 rig and the same master/camera; pistol has a two-hand
grip, rifle has separate trigger/support grips. Two-bone IK uses estimated glove
centers and the shared JS hierarchical matrices; all four hand targets match
within 1e-8 runtime pixels. No source pack, runtime model, viewer, gameplay or
registry changes were needed. Added `artwork/rig-sprint/preview-holding-proof.py`,
v05 review PNGs/GIFs/JSON/README and documentation/navigation links.

Forearms render in front of torso/equipment for this offline proof. Generic
code-drawn weapon silhouettes sit above the arms with small grip occlusion masks;
this holding draw order is not yet installed in the live renderer. Original
closed gloves and fixed head direction are provisional: finished trigger/support
grips, weapon artwork and matching head aim remain an art pass. Bend GIFs inspect
neutral-to-held joints, with props appearing only in the final held pose.

Inspected both final poses and all 26 bend samples. No substantial detached
shirt fragments or open hips apparent. Bounds stay inside 128; no alpha>=128
detached component of >=3 pixels. Some frames contain a single isolated
resampling pixel, recorded honestly in `pose-checks.json`. Both GIFs have 24
frames; transparent static poses and 22px review thumbnails are included.
All 13 existing focused rig/renderer/prompt tests pass. Input hashes and exact
poses/matrices are recorded; active registry remains empty. Browser smoke was
not rerun for this offline-only wave; v04's earlier timeout remains unresolved.
Next: visual review of these poses, then refine grip/weapon/head art and add
reviewed holding presentation support before any explicit live activation.

## Jointed v04 checkpoint

**Repair complete for review: jointed v04**, following the user's request to fix
arm/hip defects and add separate elbows and knees. The same approved master,
camera, palette and fitted shoulder/hip pivots are preserved. No new generated
master or imagegen work. Version-2 metadata now contains eleven layers; archived
seven-part version-1 proofs remain unchanged and are rejected by current validator.

- [New WALK GIF](../artwork/rig-sprint/jointed-proof-v04/walk-proof.gif).
- [All sixteen frames](../artwork/rig-sprint/jointed-proof-v04/all-walk-frames.png),
  [shoulder/hip closeups](../artwork/rig-sprint/jointed-proof-v04/attachment-frames.png)
  and [last frame](../artwork/rig-sprint/jointed-proof-v04/walk-last-frame-review.png).
- [Layer and joint review](../artwork/rig-sprint/jointed-proof-v04/README.md).
- Sources: `artwork/rig-sources/technician-v01-jointed-proof-v04/`.
- Prepared: `demos/shared/sprites/offworld/rigs/technician-v01-jointed-proof-v04/`.
- Current requests: `artwork/sprite-prompts-v4/rig-proof-jointed/`; previous
  rig-proof queue and v03 tooling preserved in `artwork/rig-sprint/template-v03/`.

Changes: narrower arm contours remove torso-side fragments; torso retains a
continuous trouser/pelvis bridge; moving upper thighs have 12,468/12,251 hidden
pixels beneath that bridge. Arms split at elbows `[716,512]`/`[308,512]`;
legs split at knees `[600,712]`/`[424,712]`. These new joint centers are illustrated
attachment estimates. Parent matrices keep elbow/knee children attached as
their upper segments move. Shoulders, hips, neck and case pivots stay unchanged.
Each parent renders above its child's hidden proximal overlap. Joint angles are
available for presentation previews, without any new holding gameplay behavior.

WALK now alternates joint-anchored vertical foreshortening (upper arms +/-7.5%,
upper thighs +/-8%) and opposite arm/leg phase. Lateral rotation removed from
WALK. Same four interpolated phases/600ms cycle and 2-source-pixel torso bob.
All sixteen frames, last frame and enlarged attachment sheet were visually
inspected: no floating shirt scraps or detached hip joins apparent in this walk.
Each runtime frame has exactly one alpha>=128 connected component (3,434–3,442
pixels). This is measured fragment/connection evidence, not artistic certification.
Neutral source composite remains exact, all eleven source-part RGBs pass palette
checks, real preparation passes padding/format/rotation-space checks, GIF is
16 frames/600ms. Elbow/knee +/-15 diagnostics are reviewable; holding diagnostics
are now available in v05 above. Offline Pillow resampling approximates browser SVG.

Files touched: rig model/prompt module, rig renderer, rig-specific Python
normalizer/tests, sprint tooling/docs/artifacts and REPO_MAP. Shared
`prepare-sprite.mjs` changes only rig-prompts default queue and dynamic count;
viewer/variant operations and the other session's edits are preserved. No
CURRENT_TASK, sprite-viewer, gameplay, active registry or original master edits.

Validation: 13 focused rig/renderer/prompt tests pass, including new checks that
child attachments follow rotating parents and WALK has no x displacement or
lateral rotation. Real-source verification and Node syntax/diff checks pass.
Python AST checks pass; real version-2 source metadata exactly matches the prompt
metadata and prepared runtime pivots/z order; active registry verified empty.
The isolated Offworld Edge browser smoke was attempted twice; both stopped at
`CDP timeout: Runtime.enable` before page assertions. Browser regression is
unverified for this wave; the smoke harness/viewer was not altered to bypass it.
Next: user reviews v04 animation and joint diagnostics; repair any requested
art changes, then activate only after explicit review. Current registry empty.

## Previous v03 checkpoint — historical

**Latest visual feedback:** user identifies torso/shirt fragments carried by
the arm layers, insufficient hip coverage and lateral splaying instead of a
forward/backward walk. Extracted and inspected actual GIF frame15 of16 in
`artwork/rig-sprint/preferred-master-v01/walk-last-frame-review.png`; inspected
the separate-layer sheet as well. Stray grey fragments between arms/torso and
weak upper-leg attachment transitions are visible. v03 fails the current visual
review despite neutral pixel equality. Do not activate it.

Next repair must separate sleeves (arm-owned) from torso shirt pixels, replace
irregular extrapolated attachment patches with clean hidden shoulder/upper-thigh
coverage, retain a continuous pelvis under the torso, and change WALK to mainly
forward/backward motion for the selected camera. Neutral equality does not prove
animated seams. The earlier observation about stiff shading understated these
defects. This inspection changed no layers, sampler or renderer.

**User decision received:** use whichever is easier long term; the arbitrary
reference pivots should not force a redraw of a good-enough master. This sprint
selects the handoff's preferred `Top-Down Tactical Agent Sprite.png`, accepting
its silhouette/camera and fitting the registration to its illustrated anatomy.
This refers to the preferred original, not either failed generated attempt.

Stage A preferred-master preparation and assistant material-mask review are
complete. Stage B has seven registered extracted layers plus deterministic
hidden overlap. Current source/runtime proof is **v03**. Neutral source composite
differs from the normalized master at **zero pixels**. Rotation/WALK artifacts
are available for user review; visual acceptance and activation remain pending.
The active rig registry is still empty. No gameplay or live art activation.

The other session owns sprite-viewer debugging. This wave changes rig-specific
template, prompt module, contract, test, generated rig-proof prompt queue and
artifacts. Shared sprite preparation, sprite-renderer, viewer and registries
remain untouched. The Python rig validator receives pivots from the revised JS
template; no separate pivot constants require editing. Existing uncommitted
work/originals are preserved. No commit, push or branch switch.

## Current deliverables and resume point

- [Selected normalized source](../artwork/rig-sprint/preferred-master-v01/char_technician_v01__master__source.png).
- [Anatomical pivot overlay](../artwork/rig-sprint/preferred-master-v01/anatomical-pivot-overlay.png).
- [Material ownership preview](../artwork/rig-sprint/preferred-master-v01/material-ownership-preview.png)
  and nine full-canvas masks (including empty display/hair) in `masks/` beside it.
- [Pose extremes and 22-pixel thumbnails](../artwork/rig-sprint/preferred-master-v01/pose-extremes.png).
- [600ms WALK preview](../artwork/rig-sprint/preferred-master-v01/walk-proof.gif).
- [Seven-layer review](../artwork/rig-sprint/preferred-master-v01/seven-layer-review.png).
- [Preparation measurements](../artwork/rig-sprint/preferred-master-v01/preparation-report.json)
  and [neutral/overlap measurements](../artwork/rig-sprint/preferred-master-v01/layer-proof-report.json).
- Source pack: `artwork/rig-sources/technician-v01-preferred-proof-v03/`.
- Prepared pack: `demos/shared/sprites/offworld/rigs/technician-v01-preferred-proof-v03/`.
- Deterministic tools: `prepare-master.py`, `build-layer-proof.py`, `preview-proof.py`
  under `artwork/rig-sprint/`. No imagegen calls in this wave; local deterministic
  preparation/mask tooling is authorized by the handoff.

Source normalization scales the full 1254 canvas to 1024; removes 625 remote
faint-alpha pixels; preserves original shading evidence; assigns materials using
source-specific anatomical regions plus source color evidence; selects shades
within each assigned material's shared ramp. A 3px median reduces shading noise.
215,735 nearly opaque pixels become alpha255; eroded substantial interior had
no alpha below240, so interiors are opaque without erasing genuine edge alpha.
All visible source RGBs pass the strict shared palette. Bounds `(243,189,782,896)`
pass 64px padding. Skin/accent and shirt/trouser classification errors caught
in the first draft were corrected before the layer pack was built. Remaining
boundary choices are source-specific artistic approximations, not reusable masks.

Current pivots: torso `[512,512]`, head `[512,400]`, left_arm `[672,384]`,
right_arm `[352,384]`, left_leg `[560,584]`, right_leg `[464,584]`, equipment
`[512,536]`. Head z changed from50 to25 so its neck is actually beneath the
torso collar, resolving an old draw-order/overlap contract conflict. Prompts,
source rig.json, contract and tests agree; old prompt queue archived in
`artwork/rig-sprint/template-v00/`. No skeletal measurements are claimed.

Layer ownership is an exact pixel partition of the normalized master. Hidden
overlap extrapolates nearby source colors under opaque torso pixels, rather
than regenerating the approved visible silhouette. Source torso backing covers
proximal attachment regions. This technique is suitable for a proof; exposed
hidden surfaces may need artist repair if more extreme animation is requested.
v01 exposed the downloaded master's near-opaque alpha, preventing hidden fills;
v02 established opaque interiors/overlaps; v03 trims excessive stationary
shoulder backing and broadens hidden arm overlap. Earlier packs are retained
as historical diagnostics and must not be activated.

Assistant review: neutral reconstruction exact; no canvas clipping apparent in
tested arm +/-12, leg +/-15, four-phase WALK and DOWN diagrams. Small separation
around hands/body is expected. Shoulder sleeve shading and socket backing can
read stiff at rotation extremes; do not call the pose proof visually approved.
22-pixel thumbnails are an offline 1px/world-unit analogue, not an actual map
zoom/browser check. GIF uses 16 sampled frames with quantized delays totaling
600ms; it is a review artifact, not a live gameplay animation loop.

Next: user reviews the pose/WALK/material result; repair any identified seam or
color assignment while preserving the same master. Activate only after explicit
review, using the v03 runtime metadata or a later accepted version. Do not install
these parts through the sprite-viewer ZIP workflow. Build/prepare tools refuse
existing layer/runtime output directories; use a new version for revisions.

## Review artifacts

- [Five-candidate comparison](../artwork/rig-sprint/candidate-review/candidate-pivot-comparison.png).
- [Preferred camera overlay](../artwork/rig-sprint/candidate-review/preferred-camera--pivot-overlay.png).
- [Preferred camera native-size overlay](../artwork/rig-sprint/candidate-review/preferred-camera--native-pivot-overlay.png).
- [Palette master overlay](../artwork/rig-sprint/candidate-review/palette-master--pivot-overlay.png).
- [Measured inventory](../artwork/rig-sprint/candidate-review/inspection.json).
- [Repeatable inspection](../artwork/rig-sprint/inspect-candidates.py).
- [Actual Stage A correction prompt](../artwork/rig-sprint/stage-a-correction-prompt.txt).
- [Actual reference-free prompt](../artwork/rig-sprint/stage-a-new-master-prompt.txt).
- [b001 pivot overlay](../artwork/rig-sprint/candidate-review/stage-a-attempt-01--pivot-overlay.png).
- [b002 pivot overlay](../artwork/rig-sprint/candidate-review/stage-a-attempt-02--pivot-overlay.png).
- [Artifact provenance and repeat command](../artwork/rig-sprint/README.md).
- Byte-preserved PNGs and ZIP under `artwork/rig-sprint/candidate-review/originals/`.

Overlays are diagnostics on a checkerboard, not source art. Non-1024 inputs
are scaled by their **whole canvas** to 1024 for comparison; no crop, cleanup,
translation, semantic masks or palette conversion has occurred.
Native-size companion overlays retain source pixels/canvas dimensions and
map the 1024 template proportionally; this is a comparison, not new rig metadata.

## Measured and visual findings

- ZIP CRC passed; source SHA-256 values recorded. All three PNGs are RGBA,
  single-frame and have real transparency.
- Palette master: 1024 square, alpha bounds `(243,167,780,895)`, all 223,372
  alpha>=240 pixels and all visible edge pixels use allowed shared RGBs.
  This establishes palette membership only, not semantic assignments.
- Preferred camera: 1254 square, alpha bounds `(55,77,1095,1166)`; alpha>=16
  bounds `(302,235,953,1094)` show much of the stray extent is faint alpha.
  Only 910 of 325,992 alpha>=240 pixels match allowed source RGBs.
- Older reference: 1254 square, alpha bounds `(69,251,1226,1109)`; 55 of
  196,913 alpha>=240 pixels match. Retained as reference, not selected.
- Preferred candidate has more crown and less face than the palette candidate,
  but all three remain oblique views with visible face/chest. The current
  authored prompt requests direct overhead; do not silently call these compliant.
- Shoulder pivots `(400,352)` / `(624,352)` fall on inner harness straps.
  Apparent shoulder/upper-arm interfaces lie outward and lower. Exact skeletal
  joints cannot be measured from a flat illustration; these are visual findings,
  not accepted anatomical coordinates. Whole-image scaling/translation cannot
  independently correct shoulders while preserving neck/hip registration.
- Neck pivot `(512,432)` lies at the collar opening below the visible chin.
  This is plausible as a hidden neck attachment; the earlier statement that the
  head is too high is not established by crown position alone. Hidden neck
  overlap is absent/unverified until decomposition.
- Hip pivots `(464,568)` / `(560,568)` sit near the belt/upper trousers and are
  plausible hidden hip locations. Equipment `(600,512)` sits by the side of the
  front case/harness; its eventual mount needs independent review.
- Torso `(512,512)` is a presentation/root anchor, not an anatomical joint.

## Historical preparation decision — superseded by user reply

Keep the locked template unchanged. Generate one Stage A correction using the
preferred candidate as an outfit/style reference, with shoulders explicitly
registered, more overhead camera, bald/beardless identity and no eyewear.
Preserve the tool output and actual prompt. Check transparency, dimensions,
padding, palette and pivot overlay before claiming success.

Then review material regions before shade quantization: shirt, trousers,
harness, gear, accents, display, skin, hair and outline. Global nearest-color
mapping is insufficient. Preserve original shading evidence. A corrected
image is still a candidate; obtain master review before seven-part generation.
No provisional coordinate changes or guessed masks are approved.

### Stage A generation attempt b001

Built-in imagegen used the preferred candidate as an outfit/style reference.
Unmodified output saved to `artwork/rig-sprint/stage-a-correction-b001/generated-master.png`.
RGBA, 1254x1254 (requested 1024), alpha bounds `(49,39,1190,1220)`;
alpha>=16 bounds `(272,207,982,1121)`. Only 523 of 375,736 alpha>=240
pixels match the allowed source palette. The inspected overlay still places
shoulder pivots on harness straps. Camera remains oblique. Not suitable for
mask authoring or decomposition. No quantization performed to hide this failure.
Original tool output is also retained in Codex generated_images.

### Stage A generation attempt b002

Built-in imagegen with no image reference; unmodified output saved to
`artwork/rig-sprint/stage-a-new-master-b002/generated-master.png`. RGBA,
1254x1254 (requested 1024), alpha bounds `(87,20,1184,1222)`; alpha>=16
bounds `(268,99,988,1168)`. Only 38 of 428,237 alpha>=240 pixels match.
Visual inspection of the full overlay shows more crown and a side case close
to the equipment anchor. Shoulder markers remain on harness straps; the neck
marker now sits on the chest below the collar. Feet approach the padding edge.
No source normalization, mask authoring or decomposition performed.

### Historical proposed next wave — superseded by user reply

Do not spend more attempts repeating coordinate-only prompts. The current
authored direct-overhead camera and preferred oblique silhouette remain a
concrete visual mismatch, not a proven impossible template. A diagnostic
visual guide can show the intended joint anatomy explicitly for imagegen.
Recommended direction: keep locked pivots and create a new master around
that guide, then repeat source/material checks. Alternative awaiting user
direction: preserve preferred silhouette and draft revised anatomical pivots
with overlay evidence; review and consistently update all contract owners
before decomposition. No revised pivots have been invented or applied.

The asynchronous question was answered: adapt the arbitrary pivots to the
good-enough preferred master. The current checkpoint above supersedes this
historical recommendation. Neither generated attempt was accepted as master.

Required subsequent gates: reviewed master; seven full-canvas layers with
hidden overlap; neutral seams; arms +/-12 and legs +/-15; WALK/readability at
22 world units; explicit activation review. Automated checks cannot establish
these visual acceptances.

## Validation

Current adapted-master wave: all 12 focused rig/renderer/prompt tests passed
again after pivot/order changes. Node syntax, Python AST syntax and diff checks
passed. Real v03 seven-part preparation passed canvas/padding/rotation validation;
every visible source-part RGB belongs to the strict prepared-master palette.
Prepared real metadata matches revised template and z order; active registry is
empty. WALK GIF verified 16 frames/600ms cycle. Neutral source comparison zero
pixels different. No browser smoke rerun: no UI/renderer or live registry changed.

Inspection script ran successfully against the real candidates and imports
the existing JS template/palette rather than duplicating them. Visual inspection
completed for the comparison, full preferred-camera and both generated-attempt
overlays. All 12 focused
rig/renderer/prompt tests passed:

```bash
node --test demos/offworld-sandbox/character-rig.test.mjs demos/offworld-sandbox/sprite-renderer.test.mjs demos/offworld-sandbox/character-art-prompts.test.mjs
```

Python AST syntax and `git diff --check` passed. Browser smoke was not rerun;
this wave changes no browser or runtime code. Node tests used their existing
temporary preparation fixtures, not live art.

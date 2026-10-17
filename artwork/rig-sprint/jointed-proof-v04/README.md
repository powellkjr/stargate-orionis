# Jointed technician repair v04

This proof repairs the rejected v03 layers using the same normalized master
and original shoulder/hip pivots. It remains inactive pending visual review.

- [WALK GIF](walk-proof.gif): 600ms, 16 sampled frames; alternating forward/backward
  projection with subtle limb foreshortening.
- [Every WALK frame](all-walk-frames.png) and [attachment closeups](attachment-frames.png).
- [Last frame](walk-last-frame-review.png), explicitly inspected.
- [Eleven separate layers](eleven-layer-review.png): upper arms/forearms and
  upper thighs/lower legs, each with its own shoulder/elbow/hip/knee attachment.
- [Pose diagnostics](pose-extremes.png): WALK phases, elbow/knee +/-15 and DOWN.
- [Fitted pivots](anatomical-pivot-overlay.png).
- `frame-checks.json`: exact shared JS poses/matrices and alpha 128 component areas
  for all 16 frames. Every frame has one connected character component.
- `layer-proof-report.json`: expanded hidden overlap and zero differing pixels
  in the neutral source composite.

Arm extraction follows the sleeve/skin/glove contour and excludes torso-side
shirt fragments. Continuous torso-owned pelvis covers substantially deeper
trouser-colored thigh overlap. Elbow/knee children inherit their parent transforms
and can rotate separately. [Pistol/rifle holding diagnostics](../holding-proof-v05/README.md)
now exercise the elbows with the same layers; finished grips remain an art pass.

Source pack: `artwork/rig-sources/technician-v01-jointed-proof-v04/`.
Prepared pack: `demos/shared/sprites/offworld/rigs/technician-v01-jointed-proof-v04/`.
Metadata version 2 intentionally distinguishes this eleven-part hierarchy from
the archived seven-part proofs. Prompts: `artwork/sprite-prompts-v4/rig-proof-jointed/`.

The GIF and diagrams are offline review artifacts. Tiny 22px thumbnails approximate
map scale. Hidden surfaces use deterministic source-color extrapolation, so large
joint bends/holding poses need further review. Existing master, older proofs,
sprite-viewer and live registries are preserved.

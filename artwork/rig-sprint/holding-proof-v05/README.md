# Pistol and rifle holding proofs v05

[Side-by-side pose review](pistol-and-rifle-review.png) uses the same v04
eleven-part rig, master, camera, shoulder/elbow pivots and original limb art.
No new character pixels or weapon inventory definitions were authored.

- [Pistol pose](pistol-pose.png): two hands together, muzzle toward screen-bottom.
- [Rifle pose](rifle-pose.png): separate trigger/support grips, muzzle diagonally
  toward screen-bottom/right. The head retains its original painted direction.
- [Pistol bend GIF](pistol-bend-proof.gif) and [rifle bend GIF](rifle-bend-proof.gif):
  neutral to held pose and back, with the prop shown only at the final pose.
  These inspect joint bends; they are not pickup or aiming choreography.
- [All pistol bend samples](pistol-all-bend-frames.png) and
  [all rifle bend samples](rifle-all-bend-frames.png), visually inspected.
- `*-arms-only.png` isolates the pose without its prop; `pose-checks.json`
  records the angles, matrices, grips, per-frame bounds/components and input hashes.

The offline compositor places forearms above the torso/equipment, then draws
generic code-defined weapon silhouettes and small grip occlusion masks. This
draw order is local to this proof; the live renderer was not changed. The props
are registration guides, not finished weapon art or canonical game items.
Closed gloves remain the original artwork; proper trigger/support finger grips,
weapon detail and matching head aim need a later art pass.

Two-bone inverse kinematics places four estimated glove-center anchors at their
targets without scaling or moving shoulder/elbow pivots. Shared JS parent
matrices reproduce every grip within 1e-8 runtime pixels. All 26 sampled poses
fit inside the 128 canvas and have no detached alpha>=128 component of three
or more pixels. Some bent frames have a single isolated resampling pixel,
recorded in the report. Visual inspection shows no substantial floating shirt
fragments or opened hip joins. This is an offline art proof, not browser acceptance.

Rebuild from the repository root:

```bash
python artwork/rig-sprint/preview-holding-proof.py
```

The script only writes this review directory. Source/prepared packs, active
registry, sprite-viewer and gameplay remain untouched. Activation still needs
explicit visual review. Sprint checkpoint: `docs/character-rig-sprint-status.md`.

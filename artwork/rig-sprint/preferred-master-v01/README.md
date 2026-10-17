# Preferred technician master and rig proof

**Current repair:** [jointed v04 review](../jointed-proof-v04/README.md). The master
here is still selected; this folder's seven-part animation is the rejected v03
historical proof. Use v04 for the repaired walk, elbows, knees and hip coverage.
[Pistol/rifle holding review](../holding-proof-v05/README.md) uses that same jointed rig.

The user accepted the preferred master silhouette/camera on October 9, 2026.
`char_technician_v01__master__source.png` is its full-canvas 1024 preparation;
the original Downloads PNG is preserved separately. Material/pose changes
remain reviewable here; no rig is activated.

- `normalized-shading-evidence.png`: original RGB/shading after stray cleanup
  and whole-canvas resize, before palette/opacity preparation.
- `material-ownership-preview.png`: reviewed source-specific material diagram.
  Pink skin, light grey shirt, blue trousers, tan harness, dark grey gear,
  yellow accents, black outline. Display/hair absent. This is not runtime art.
- `masks/`: nine exclusive material alpha masks and an integer material-id map;
  IDs1..9 are shirt, trousers, harness, gear, accents, display, skin, hair, outline.
- `anatomical-pivot-overlay.png`: fitted attachments; hidden skeletal centers
  are estimated from artwork, not exact anatomical measurements.
- `neutral-source-composite.png`: seven-layer reconstruction, zero differing
  pixels against the prepared master.
- `seven-layer-review.png`, `pose-extremes.png`, `walk-proof.gif`: offline v03
  review artifacts. Tiny thumbnails are22 pixels, a map-scale analogue.
- JSON reports record provenance, preparation and hidden overlap. `rig.json`
  is source metadata; actual seven source PNGs are in the pack below.

Current pack: `artwork/rig-sources/technician-v01-preferred-proof-v03/`.
Prepared pack: `demos/shared/sprites/offworld/rigs/technician-v01-preferred-proof-v03/`.
Earlier v01/v02 packs are historical diagnostics, not installation candidates.

Head renders underneath the torso to hide its own neck overlap beneath the
collar. Limb/socket backing is deterministic extrapolation of source pixels;
review it at rotation extremes before activation. No visible art was regenerated.

From the repository root, preparation for a **new** output directory is:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs rig-prepare \
  artwork/rig-sources/technician-v01-preferred-proof-v03 \
  --out demos/shared/sprites/offworld/rigs/technician-v01-preferred-reviewed
```

This only prepares art; it does not activate the registry. Preserve originals
and existing outputs. Review status is in `docs/character-rig-sprint-status.md`.

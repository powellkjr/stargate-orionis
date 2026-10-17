# Room Sandbox sprite audit — October 12, 2026

## Scope and method

Compared the live sprite manifest, installed variant pools, room/geology mappings and actual installed PNGs against `demos/shared/sprites/room-tile-prompts.mjs`, `room-sprite-requirements.mjs` and `demos/offworld-sandbox/SPRITE_PRODUCTION_CONTRACT.md`. Reviewed a contact sheet of all installed room-interior variants. This is a review, not approval or automatic rejection of installed art.

## Coverage

- Registry: 75 asset keys; 185 enabled installed variant entries.
- All 19 Room Sandbox room types have eligible installed full-frame furnishing overlays.
- All enabled installed PNG paths exist.
- Ten of the 13 geology tile types have no installed production PNG or matching named source batch: unexcavated rock, hard rock, bedrock, void, outside edge, mineral zone, unstable rock, metal vein, anomalous geology and flooded void. These still use SVG placeholders, not broken image paths.
- Excavated empty, collapsed prefab and reinforced excavated do have installed production art.
- The standalone `rock` prop also has no installed production PNG.

## Technical validation

All 185 enabled installed entries passed the checks run: runtime dimensions, RGBA mode, required opaque coverage or true transparency, and transparent padding for ordinary isolated sprites. Full-frame room overlays deliberately have no isolated-object padding requirement.

These checks do not certify camera angle, subject fidelity, doorway clearance, seamless floor repetition, paired-state pixel registration, exact character palette ramps or meaningful grayscale variant differences. Those require additional asset-specific review; no blanket visual approval is implied.

## Visual findings

- Cultural Platform: the pool includes five older b001 entries and three new b002 entries. Removing b001 source/prepared folders did not remove or disable its installed PNG copies. Stable variant selection can therefore still select old artwork. Source/prepared identities can also represent duplicate designs in the pool.
- Cultural Platform b002: genuine distinct angular/rounded/utilitarian furniture layouts, transparent ground and visibly open bottom-center entrance. However, the central table/chairs occupy the requested continuous open center. Planters also go beyond the narrowly requested seating/table forms. Treat these as prompt deviations, not a fully approved match.
- Offworld Medical Holding: all three reviewed overlays visibly include beds; the authored subject explicitly says to omit beds, patients, samples, medical equipment and restraints because these are separate instances. These variants fail that content requirement.
- Many older overlays have continuous frame-like trim around perimeter furniture. At contact-sheet scale, some trim appears structural rather than furniture-only. Review source-size art before approving the no-room-shell/no-baked-wall requirement.
- Several overlays use bright cyan/orange luminous details, particularly Gate, Generator and Data Storage. Review these against restrained shading and the room prompt's prohibition on neon glow; technical PNG validation cannot settle this.
- Most reviewed older room layouts leave an apparently open center and bottom-center entrance. No obvious labels, painted checkerboard ground or four repeated miniature Cultural Platform rooms were visible in the contact sheet. Exact world-scale door clearance and camera compliance remain asset-specific checks.

## Checklist drift

The generated `roomTileChecklist` still describes Generator, Cultural Platform, Holding, Research and Offworld overlays as pending; it also claims room tile keys are not registered or rendered, and Cultural Platform is not a room definition. These statements no longer match implementation. Its settled acquisition list is historical acquisition status, not a reliable live installation or visual-approval checklist.

## Execution checks

- `node --test demos/room-sandbox/*.test.mjs`: 11 passed, 0 failed.
- `node demos/room-sandbox/browser-smoke.mjs`: passed in Edge, including generated layout, continuous overlay, rotation, missing-art fallback and no save writes.

No installed variants, downloaded originals, gameplay data or renderer code were changed by this audit. Remaining work is production-art acquisition for the missing geology keys, explicit review/rejection of obsolete or noncompliant variants, and separating live installation coverage from historical prompt acquisition status.
# Room interior tile prompt queue

Pending-only queue: Generator, Cultural Platform, Holding, Research and six Offworld stage presentation studies. Upload each numbered prompt separately. Each requests ONE transparent RGBA 3:1 image with three equal square furnishing overlays side by side, without gutters or labels. Ground and empty space have alpha 0; the tile system supplies the floor separately. Every variant reserves an unobstructed bottom-center doorway area and approach. Existing furniture/geology prompts remain separate.

## Pending generation
- [x] floor-room-generator — `floor-room-generator__sheet.png` → `orionis-floor-room-generator-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-cultural-platform — `floor-room-cultural-platform__sheet.png` → `orionis-floor-room-cultural-platform-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-holding — `floor-room-holding__sheet.png` → `orionis-floor-room-holding-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-research — `floor-room-research__sheet.png` → `orionis-floor-room-research-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-offworld-gate-area — `floor-room-offworld-gate-area__sheet.png` → `orionis-floor-room-offworld-gate-area-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-offworld-room-basic — `floor-room-offworld-room-basic__sheet.png` → `orionis-floor-room-offworld-room-basic-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-offworld-hallway-basic — `floor-room-offworld-hallway-basic__sheet.png` → `orionis-floor-room-offworld-hallway-basic-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-offworld-processing-room — `floor-room-offworld-processing-room__sheet.png` → `orionis-floor-room-offworld-processing-room-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-offworld-security-room — `floor-room-offworld-security-room__sheet.png` → `orionis-floor-room-offworld-security-room-transparent-b001`; v01–v03 extracted, not approved or installed.
- [x] floor-room-offworld-medical-holding — `Sci-Fi Medbay Room Collection.png` → `orionis-floor-room-offworld-medical-holding-transparent-b001`; v01–v03 extracted, not approved or installed.

## Settled acquisition — removed from active prompt list
- [x] analysis — three transparent variants extracted; not installed or visually approved.
- [x] containment — three transparent variants extracted; not installed or visually approved.
- [x] data storage — three transparent variants extracted; not installed or visually approved.
- [x] equipment storage — three transparent variants extracted; not installed or visually approved.
- [x] gate room — three transparent variants extracted; not installed or visually approved.
- [x] infirmary — three transparent variants extracted; not installed or visually approved.
- [x] living quarters — three transparent variants extracted; not installed or visually approved.
- [x] maintenance — three transparent variants extracted; not installed or visually approved.
- [x] material storage — three transparent variants extracted; not installed or visually approved.
- [x] ration storage — three transparent variants extracted; not installed or visually approved.
- [x] receiving — three transparent variants extracted; not installed or visually approved.
- [x] response room — three transparent variants extracted; not installed or visually approved.
- [x] supply storage — three transparent variants extracted; not installed or visually approved.
- [x] tech platform — three transparent variants extracted; not installed or visually approved.
- [x] workshop — three transparent variants extracted; not installed or visually approved.

The acquisition filenames and provenance remain in artwork/room-tile-prompts-v2/README.md and the source batches. Arena Control Rings is excluded by user instruction. Lab Room Frame Collection and Command Bay Tile Variants remain unassigned; neither satisfies a pending request until identified. Historical opaque candidates are not transparent-overlay replacements.

Cultural Platform is an art-only request based on the recorded 2×2 concept, not a new room JSON definition. Offworld requests cover the six authored stage archetypes in demos/shared/data/offworld/archetypes.json and the current mission fixture. They are not SGC room catalog additions. Gate, Analysis and Storage base-room studies remain settled, but generic Offworld stage studies are separate. No hidden mission facts or separately rendered instance objects should be baked into their overlays. At integration, preserve multi-cell stage geometry and connection clearances rather than blindly repeating furnishings in every cell.

Keep the full square coordinate frames when splitting; do not crop or recenter furnishings. The current Python splitter's `--tiles` mode requires opaque images and rejects these transparent overlays. Its ordinary sprite mode also crops/recenters, so neither mode is suitable for this revised queue without a dedicated frame-preserving transparent workflow.

The existing floor-room filenames are retained as study identifiers, not floor content or registered runtime assets. Review camera, alpha and doorway clearance manually. These are presentation studies: room tile keys are not yet registered for installation or rendered by Room Sandbox. Integration must layer furnishings over the separate floor tiles and replace the corresponding baked furnishings to avoid drawing them twice. No authored room configuration changes. The v1 queue and previously generated opaque art remain historical and unchanged.

Regenerate text into a fresh folder:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-tile-prompts --out artwork/room-tile-prompts-v3
```

## Latest download extraction

Nine exact-key transparent sheets extracted into 27 variants. Full 724px square frames retained; source masters upscaled to 1024px and runtime previews resized to 128px. Source hashes/rectangles recorded per batch; prepared contact sheets included. No original or active-art changes. Camera, baked walls/furnishings and doorway clearance remain visual-review items. `Sci-Fi Medbay Room Collection.png` confirmed by user as Offworld Medical Holding and subsequently extracted into three variants with the same full-frame workflow. All ten requested room studies now have split candidates.

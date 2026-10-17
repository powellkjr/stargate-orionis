# Room interior tile prompt queue

Upload each numbered prompt separately. Analysis is first. Each requests ONE transparent RGBA 3:1 image with three equal square furnishing overlays side by side, without gutters or labels. Ground and empty space have alpha 0; the tile system supplies the floor separately. Every variant reserves an unobstructed bottom-center doorway area and approach. Existing furniture/geology prompts remain separate.

Keep the full square coordinate frames when splitting; do not crop or recenter furnishings. The current Python splitter's `--tiles` mode requires opaque images and rejects these transparent overlays. Its ordinary sprite mode also crops/recenters, so neither mode is suitable for this revised queue without a dedicated frame-preserving transparent workflow.

The existing floor-room filenames are retained as study identifiers, not floor content or registered runtime assets. Review camera, alpha and doorway clearance manually. These are presentation studies: room tile keys are not yet registered for installation or rendered by Room Sandbox. Integration must layer furnishings over the separate floor tiles and replace the corresponding baked furnishings to avoid drawing them twice. No authored room configuration changes. The v1 queue and previously generated opaque art remain historical and unchanged.

Regenerate text into a fresh folder:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-tile-prompts --out artwork/room-tile-prompts-v3
```

## Downloads acquisition checklist — October 10, 2026

Checked means found and extracted, NOT visually approved or installed. Transparent sheets were extracted at exact cell boundaries (724px); full coordinate frames and alpha retained. 1024px masters upscale the original 724px cells. Runtime previews are 128px. No live registry changes. Sources include original-file SHA-256 and rectangles in `split-provenance.json`; prepared batches include contact sheets.

- [x] **analysis** — `floor-room-analysis__sheet.png` → `orionis-floor-room-analysis-transparent-b001` (v01–v03).
- [x] **containment** — `floor-room-containment__sheet.png` → `orionis-floor-room-containment-transparent-b001` (v01–v03).
- [x] **data-storage** — `floor-room-data-storage__sheet.png` → `orionis-floor-room-data-storage-transparent-b001` (v01–v03).
- [x] **equipment-storage** — `floor-room-equipment-storage__sheet.png` → `orionis-floor-room-equipment-storage-transparent-b001` (v01–v03).
- [x] **workshop** — `floor-room-workshop__sheet.png` → `orionis-floor-room-workshop-transparent-b001` (v01–v03).
- [x] **tech-platform** — `floor-room-tech-platform__sheet.png` → `orionis-floor-room-tech-platform-transparent-b001` (v01–v03).
- [x] **supply-storage** — `floor-room-supply-storage__sheet.png` → `orionis-floor-room-supply-storage-transparent-b001` (v01–v03).
- [x] **response-room** — `floor-room-response-room__sheet.png` → `orionis-floor-room-response-room-transparent-b001` (v01–v03).
- [x] **living-quarters** — `Sci-Fi Bunkroom Interior Tileset.png` → `orionis-floor-room-living-quarters-transparent-b001` (v01–v03).
- [x] **infirmary** — `Three Sci-Fi Medbay Tile Variants.png` → `orionis-floor-room-infirmary-transparent-b001` (v01–v03).
- [x] **gate-room** — `Sci-Fi Stargate Room Tile Set.png` → `orionis-floor-room-gate-room-transparent-b001` (v01–v03). Baked Gate artwork: review before integration; do not double-render Gate.

- [x] **maintenance** — `Sci-Fi Engineering Room Tile Set.png` → `orionis-floor-room-maintenance-transparent-b001` (v01–v03); room assignment confirmed by user.

- [x] **material-storage** — `Three Sci-Fi Storage Room Frames.png` → `orionis-floor-room-material-storage-transparent-b001` (v01–v03); room assignment confirmed by user.

- [x] **ration-storage** — `Three Sci-Fi Supply Room Borders.png` → `orionis-floor-room-ration-storage-transparent-b001` (v01–v03); room assignment confirmed by user.

- [x] **receiving** — `Sci‑Fi Conveyor Scanner Tile Set.png` → `orionis-floor-room-receiving-transparent-b001` (v01–v03); room assignment confirmed by user.

Not yet identified: generator, holding, research. Generator was added after this historical 17-room prompt queue. Cultural Platform is not authored in the room catalog.

### Found, awaiting room identification — not split

- [ ] `Sci‑Fi Lab Room Frame Collection.png` — user confirmation required.
- [ ] `Sci-Fi Command Bay Tile Variants.png` — user confirmation required.
- Excluded: `Three Sci-Fi Arena Control Rings.png` — user confirmed this is not a room; not split or assigned.
- [ ] `Futuristic Sci‑Fi Room Tile Triptych.png` — user confirmation required.
- [ ] `Sci-Fi Storage Tile Triptych.png` — user confirmation required.
- [ ] `Sci-Fi Server Room Triptych.png` — user confirmation required.
- [ ] `Sci-Fi Server Room Triptych(1).png` — user confirmation required.
- [ ] `Three Sci-Fi Server Room Variants.png` — user confirmation required.

Historical opaque Analysis sheet `Top-Down Sci-Fi Lab Tile Triptych.png` was already split in `orionis-floor-room-analysis-b001`; not reprocessed. Other RGB sheets are opaque historical candidates, not transparent-overlay replacements. Unrelated prop, character and terrain sheets were excluded. Camera, doorway clearance, boundary clipping and baked ground/walls still require visual review.

# Registered modular room-kit prompts — provisional v1

Catalog selection, not an outstanding-art or installation checklist. 2 existing base-room kits; 18 requests/assets per kit. Use these prompts for new modular room art. Legacy room-tile-prompts and outstanding-prompts still target installed full-room overlay keys; do not substitute modules into those keys. Offworld archetype kit mappings are a later step, especially outdoor Gate areas, whose no-wall presentation needs a separate decision.

Geometry is in room-kits.json; registration-guide.svg is a measured guide only. Each PNG has a full 1024-square cell frame, 128-square planned runtime frame, 32/64/32 grid and pivot (512,512). All modules are transparent overlays above a separate base floor. CT2 is 4/6/4/6/4; CT3 is 4/16/4; all tiers repeat every 24 units through a 5-unit channel.

Attach the user's CT tier illustration as a material/form reference: pale corner armor and dark inset wall panels; one short amber, two blue, one long purple opening. Keep lighting restrained, source slots transparent and topology/geometry identical across CT. Illustrated OPEN ends map to SHARED, not EDGE_OPEN. Room size remains independent of CT.

For each family generate CORNER first, review its wall/channel registration, then attach that source and guide for SHARED and EDGE pieces. CENTER and EDGE_OPEN are deliberately fully transparent in v1: create their empty 1024-square RGBA sources deterministically with Pillow, not image generation. All 18 named source files, including these empty members, belong in each kit ZIP. Metadata describes expected source paths, not generated files. Review seams/alpha and assemble sample 1×1, 1×2 and 2×2 layouts before accepting a family.

Registered kit resizing, complete-family ZIP ingestion, Stage-wide deterministic selection and Offworld renderer adoption are still pending. The Room Sandbox modular test now previews Material Storage sources, CT treatments and open/closed leaves without installing active art. Ordinary crop/recenter, sheet split and independent per-key installation are unsuitable. SHARED permits diagonal reflection plus rotation to cover both handed arrangements.

## Door frames and moving leaves

Attach registration-guide.svg plus the approved same-family EDGE_DOOR and CORNER sources when generating leaves. The guide is a measurement reference: its colors, grid, labels and background must never be painted into an asset.

- Fixed EDGE_DOOR frame: preserve the full clear north passage x=48..80, y=0..32 (source x=384..640, y=0..256), alpha 0 throughout. Do not bake moving leaves into this module.
- Separate CLOSED leaf overlay: full 1024-square RGBA frame; visible pixels only in x=48..80, y=0..12 (source x=384..640, y=0..96). Two sliding halves meet at x=64 (source x=512). The guide's orange rectangle marks this separate layer; it does not authorize filling the opening in EDGE_DOOR.
- OPEN leaf overlay: entirely transparent. Leaves retract behind the existing frame and are not drawn. No image generation is needed for an empty open asset.
- Use the same cell pivot (512,512) and matching family for frame and leaf. Do not add a second frame, overhead bridge, floor, CT lights or shadows outside the closed-leaf rectangle. The 12-unit depth is a provisional visual fit to the existing wall.

Leaf names: <kit-id>-door-leaf-closed__vNN__source.png; optional empty open file <kit-id>-door-leaf-open__vNN__source.png. Leaf files are additional overlays, not members of the original six-piece/18-file kit ZIP. Keep them separate until production packaging is defined.

Material Storage's three closed-leaf generation prompts and attachment instructions are in artwork/room-kit-door-prompts-v1/material-storage/. To review, open /demos/room-sandbox/room-kit.html, choose Load door leaf artwork, then toggle Doors: open / closed. Unprovided closed art uses a labeled schematic placeholder. File selections last for the page session; no door gameplay is implied.

- [ ] receiving-center-v01-prompt.txt
- [ ] receiving-corner-v01-prompt.txt
- [ ] receiving-shared-v01-prompt.txt
- [ ] receiving-edge-normal-v01-prompt.txt
- [ ] receiving-edge-door-v01-prompt.txt
- [ ] receiving-edge-open-v01-prompt.txt
- [ ] receiving-center-v02-prompt.txt
- [ ] receiving-corner-v02-prompt.txt
- [ ] receiving-shared-v02-prompt.txt
- [ ] receiving-edge-normal-v02-prompt.txt
- [ ] receiving-edge-door-v02-prompt.txt
- [ ] receiving-edge-open-v02-prompt.txt
- [ ] receiving-center-v03-prompt.txt
- [ ] receiving-corner-v03-prompt.txt
- [ ] receiving-shared-v03-prompt.txt
- [ ] receiving-edge-normal-v03-prompt.txt
- [ ] receiving-edge-door-v03-prompt.txt
- [ ] receiving-edge-open-v03-prompt.txt
- [ ] material-storage-center-v01-prompt.txt
- [ ] material-storage-corner-v01-prompt.txt
- [ ] material-storage-shared-v01-prompt.txt
- [ ] material-storage-edge-normal-v01-prompt.txt
- [ ] material-storage-edge-door-v01-prompt.txt
- [ ] material-storage-edge-open-v01-prompt.txt
- [ ] material-storage-center-v02-prompt.txt
- [ ] material-storage-corner-v02-prompt.txt
- [ ] material-storage-shared-v02-prompt.txt
- [ ] material-storage-edge-normal-v02-prompt.txt
- [ ] material-storage-edge-door-v02-prompt.txt
- [ ] material-storage-edge-open-v02-prompt.txt
- [ ] material-storage-center-v03-prompt.txt
- [ ] material-storage-corner-v03-prompt.txt
- [ ] material-storage-shared-v03-prompt.txt
- [ ] material-storage-edge-normal-v03-prompt.txt
- [ ] material-storage-edge-door-v03-prompt.txt
- [ ] material-storage-edge-open-v03-prompt.txt

Export another selection to a fresh folder (repeat --kit as needed):

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-kit-prompts --kit receiving --kit material-storage --out artwork/room-kit-prompts-next
```

Omit --kit to export all 19 supported base-room catalog kits. Existing prompt files cannot be overwritten.

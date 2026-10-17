# Room simulator sprite requirements

The room simulator will use the same asset registry, source/runtime PNG contract,
variant pipeline and viewer as Offworld. The registry currently remains at
`../offworld-sandbox/sprite-manifest.mjs`; its room/geology coverage comes from
`../shared/sprites/room-sprite-requirements.mjs`. These are presentation mappings
for existing authored IDs. Furniture appearances are provisional art, not new
items, configured Services, Cores or room rules.

The room simulator now renders these shared assets by default through
`sprite-presentation.mjs` and Offworld's shared image/variant/fallback primitives.
Use View: Schematic to compare the original rendering. Installed variants are
picked on map load/reset/generation and remain stable during redraw. Furnishings
are decorative; staff art represents anonymous count markers and the Gate is
inactive because the sandbox has no connection state.

## Future modular room-kit authoring

The [v2 handoff](../../docs/offworld-modular-room-visual-kit-handoff-v2.md)
and [reconciliation/plan](../../docs/offworld-modular-room-visual-kit-plan.md)
define future six-piece modular kits with three complete coordinated families.
This replaces fixed bottom-center whole-room overlay assumptions for new kit
authoring, with prompt export now implemented; renderer adoption in this sandbox remains pending.
Current full-frame overlays remain legacy presentation assets. Applying kits to
joined base rooms must preserve physical child-room and Core Set identity.
The [provisional art contract](../../docs/offworld-modular-room-visual-kit-contract.md)
corrects CT2/CT3 to 24 units and specifies exact registration. Use the new
room-kit-prompts command for modular authoring; renderer/ingestion adoption
remains a separate planned step.

## Reuse existing assets

Reuse `floor-indoor`, `floor-lab`, `wall`, `corner`, `door`, `door-open`, `gate`,
`gate-open`, `console`, `generator`, `test-rig`, `crate`, `bed`, `terminal`,
`medical`, `security` and the existing people. Do not request whole-room paintings
or unique variants for every room type. The 80px room grid scales the shared 100
world-unit cell; source pixels do not redefine room footprints.

Labels, room numbers, CT1/CT2/CT3 border colors, staffing counts, selection,
joinability and join-destination highlights remain UI overlays. Physical child
rooms and joins keep their existing identity and geometry. Geology art must obey
the room simulator's visibility rules when connected; a hidden tile must not
reveal its specific geology merely because its sprite exists.

## Room coverage

The focused ready queue is `artwork/room-sprite-prompts-v1/`: six furnishings
and 13 geology tiles, using current three-design variation instructions and
strict per-key ZIP/source names. Export it with `prepare-sprite.mjs room-prompts
[--out directory]`. Existing queues and installed art are preserved.

| Authored room | Floor | Reusable furnishing sprites |
| --- | --- | --- |
| Analysis | floor-lab | test-rig, console |
| Containment | floor-lab | containment-cabinet |
| Data Storage | floor-indoor | terminal, storage-rack |
| Equipment Storage | floor-indoor | storage-rack, crate |
| Gate Room | floor-indoor | gate / gate-open, console |
| Holding | floor-indoor | holding-bench, security |
| Infirmary | floor-lab | bed, medical |
| Living Quarters | floor-indoor | bunk |
| Maintenance | floor-indoor | workbench, generator |
| Material Storage | floor-indoor | storage-rack, crate |
| Ration Storage | floor-indoor | storage-rack, crate |
| Receiving | floor-indoor | crate, console |
| Research | floor-lab | research-desk, terminal |
| Response Room | floor-indoor | storage-rack, security |
| Supply Storage | floor-indoor | storage-rack, crate |
| Tech Platform | floor-lab | test-rig, console |
| Workshop | floor-indoor | workbench |

These mappings identify art requirements; they do not instantiate equipment,
select Gate state, assign personnel or grant scientific Knowledge.

## Additional generation keys

Six isolated furnishings use 1024×1024 RGBA sources and 128×128 runtime PNGs,
center pivot, 8px transparent runtime padding, no baked room backdrop:

| Key | World footprint |
| --- | --- |
| containment-cabinet | 30×30 |
| storage-rack | 30×30 |
| research-desk | 30×30 |
| workbench | 30×30 |
| bunk | 26×26 |
| holding-bench | 26×26 |

Thirteen opaque terrain swatches cover every current `base_tiles.json` entry.
Each uses a 1024×1024 source, 128×128 runtime, 100×100 world footprint, zero padding,
uniform illumination and matching opposite edges:

| Authored tile ID | Generation key |
| --- | --- |
| unexcavated_rock | floor-base-unexcavated-rock |
| hard_rock | floor-base-hard-rock |
| bedrock | floor-base-bedrock |
| excavated_empty | floor-base-excavated-empty |
| void | floor-base-void |
| collapsed_prefab | floor-base-collapsed-prefab |
| outside_edge | floor-base-outside-edge |
| mineral_zone | floor-base-mineral-zone |
| unstable_rock | floor-base-unstable-rock |
| metal_vein | floor-base-metal-vein |
| anomalous_geology | floor-base-anomalous-geology |
| flooded_void | floor-base-flooded-void |
| reinforced_excavated | floor-base-reinforced-excavated |

The complete refreshed queue is `artwork/sprite-prompts-v2/`: 48 requests for 50
assets, with matching Door/Gate states combined. Requests 01–29 remain the original
Offworld queue; 30–48 are the room additions. Upload each numbered text separately.
The original folder is retained so work already in progress remains usable.

Generate a later complete queue into a fresh directory:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs prompts --out artwork/sprite-prompts-v3
```

Browse placeholders and incoming variants in `/demos/sprite-viewer/`. The
[shared production contract](../offworld-sandbox/SPRITE_PRODUCTION_CONTRACT.md)
controls naming, ZIPs, preparation and validation for these additions too.

## Whole-room interior tile studies

[Room tile prompts](../../artwork/room-tile-prompts-v2/README.md) request three
complete alternative furnishing overlays in one transparent RGBA horizontal image, Analysis first.
Ground and empty space are transparent; the tile system supplies the floor separately.
Each variant leaves a clear bottom-center doorway area and approach. Walls, doors, people and movable props
remain separate. This queue uses a single sheet rather than the ordinary sprite
ZIP contract. Export fresh text with:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-tile-prompts --out artwork/room-tile-prompts-v3
```

Preserve full square frames when splitting: current `--tiles` requires opacity,
and ordinary sprite splitting crops/recenters, so neither supports this revised queue.
These are review studies, pending runtime registration and removal of matching
furniture overlays when the room tiles are integrated.

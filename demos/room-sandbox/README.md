# Room Sandbox

Browser prototype for testing Stargate base room footprints.

## Modular tile test

### Shared architecture + separate Infirmary trial

Choose **Composition → Shared walls + Infirmary** to compare the new layers in
1×1, 1×2/2×1 and 2×2. The three wall families are reusable architecture;
Infirmary cots and closed medical supply cases are separate furniture. Independent
family controls and furniture visibility let you judge each layer on its own.
Missing artwork is explicitly marked **SCHEMATIC PLACEHOLDERS**.

Generate the four shared-wall pieces per family first, then the four Infirmary
furniture pieces. Ready [prompts and guides](../../artwork/room-layer-prompts-v1/README.md)
begin and end with the mandatory clickable-download instruction and exact filename.
Use **Load shared walls** and **Load Infirmary furniture** separately, selecting
all four pieces for at least one complete family. Import validates the actual
structure/furniture masks and rejects channels, doorway intrusions and wall pixels
in furniture. No CENTER/EDGE_OPEN files are needed in these separate layers.

The existing combined-room mode and original art remain available. The trial uses
the existing Material Storage leaves as a labeled shared-door comparison; new
architecture finishes may need their own leaves. Furniture is decorative and
introduces no medical Services, physical inventory or capacity rules.

Export a fresh queue with `node demos/room-sandbox/export-room-layers.mjs --out <fresh-directory>`.
Contract: `demos/shared/sprites/room-layer-contract.mjs`; preview: `room-layer-study.mjs`.

### Existing combined room tiles

Open **Modular tile test** from the Room Simulator, or go directly to
`http://127.0.0.1:8001/demos/room-sandbox/room-kit.html` after starting
`node demos/serve.mjs`. The Material Storage first batch is already copied into
`artwork/room-kit-studies/material-storage/b001/`; Downloads originals are untouched.

The page compares 1×1, 1×2 and 2×2 layouts simultaneously. Choose a coordinated
family, CT and display size. Click or keyboard-activate any outer edge to toggle
its door; presets cover no doors, adjacent/opposite doors and every outer edge.
Rotate layouts or switch the pair between horizontal and vertical. Module guides
show the full-frame registration and 32/64/32 bands. Source checks report missing
families, invalid bounds and doorway/CT-channel intrusions. **Load another kit
batch** accepts the six named source PNGs for each family you want to compare;
file selections stay in the page until reload.

**Light treatment** defaults to an inset reference study: discrete dark housings,
bright cores and restrained glow on exterior non-door wall modules. CT1 uses one
8-unit lamp, CT2 two 6-unit lamps, and CT3 one 16-unit lamp in a centered 24-unit
run. Unused channel space is backed with shaded neutral metal; each lamp has
its own close-fitting bezel rather than one oversized dark recess. Corners and
intervening channels remain neutral. Choose **Continuous ·
original** to compare the original perimeter repeat. This optional presentation
study changes the placement from the provisional continuous-channel contract;
it does not rewrite source PNGs or prompt geometry. Door openings stay clear:
the reference's light across a door header would need a separate approved door
design. The richer bevels/materials in the reference would also require revised
source artwork; lighting alone does not reproduce that finish.

This is a presentation study: cells represent joined physical children without
changing saved rooms, Core Sets, connectivity or the active sprite registry.
Sources render from unchanged 1024-square frames to make seam review possible;
production normalization and Offworld adoption remain separate. CT underlays use
the provisional contract with the closing phase seam at northwest.

**Doors: open / closed** toggles all preview door leaves without changing the
layout. Open leaves retract behind the fixed frame. Material Storage's three
closed-leaf families load automatically from
`artwork/room-kit-studies/material-storage/door-leaves-b001/`.
**Load door leaf artwork** lets you compare replacement PNGs; missing families
use a labeled schematic placeholder.
That separate picker accepts `material-storage-door-leaf-closed__vNN__source.png`
and optional empty `material-storage-door-leaf-open__vNN__source.png` files.
Families match automatically; missing artwork retains the placeholder. Files
stay in the page session and are not installed in the active sprite registry.
Sources retain a 1024×1024 RGBA frame; leaf pixels must fit x=384..640, y=0..96
(exclusive endpoints), corresponding to the existing 32-unit opening and
12-unit wall depth. This depth is a provisional presentation fit, not gameplay.
Material Storage's [three ready generation prompts](../../artwork/room-kit-door-prompts-v1/material-storage/README.md)
specify matching references, filenames and empty-open behavior.

To copy a future complete batch (requires Python/Pillow), use a fresh output path:

```bash
python demos/room-sandbox/import-room-kit.py --kit material-storage \
  --source /c/Users/Powel/Downloads \
  --out artwork/room-kit-studies/material-storage/b002
node --test demos/room-sandbox/*.test.mjs
node demos/room-sandbox/browser-smoke.mjs --kit
```

The importer preserves bytes and writes a provenance/validation report. Fresh
batches can be selected through the file picker; the default stays on b001.

The [shared sprite requirements](SPRITE_REQUIREMENTS.md) cover all current room
types and geology states, reusing Offworld assets and adding 19 generation keys.
The refreshed prompt queue is `artwork/sprite-prompts-v2/`; the Sprite Viewer
displays these additions. **View: Sprites** is now the default; switch to
**View: Schematic** for the original presentation. The sprite adapter uses
Offworld's exact shared image/variant/fallback primitives and manifest, so
installed, unrejected variants appear after a browser refresh.

Installed `floor-room-*` authored interiors now render as transparent furnishing
overlays above the separate floor and below walls and CT/selection outlines.
They replace the individual room props, avoiding duplicate furniture. Rooms with
no eligible installed interior retain their existing furnishings. One complete
overlay spans the continuous 3x3 Gate Room; joined physical rooms retain separate
interiors and identities. Single-door interiors rotate their authored south-facing
clearance with the room's door. Multi-door rooms retain the authored orientation.
Room definitions can set `form.renderMode: "continuous"` to render one surface
across the entire physical footprint, in both sprite and schematic views. The
default `"tiled"` mode retains per-cell surfaces. This presentation property
does not merge rooms, change joining, or grant Services. Continuous rooms support
explicit door lists and a normal rotating single door. Cultural Platform uses
this property for its 2×2 footprint, retaining the recorded Tech Platform Core
structure without new cultural capabilities. It appears in the room selector
and generated layouts; saved layouts are not changed automatically. Select an
interior variant in Sprite Viewer to install its prepared furnishings.
Layout generation instantiates each multi-cell footprint once, rather than
creating overlapping copies at each cell. Cultural Platform currently has no
fallback furniture; its floor, walls and door remain visible before installation.

Ready room-only generation requests are in `artwork/room-sprite-prompts-v1/`:
six furnishings followed by 13 geology tiles. Upload each numbered prompt
separately. To export a fresh queue without replacing existing files:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-prompts --out artwork/room-sprite-prompts-v2
```

Floors, exposed walls/corners, doors, room furnishings and visible geology use
the shared assets. Variant picks remain stable during selection, rotation,
joining and redraw; page load, Generate Layout, Reset and Reload shared base
start fresh choices. Missing art uses the shared generic fallback.
Staff sprites are generic markers for the existing staff count, not identified
personnel or inferred Profession assignments. The Gate is displayed inactive
because no Gate connection state exists here. Physical child rooms, Groups,
CT/selection outlines, labels, capacity and excavation rules remain unchanged.

## Structure

- `../shared/data/rooms_schema.json`: shared room catalog using the nested schema baseline.
- `../shared/data/room.schema.json`: authoring schema for creating new room definitions.
- `../shared/js/rooms.js`: reusable room validation, lookup, loading, and joining rules.
- `room-sandbox.js`: sandbox-only placement/rendering behavior.
- `sprite-presentation.mjs`: room/geology visual adapter to shared sprite primitives.

## Current rules

- 80x80 px grid cells.
- On smaller screens, the same 12x10 logical grid scales its cells down to fit the available width; desktop remains at 80px cells.
- Rooms visually occupy most of their tile footprint, leaving implied navigable space around them rather than using dedicated hallway cells.
- Same non-null join group and matching Construction Tier (CT) make adjacent rooms compatible candidates for a deliberate join.
- Rooms with `constructionLimit: "unique"` can only be placed once and cannot join.
- Legal joined Groups are 1x2 pairs or 2x2 Groups built from two existing 1x2 Groups.
- Joined rooms consume only shared padding while unjoined adjacent rooms retain their separation.
- Splitting reverses the stored Group hierarchy without recreating physical rooms.
- Exposed edges are split visually into three sections.
- Doors occupy the middle edge section.
- Rotate moves the selected door clockwise: North -> East -> South -> West.
- The Gate Room renders as one continuous 3x3 room with a centered label and five randomized perimeter doors.
- Gate door markers are compact and centered on their 80px perimeter segment.
- The Upgrade CT action advances a selected physical room by one Construction Tier, up to `maxConstructionTier`.
- Upgrading a selected Group advances every physical child together, and joining requires matching CTs.
- CT uses a consistent wall thickness and is represented by border color: CT1 steel, CT2 blue, and CT3 amber/gold.
- Staff dots show the current staffing tier and shift toward the common interior of joined Groups.
- Joinable rooms use dotted walls; category palettes visually group related room types.
- The join destination has its own highlight and can be changed from the grid or candidate dropdown.
- Generate Layout procedurally builds a new base from scratch on every click, with randomized Gate placement, direct Gate-adjacent access rooms, zoned room placement, joined groups, CT, and staffing. Every catalog room type appears at least once, including room types added to the catalog later. Infirmary and Receiving remain direct Gate neighbors in every layout.
- The rolling action log can copy both recent steps and the full current sandbox state for debugging.

## Run

The sandbox uses an ES module and loads the shared room catalog with `fetch`, so
opening `index.html` directly from the filesystem will not work. Serve the
repository root with the shared writable demo server instead:

`node demos/serve.mjs`

Then open:

`http://127.0.0.1:8001/demos/room-sandbox/`

All demos are available at `/demos/` on this server. **Save shared base** writes
validated JSON locally. See `../README.md` for custom ports and static-hosting limits.

## Checks

```bash
node --test demos/room-sandbox/*.test.mjs demos/offworld-sandbox/sprite-renderer.test.mjs demos/offworld-sandbox/variant-selection.test.mjs
node demos/room-sandbox/browser-smoke.mjs
```

The browser check blocks save requests and uses a temporary browser profile.
`ROOM_SPRITE_REVIEW=1 node demos/room-sandbox/browser-smoke.mjs` also saves a
temporary screenshot for visual review.

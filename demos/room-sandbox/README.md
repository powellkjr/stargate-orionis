# Room Sandbox

Browser prototype for testing Stargate base room footprints.

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
